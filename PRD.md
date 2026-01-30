# Project Tailpipe

## NotebookLM: Minto Pyramid → Slides

### One-Pager PRD

---

## Problem Statement

When creating executive presentations, most people structure their slides like research papers—building up from background, through analysis, to conclusions. This is backwards for executive audiences.

**The reality:**
- Executives are time-poor and will interrupt if you bury the lead
- If your recommendation is on slide 12, they may never see it
- Questions derail bottom-up presentations; they enhance top-down ones

**The Minto Pyramid Principle** (developed at McKinsey) solves this: *"You think from the bottom up, but you present from the top down."* Start with the answer, then provide supporting arguments, then evidence.

**The gap:** Most people don't know this framework, and even those who do struggle to restructure their thinking. There's no tool that helps transform a document into pyramid-structured content.

---

## Solution

A new NotebookLM feature that transforms any uploaded document into a **Minto Pyramid mind map**, which users can then convert into a **slide deck**.

### User Flow

```
Upload Doc → AI generates Minto Pyramid Mind Map → User edits/refines → Generate Slide Deck
```

### Core Features

| Feature | Description |
|---------|-------------|
| **Document Analysis** | AI extracts key arguments, supporting points, and evidence from uploaded doc |
| **Pyramid Generation** | Auto-structures content into Minto hierarchy: Main Point → Key Arguments → Supporting Data |
| **Interactive Mind Map** | Visual, editable mind map where users can drag, reorder, add, or remove nodes |
| **Slide Generation** | One-click conversion from finalized mind map to presentation slides |

---

## How It Works

### The Minto Pyramid Structure

```
            ┌─────────────────┐
            │  MAIN MESSAGE   │  ← Start here (the "so what")
            │  (Recommendation)│
            └────────┬────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │ Key Arg │  │ Key Arg │  │ Key Arg │  ← Supporting arguments (3-5)
   │    1    │  │    2    │  │    3    │
   └────┬────┘  └────┬────┘  └────┬────┘
        │            │            │
     ┌──┴──┐      ┌──┴──┐      ┌──┴──┐
     ▼     ▼      ▼     ▼      ▼     ▼
   [Data] [Data] [Data] [Data] [Data] [Data]  ← Evidence & details
```

### SCQA Framework (for context extraction)

- **Situation**: What's the current state?
- **Complication**: What's the problem?
- **Question**: What needs to be answered?
- **Answer**: The recommendation (top of pyramid)

---

## Target Users

- **Primary**: Business professionals creating executive presentations
- **Secondary**: Consultants, analysts, product managers preparing stakeholder decks
- **Use case**: Transforming research, analysis docs, or meeting notes into exec-ready presentations

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time to first slide deck | < 5 minutes from doc upload |
| User edits on mind map | Avg 3-5 refinements (engagement signal) |
| Feature adoption | 20% of NotebookLM users try within first month |
| NPS for generated decks | > 40 |

---

## MVP Scope

**In Scope:**
- Single document upload (PDF, Google Doc, text)
- AI-generated pyramid mind map with 3 levels
- Drag-and-drop mind map editing
- Basic slide deck export (Google Slides format)

**Out of Scope (v1):**
- Multiple document synthesis
- Custom slide templates/themes
- Real-time collaboration on mind map
- Presentation coaching/speaker notes

---

## Open Questions

1. Should we support SCQA framework as an alternative view?
2. How do we handle documents that don't have a clear recommendation?
3. Integration with existing NotebookLM sources vs. standalone upload?

---

*References: [Minto Pyramid Principle](https://untools.co/minto-pyramid/), [McKinsey's Pyramid Framework](https://productmindset.substack.com/p/mckinseys-pyramid-principle), [Think-cell Guide](https://www.think-cell.com/en/resources/content-hub/using-the-pyramid-principle-to-build-better-powerpoint-presentations)*
