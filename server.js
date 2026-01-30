import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

// Minto Pyramid extraction prompt
const MINTO_PYRAMID_PROMPT = `You are an expert at the Minto Pyramid Principle, developed by Barbara Minto at McKinsey.

Analyze the following document and extract its content into a Minto Pyramid structure. The pyramid should follow the "answer first" approach:

1. **Main Message (Level 0)**: The single most important conclusion, recommendation, or "so what" of the document. This should be what an executive needs to know if they only read one sentence.

2. **Key Arguments (Level 1)**: 3-4 supporting arguments that directly support the main message. Each should be a distinct, mutually exclusive point that together comprehensively support the main message (MECE principle).

3. **Supporting Evidence (Level 2)**: For each key argument, provide 1-2 pieces of specific evidence, data points, or examples from the document.

IMPORTANT GUIDELINES:
- Extract ACTUAL content from the document - don't make things up
- The main message should be a recommendation or conclusion, not a topic description
- Key arguments should answer "why" or "how" the main message is true
- Evidence should be specific facts, numbers, or quotes from the document
- If the document doesn't have a clear recommendation, synthesize one from the content
- Keep each node concise (1-2 sentences max)

Respond with ONLY valid JSON in this exact format:
{
  "title": "Document title or topic",
  "pyramid": {
    "id": "root",
    "level": 0,
    "label": "Main Message",
    "content": "The main recommendation or conclusion",
    "children": [
      {
        "id": "arg-1",
        "level": 1,
        "label": "Key Argument 1",
        "content": "First supporting argument",
        "children": [
          {
            "id": "evidence-1-1",
            "level": 2,
            "label": "Evidence",
            "content": "Supporting data or fact",
            "children": []
          }
        ]
      },
      {
        "id": "arg-2",
        "level": 1,
        "label": "Key Argument 2",
        "content": "Second supporting argument",
        "children": []
      },
      {
        "id": "arg-3",
        "level": 1,
        "label": "Key Argument 3",
        "content": "Third supporting argument",
        "children": []
      }
    ]
  }
}

DOCUMENT TO ANALYZE:
`;

// API endpoint to analyze document
app.post('/api/analyze', upload.single('file'), async (req, res) => {
    try {
        let documentContent = '';
        let documentTitle = 'Untitled Document';

        // Handle file upload or text content
        if (req.file) {
            documentTitle = req.file.originalname.replace(/\.[^/.]+$/, '');

            if (req.file.mimetype === 'application/pdf') {
                // Dynamic import for pdf-parse
                const pdfParse = (await import('pdf-parse')).default;
                const pdfData = await pdfParse(req.file.buffer);
                documentContent = pdfData.text;
            } else {
                // Text or markdown file
                documentContent = req.file.buffer.toString('utf-8');
            }
        } else if (req.body.content) {
            documentContent = req.body.content;
            documentTitle = req.body.title || documentTitle;
        } else {
            return res.status(400).json({ error: 'No document provided' });
        }

        if (!documentContent.trim()) {
            return res.status(400).json({ error: 'Document is empty' });
        }

        console.log(`Analyzing document: ${documentTitle} (${documentContent.length} chars)`);

        // Call Gemini API
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const result = await model.generateContent(MINTO_PYRAMID_PROMPT + documentContent);
        const response = await result.response;
        let text = response.text();

        // Clean up the response - remove markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Parse the JSON response
        let pyramidData;
        try {
            pyramidData = JSON.parse(text);
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', text);
            return res.status(500).json({
                error: 'Failed to parse AI response',
                raw: text
            });
        }

        res.json({
            success: true,
            title: pyramidData.title || documentTitle,
            pyramid: pyramidData.pyramid
        });

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            error: error.message || 'Failed to analyze document'
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    const hasApiKey = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
    res.json({
        status: 'ok',
        hasApiKey,
        message: hasApiKey ? 'Ready' : 'Missing GEMINI_API_KEY environment variable'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🔺 Mind Map Slide Generator`);
    console.log(`   Server running at http://localhost:${PORT}`);
    console.log(`\n   Make sure GEMINI_API_KEY is set in your environment\n`);
});
