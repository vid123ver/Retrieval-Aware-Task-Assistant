# Retrieval-Aware Task Assistant

A task management app with an AI assistant that manages tasks and answers questions from your saved notes using retrieval (RAG). Built with Express + TypeScript (backend), React (frontend), and Gemini's free tier for chat, tool-calling, and embeddings.

## Setup

```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

Add `.env` in `backend/` (copy `.env.example`):
```
GEMINI_API_KEY=your_key_here
PORT=5001
GEMINI_MODEL=gemini-flash-latest
TASK_API_TOKEN=your-local-secret
```

Everything free tier — Gemini free tier + in-memory store, no paid keys, no vector DB.

## Testing

Run from `backend/`:

```bash
npm install
npm test
```

Single command, no real API key needed — Gemini client and repositories are mocked.

**What's covered:**
- `dateUtils` — `normalizeDueDate`: today, tomorrow, weekdays, valid/invalid ISO, garbage input
- `taskService` — create, duplicate rejection, update, not-found, delete (repository mocked)
- `taskApi` — real Express routes via Supertest, status codes + bodies
- `auth` middleware — no token / wrong token / wrong scheme (401), correct token (200)
- `geminiToolLoop` — Gemini client mocked with a scripted function call, asserts the tool loop runs the right operation and feeds the result back
- **Regression test** — duplicate task titles that only differed by casing/whitespace weren't caught in Assignment 3; this test locks in the fix
- `cosineSimilarity` — pure math, known vectors (identical → 1, perpendicular → 0, opposite → −1)
- `embeddingService`, `noteService`, `retrievalService` — Gemini embedding calls and repositories mocked
- `noteApi` — create/list notes endpoints, auth, validation

## Notes / Retrieval (new feature)

The assistant can now answer questions grounded in notes you save, not just manage tasks.

**API endpoints:**

| Endpoint | Method | What it does |
|---|---|---|
| `/notes` | `POST` | Save a new note (`{ "text": "..." }`). Embeds it via Gemini and stores it in-memory. |
| `/notes` | `GET` | List all saved notes. |
| `/notes/search` | `POST` | Ask a question (`{ "question": "..." }`). Embeds the question, finds the top matching notes by cosine similarity, and returns a grounded answer. |

**How it works:**
```
Add note  →  Gemini embeds it  →  stored as { text, embedding }

Ask question → Gemini embeds question → cosine similarity vs
all notes → top 3 matches → sent to Gemini with the question →
grounded answer (or "couldn't find anything relevant" if none match)
```

1. `POST /notes` — save a free-text note. It's embedded via Gemini's embedding model and kept in-memory as `{ text, embedding }`.
2. Chat has a new `answer_from_notes(question)` tool alongside the task tools. Gemini picks the right tool based on the question — "what did I decide about X" → notes tool, "add a task" → task tools.
3. The question is embedded, compared to every note via cosine similarity, and the top 3 matches are sent to Gemini to produce an answer grounded only in those notes.
4. If nothing relevant is found, the assistant says so instead of guessing — this is explicitly tested.

**Try it:**
```bash
# 1. Save a note
curl -X POST http://localhost:5001/notes \
  -H "Authorization: Bearer <TASK_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"text": "I decided to use JWT authentication for the login flow."}'

# 2. Get all notes
curl http://localhost:5001/notes \
  -H "Authorization: Bearer <TASK_API_TOKEN>"

# 3. Ask a question about it
curl -X POST http://localhost:5001/notes/search \
  -H "Authorization: Bearer <TASK_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"question": "What did I decide about the login flow?"}'
```
