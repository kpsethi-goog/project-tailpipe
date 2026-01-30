# Project Tailpipe

**Minto Pyramid → Slides**

Transform documents into executive-ready presentations using the Minto Pyramid principle.

## What It Does

Most people structure presentations like research papers—building up from background to conclusions. This is backwards for executives who are time-poor and will interrupt if you bury the lead.

Project Tailpipe applies the **Minto Pyramid Principle** (developed at McKinsey): *Start with the answer, then provide supporting arguments, then evidence.*

### User Flow

1. **Upload** - Drop in a document (PDF, TXT, Markdown)
2. **Mind Map** - AI extracts and structures content into a visual pyramid
3. **Slides** - Generate a presentation from your refined structure

## The Minto Pyramid Structure

```
            ┌─────────────────┐
            │  MAIN MESSAGE   │  ← Start here (the "so what")
            │ (Recommendation)│
            └────────┬────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │ Key Arg │  │ Key Arg │  │ Key Arg │  ← Supporting arguments
   └────┬────┘  └────┬────┘  └────┬────┘
        │            │            │
     ┌──┴──┐      ┌──┴──┐      ┌──┴──┐
     ▼     ▼      ▼     ▼      ▼     ▼
   [Data] [Data] [Data] [Data] [Data] [Data]  ← Evidence & details
```

## Running Locally

```bash
# Install dependencies
npm install

# Set your Gemini API key
export GEMINI_API_KEY=your_api_key_here

# Start the server
npm start
```

Then open http://localhost:3000

## Deploy to Cloud Run

```bash
# Build and deploy
gcloud run deploy project-tailpipe \
  --source . \
  --set-env-vars GEMINI_API_KEY=your_api_key_here
```

## Tech Stack

- **Frontend**: Vanilla JS, CSS
- **Backend**: Node.js, Express
- **AI**: Google Gemini API
- **Deployment**: Docker, Cloud Run

## References

- [Minto Pyramid Principle](https://untools.co/minto-pyramid/)
- [McKinsey's Pyramid Framework](https://productmindset.substack.com/p/mckinseys-pyramid-principle)
