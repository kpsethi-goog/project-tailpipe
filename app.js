// Mind Map Slide Generator - App Logic

// ==================== State Management ====================

const state = {
    currentView: 'upload',
    documentTitle: '',
    documentContent: '',
    mindMapData: null,
    currentSlide: 0,
    selectedNode: null
};

// ==================== Sample Data ====================

const sampleDocument = {
    title: "Q4 Product Strategy Recommendation",
    content: `
Based on our analysis of market trends, customer feedback, and competitive landscape,
we recommend focusing Q4 development efforts on mobile-first features.

Our research shows that 68% of our users now access the platform primarily via mobile devices,
up from 45% last year. Customer support tickets related to mobile experience have increased
by 40% quarter-over-quarter.

Competitors like Acme Corp and Beta Inc have recently launched significant mobile updates,
capturing market share in the 25-34 demographic where we've seen a 12% decline.

The proposed mobile-first strategy includes three key initiatives:
1. Responsive redesign of the dashboard - our most-used feature
2. Native mobile app with offline capabilities
3. Mobile-optimized checkout flow to reduce cart abandonment (currently at 67% on mobile vs 34% on desktop)

Investment required: $2.4M over Q4
Expected ROI: 15% increase in mobile conversion within 6 months
Risk: Medium - requires reallocation from desktop feature backlog
`
};

// ==================== DOM Elements ====================

const elements = {
    uploadView: document.getElementById('upload-view'),
    mindmapView: document.getElementById('mindmap-view'),
    slidesView: document.getElementById('slides-view'),
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    demoBtn: document.getElementById('demo-btn'),
    backBtn: document.getElementById('back-btn'),
    generateBtn: document.getElementById('generate-btn'),
    backToMapBtn: document.getElementById('back-to-map-btn'),
    exportBtn: document.getElementById('export-btn'),
    addNodeBtn: document.getElementById('add-node-btn'),
    docTitle: document.getElementById('doc-title'),
    mindmapCanvas: document.getElementById('mindmap-canvas'),
    slideThumbnails: document.getElementById('slide-thumbnails'),
    slidePreview: document.getElementById('slide-preview'),
    contextMenu: document.getElementById('context-menu'),
    loadingOverlay: document.getElementById('loading-overlay'),
    loadingText: document.getElementById('loading-text'),
    steps: document.querySelectorAll('.step')
};

// ==================== View Management ====================

function showView(viewName) {
    state.currentView = viewName;

    // Hide all views
    elements.uploadView.classList.remove('active');
    elements.mindmapView.classList.remove('active');
    elements.slidesView.classList.remove('active');

    // Update step indicators
    elements.steps.forEach(step => {
        step.classList.remove('active', 'completed');
    });

    // Show requested view and update steps
    switch(viewName) {
        case 'upload':
            elements.uploadView.classList.add('active');
            elements.steps[0].classList.add('active');
            break;
        case 'mindmap':
            elements.mindmapView.classList.add('active');
            elements.steps[0].classList.add('completed');
            elements.steps[1].classList.add('active');
            break;
        case 'slides':
            elements.slidesView.classList.add('active');
            elements.steps[0].classList.add('completed');
            elements.steps[1].classList.add('completed');
            elements.steps[2].classList.add('active');
            break;
    }
}

function showLoading(message = 'Processing...') {
    elements.loadingText.textContent = message;
    elements.loadingOverlay.classList.add('show');
}

function hideLoading() {
    elements.loadingOverlay.classList.remove('show');
}

// ==================== API Integration ====================

async function analyzeDocumentWithAI(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze document');
    }

    return response.json();
}

async function analyzeTextWithAI(title, content) {
    const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze document');
    }

    return response.json();
}

async function checkApiHealth() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        return data;
    } catch {
        return { status: 'error', hasApiKey: false };
    }
}

// ==================== Mind Map Rendering ====================

function renderMindMap() {
    if (!state.mindMapData) return;

    elements.mindmapCanvas.innerHTML = '';

    // Create SVG container for connection lines
    const svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgContainer.classList.add('connections-svg');
    svgContainer.id = 'connections-svg';
    elements.mindmapCanvas.appendChild(svgContainer);

    // Create pyramid levels
    const levels = [[], [], []];

    // Level 0: Root node
    levels[0].push(state.mindMapData);

    // Level 1: Key arguments
    if (state.mindMapData.children) {
        levels[1] = state.mindMapData.children;
    }

    // Level 2: Supporting evidence
    state.mindMapData.children?.forEach(arg => {
        if (arg.children) {
            levels[2] = levels[2].concat(arg.children);
        }
    });

    // Render each level
    levels.forEach((nodes, levelIndex) => {
        if (nodes.length === 0) return;

        const levelDiv = document.createElement('div');
        levelDiv.className = `pyramid-level level-${levelIndex}`;

        nodes.forEach(node => {
            const nodeEl = createNodeElement(node, levelIndex);
            levelDiv.appendChild(nodeEl);
        });

        elements.mindmapCanvas.appendChild(levelDiv);
    });

    // Draw connections after a short delay to ensure DOM is rendered
    setTimeout(() => drawConnections(), 50);
}

function drawConnections() {
    const svg = document.getElementById('connections-svg');
    if (!svg || !state.mindMapData) return;

    // Clear existing connections
    svg.innerHTML = '';

    // Get canvas bounds for positioning
    const canvasRect = elements.mindmapCanvas.getBoundingClientRect();

    // Draw connections from root to level 1
    const rootNode = document.querySelector('[data-id="root"]');
    if (!rootNode) return;

    const rootRect = rootNode.getBoundingClientRect();
    const rootCenterX = rootRect.left + rootRect.width / 2 - canvasRect.left;
    const rootBottom = rootRect.bottom - canvasRect.top;

    // Connect to each level 1 node
    state.mindMapData.children?.forEach(arg => {
        const argNode = document.querySelector(`[data-id="${arg.id}"]`);
        if (!argNode) return;

        const argRect = argNode.getBoundingClientRect();
        const argCenterX = argRect.left + argRect.width / 2 - canvasRect.left;
        const argTop = argRect.top - canvasRect.top;

        // Draw curved line
        const path = createCurvedPath(rootCenterX, rootBottom, argCenterX, argTop);
        path.classList.add('connection-line', 'connection-level-0');
        svg.appendChild(path);

        // Connect level 1 to level 2
        arg.children?.forEach(evidence => {
            const evidenceNode = document.querySelector(`[data-id="${evidence.id}"]`);
            if (!evidenceNode) return;

            const evidenceRect = evidenceNode.getBoundingClientRect();
            const evidenceCenterX = evidenceRect.left + evidenceRect.width / 2 - canvasRect.left;
            const evidenceTop = evidenceRect.top - canvasRect.top;
            const argBottom = argRect.bottom - canvasRect.top;

            const subPath = createCurvedPath(argCenterX, argBottom, evidenceCenterX, evidenceTop);
            subPath.classList.add('connection-line', 'connection-level-1');
            svg.appendChild(subPath);
        });
    });
}

function createCurvedPath(x1, y1, x2, y2) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // Calculate control points for a smooth curve
    const curveStrength = Math.min(Math.abs(y2 - y1) * 0.4, 40);

    const d = `M ${x1} ${y1}
               C ${x1} ${y1 + curveStrength},
                 ${x2} ${y2 - curveStrength},
                 ${x2} ${y2}`;

    path.setAttribute('d', d);
    return path;
}

function createNodeElement(node, level) {
    const nodeEl = document.createElement('div');
    nodeEl.className = `node level-${level}`;
    nodeEl.dataset.id = node.id;
    nodeEl.draggable = true;

    const hasChildren = node.children && node.children.length > 0;
    const isRoot = level === 0;

    // NotebookLM style: left arrow for root, right arrow for children
    let arrowsHTML = '';
    if (isRoot && hasChildren) {
        arrowsHTML = `<span class="node-arrow left">&lt;</span>`;
    }

    const rightArrowHTML = hasChildren && !isRoot
        ? `<span class="node-arrow right">&gt;</span>`
        : (level < 2 ? `<span class="node-arrow right" style="opacity: 0.3">&gt;</span>` : '');

    nodeEl.innerHTML = `
        ${arrowsHTML}
        <div class="node-content" contenteditable="true">${node.content}</div>
        ${rightArrowHTML}
    `;

    // Event listeners
    const contentEl = nodeEl.querySelector('.node-content');

    contentEl.addEventListener('blur', () => {
        updateNodeContent(node.id, contentEl.textContent);
    });

    contentEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            contentEl.blur();
        }
    });

    nodeEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e, node);
    });

    // Drag and drop
    nodeEl.addEventListener('dragstart', (e) => handleDragStart(e, node));
    nodeEl.addEventListener('dragend', handleDragEnd);
    nodeEl.addEventListener('dragover', handleDragOver);
    nodeEl.addEventListener('dragleave', handleDragLeave);
    nodeEl.addEventListener('drop', (e) => handleDrop(e, node));

    return nodeEl;
}

function updateNodeContent(nodeId, newContent) {
    function updateInTree(node) {
        if (node.id === nodeId) {
            node.content = newContent;
            return true;
        }
        if (node.children) {
            for (const child of node.children) {
                if (updateInTree(child)) return true;
            }
        }
        return false;
    }

    updateInTree(state.mindMapData);
}

// ==================== Drag and Drop ====================

let draggedNode = null;

function handleDragStart(e, node) {
    draggedNode = node;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.node').forEach(n => n.classList.remove('drag-over'));
    draggedNode = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e, targetNode) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    if (!draggedNode || draggedNode.id === targetNode.id) return;
    if (draggedNode.level !== targetNode.level) return; // Only swap within same level

    // Swap nodes in the tree
    swapNodes(draggedNode.id, targetNode.id);
    renderMindMap();
}

function swapNodes(id1, id2) {
    function findParentAndIndex(nodeId, parent = null, tree = state.mindMapData) {
        if (tree.id === nodeId) {
            return { parent, node: tree, index: -1 };
        }
        if (tree.children) {
            for (let i = 0; i < tree.children.length; i++) {
                if (tree.children[i].id === nodeId) {
                    return { parent: tree, node: tree.children[i], index: i };
                }
                const result = findParentAndIndex(nodeId, tree, tree.children[i]);
                if (result) return result;
            }
        }
        return null;
    }

    const loc1 = findParentAndIndex(id1);
    const loc2 = findParentAndIndex(id2);

    if (loc1 && loc2 && loc1.parent === loc2.parent && loc1.parent) {
        // Swap in same parent
        const temp = loc1.parent.children[loc1.index];
        loc1.parent.children[loc1.index] = loc1.parent.children[loc2.index];
        loc1.parent.children[loc2.index] = temp;
    }
}

// ==================== Context Menu ====================

function showContextMenu(e, node) {
    state.selectedNode = node;

    elements.contextMenu.style.left = `${e.clientX}px`;
    elements.contextMenu.style.top = `${e.clientY}px`;
    elements.contextMenu.classList.add('show');
}

function hideContextMenu() {
    elements.contextMenu.classList.remove('show');
    state.selectedNode = null;
}

function handleContextAction(action) {
    if (!state.selectedNode) return;

    switch(action) {
        case 'edit':
            const nodeEl = document.querySelector(`[data-id="${state.selectedNode.id}"] .node-content`);
            if (nodeEl) {
                nodeEl.focus();
                // Select all text
                const range = document.createRange();
                range.selectNodeContents(nodeEl);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
            break;

        case 'add-child':
            addChildNode(state.selectedNode);
            break;

        case 'add-sibling':
            addSiblingNode(state.selectedNode);
            break;

        case 'delete':
            deleteNode(state.selectedNode);
            break;
    }

    hideContextMenu();
}

function addChildNode(parentNode) {
    if (parentNode.level >= 2) return; // Max depth

    const newNode = {
        id: `node-${Date.now()}`,
        level: parentNode.level + 1,
        label: parentNode.level === 0 ? 'Key Argument' : 'Evidence',
        content: 'New item - click to edit',
        children: []
    };

    if (!parentNode.children) parentNode.children = [];
    parentNode.children.push(newNode);

    renderMindMap();
}

function addSiblingNode(node) {
    function findParent(nodeId, tree = state.mindMapData) {
        if (tree.children) {
            for (const child of tree.children) {
                if (child.id === nodeId) return tree;
                const result = findParent(nodeId, child);
                if (result) return result;
            }
        }
        return null;
    }

    const parent = findParent(node.id);
    if (!parent) return;

    const newNode = {
        id: `node-${Date.now()}`,
        level: node.level,
        label: node.label,
        content: 'New item - click to edit',
        children: []
    };

    const index = parent.children.findIndex(c => c.id === node.id);
    parent.children.splice(index + 1, 0, newNode);

    renderMindMap();
}

function deleteNode(node) {
    if (node.level === 0) {
        alert('Cannot delete the main message node');
        return;
    }

    function removeFromTree(nodeId, tree = state.mindMapData) {
        if (tree.children) {
            const index = tree.children.findIndex(c => c.id === nodeId);
            if (index !== -1) {
                tree.children.splice(index, 1);
                return true;
            }
            for (const child of tree.children) {
                if (removeFromTree(nodeId, child)) return true;
            }
        }
        return false;
    }

    removeFromTree(node.id);
    renderMindMap();
}

// ==================== Slide Generation ====================

function generateSlides() {
    const slides = [];

    // Title slide
    slides.push({
        type: 'title',
        title: state.documentTitle,
        subtitle: 'Executive Summary'
    });

    // Executive summary slide (main message)
    slides.push({
        type: 'content',
        title: 'Recommendation',
        points: [state.mindMapData.content]
    });

    // Key arguments slides
    if (state.mindMapData.children) {
        state.mindMapData.children.forEach((arg, index) => {
            const points = [arg.content];

            // Add evidence as sub-points
            if (arg.children) {
                arg.children.forEach(evidence => {
                    points.push(evidence.content);
                });
            }

            slides.push({
                type: 'content',
                title: arg.label || `Key Point ${index + 1}`,
                points: points
            });
        });
    }

    // Summary slide
    slides.push({
        type: 'content',
        title: 'Summary',
        points: state.mindMapData.children?.map(arg => arg.content) || []
    });

    return slides;
}

function renderSlides(slides) {
    // Render thumbnails
    elements.slideThumbnails.innerHTML = '';

    slides.forEach((slide, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = `slide-thumbnail ${index === state.currentSlide ? 'active' : ''}`;
        thumbnail.innerHTML = `
            <div class="slide-thumbnail-title">${slide.title}</div>
            <div class="slide-thumbnail-content">
                ${slide.type === 'title' ? slide.subtitle : (slide.points?.[0]?.substring(0, 50) || '')}...
            </div>
        `;

        thumbnail.addEventListener('click', () => {
            state.currentSlide = index;
            renderSlides(slides);
        });

        elements.slideThumbnails.appendChild(thumbnail);
    });

    // Render current slide
    const currentSlide = slides[state.currentSlide];

    if (currentSlide.type === 'title') {
        elements.slidePreview.innerHTML = `
            <div class="slide-card title-slide">
                <h1>${currentSlide.title}</h1>
                <p>${currentSlide.subtitle}</p>
            </div>
        `;
    } else {
        elements.slidePreview.innerHTML = `
            <div class="slide-card content-slide">
                <h2>${currentSlide.title}</h2>
                <ul>
                    ${currentSlide.points.map(point => `<li>${point}</li>`).join('')}
                </ul>
            </div>
        `;
    }
}

// ==================== File Handling ====================

async function handleFileUpload(file) {
    showLoading('Reading document...');

    try {
        showLoading('Analyzing with Gemini AI...');

        // Send file to backend for AI analysis
        const result = await analyzeDocumentWithAI(file);

        state.documentTitle = result.title;
        state.mindMapData = result.pyramid;

        hideLoading();
        elements.docTitle.textContent = state.documentTitle;
        renderMindMap();
        showView('mindmap');

    } catch (error) {
        hideLoading();
        console.error('Analysis error:', error);
        alert('Error analyzing document: ' + error.message + '\n\nMake sure the server is running with GEMINI_API_KEY set.');
    }
}

async function loadDemoDocument() {
    showLoading('Analyzing sample document with Gemini AI...');

    try {
        // Send sample document to backend for AI analysis
        const result = await analyzeTextWithAI(
            sampleDocument.title,
            sampleDocument.content
        );

        state.documentTitle = result.title;
        state.documentContent = sampleDocument.content;
        state.mindMapData = result.pyramid;

        hideLoading();
        elements.docTitle.textContent = state.documentTitle;
        renderMindMap();
        showView('mindmap');

    } catch (error) {
        hideLoading();
        console.error('Analysis error:', error);
        alert('Error analyzing document: ' + error.message + '\n\nMake sure the server is running with GEMINI_API_KEY set.');
    }
}

// ==================== Export ====================

function exportSlides() {
    const slides = generateSlides();

    // Create a simple HTML export
    let html = `
<!DOCTYPE html>
<html>
<head>
    <title>${state.documentTitle} - Slides</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .slide {
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 60px;
            box-sizing: border-box;
            page-break-after: always;
        }
        .title-slide {
            background: linear-gradient(135deg, #4F46E5, #7C3AED);
            color: white;
            text-align: center;
            align-items: center;
        }
        .title-slide h1 { font-size: 48px; margin-bottom: 20px; }
        .title-slide p { font-size: 24px; opacity: 0.9; }
        .content-slide h2 { font-size: 36px; color: #4F46E5; margin-bottom: 40px; }
        .content-slide ul { list-style: none; padding: 0; }
        .content-slide li {
            font-size: 24px;
            margin-bottom: 20px;
            padding-left: 30px;
            position: relative;
        }
        .content-slide li::before {
            content: '';
            width: 12px;
            height: 12px;
            background: #4F46E5;
            border-radius: 50%;
            position: absolute;
            left: 0;
            top: 10px;
        }
    </style>
</head>
<body>
`;

    slides.forEach(slide => {
        if (slide.type === 'title') {
            html += `
    <div class="slide title-slide">
        <h1>${slide.title}</h1>
        <p>${slide.subtitle}</p>
    </div>
`;
        } else {
            html += `
    <div class="slide content-slide">
        <h2>${slide.title}</h2>
        <ul>
            ${slide.points.map(p => `<li>${p}</li>`).join('\n            ')}
        </ul>
    </div>
`;
        }
    });

    html += `
</body>
</html>`;

    // Download the file
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.documentTitle.replace(/\s+/g, '-')}-slides.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==================== Event Listeners ====================

// File upload
elements.dropZone.addEventListener('click', () => elements.fileInput.click());

elements.fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileUpload(e.target.files[0]);
    }
});

elements.dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.dropZone.classList.add('dragover');
});

elements.dropZone.addEventListener('dragleave', () => {
    elements.dropZone.classList.remove('dragover');
});

elements.dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.dropZone.classList.remove('dragover');

    if (e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files[0]);
    }
});

// Demo button
elements.demoBtn.addEventListener('click', loadDemoDocument);

// Navigation
elements.backBtn.addEventListener('click', () => showView('upload'));

elements.generateBtn.addEventListener('click', () => {
    state.currentSlide = 0;
    const slides = generateSlides();
    renderSlides(slides);
    showView('slides');
});

elements.backToMapBtn.addEventListener('click', () => showView('mindmap'));

elements.exportBtn.addEventListener('click', exportSlides);

// Add node button
elements.addNodeBtn.addEventListener('click', () => {
    if (state.mindMapData && state.mindMapData.children) {
        const newArg = {
            id: `arg-${Date.now()}`,
            level: 1,
            label: 'Key Argument',
            content: 'New argument - click to edit',
            children: []
        };
        state.mindMapData.children.push(newArg);
        renderMindMap();
    }
});

// Context menu
elements.contextMenu.querySelectorAll('.context-item').forEach(item => {
    item.addEventListener('click', () => {
        handleContextAction(item.dataset.action);
    });
});

document.addEventListener('click', (e) => {
    if (!elements.contextMenu.contains(e.target)) {
        hideContextMenu();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideContextMenu();
    }
});

// Initialize
showView('upload');
