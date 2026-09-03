# Retrieval-Aware Task Assistant

A task management app with an AI assistant that manages tasks and answers questions from your saved notes using retrieval (RAG). Built with Express + TypeScript (backend), React (frontend), and Gemini for chat, tool-calling, and embeddings.

## Setup

```bash
cd backend && npm install && npm run dev

cd frontend && npm install && npm run dev
```

Add `.env` in `backend/` (copy `.env.example`):

```env
GEMINI_API_KEY=your_key_here

PORT=5001

GEMINI_MODEL=gemini-flash-latest

TASK_API_TOKEN=your-local-secret
```

Everything uses Gemini and in-memory storage. No separate database or vector database is required.

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

## Notes / Retrieval

The assistant can answer questions grounded in notes you save, not just manage tasks.

**API endpoints:**

| Endpoint | Method | What it does |
|---|---|---|
| `/notes` | `POST` | Save a new note (`{ "text": "..." }`). Embeds it via Gemini and stores it in-memory. |
| `/notes` | `GET` | List all saved notes. |
| `/notes/search` | `POST` | Ask a question (`{ "question": "..." }`). Embeds the question, finds the top matching notes by cosine similarity, and returns the relevant results. |

**How it works:**

```text
Add note → Gemini embeds it → stored as { text, embedding }

Ask question → Gemini detects notes are needed → answer_from_notes tool

→ question is searched against saved notes → relevant notes

→ sent back to Gemini → grounded answer
```

1. `POST /notes` saves a free-text note. Gemini creates an embedding and the note is stored in-memory.

2. The chat has an `answer_from_notes(question)` tool alongside the task tools. Gemini chooses the appropriate tool based on the user's request.

3. When the notes tool is called, the question is passed to the retrieval service. The question is compared with saved notes using embeddings and cosine similarity.

4. Relevant notes are returned to Gemini with an instruction to answer using only the retrieved information and not guess.

## Frontend Notes

The frontend includes a Notes section where users can:

- Add new notes
- View saved notes
- See loading states
- See empty states
- See error messages and retry loading

The notes saved through the UI are available for the AI assistant to retrieve when answering relevant questions.

## AI Assistant

The AI assistant can manage tasks using:

- `create_task`
- `update_task`
- `delete_task`
- `list_tasks`

It can also retrieve information from saved notes using:

- `answer_from_notes`

For example:

```text
Saved note:
"We decided to use JWT authentication for the login flow."

User question:
"What authentication method did we decide to use?"
```

Gemini can call `answer_from_notes`, the backend retrieves the relevant note, and Gemini generates an answer based on that retrieved information.

## Try it

### 1. Save a note

```bash
curl -X POST http://localhost:5001/notes \
  -H "Authorization: Bearer <TASK_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"text": "I decided to use JWT authentication for the login flow."}'
```

### 2. Get all notes

```bash
curl http://localhost:5001/notes \
  -H "Authorization: Bearer <TASK_API_TOKEN>"
```

### 3. Ask a question about it

```bash
curl -X POST http://localhost:5001/notes/search \
  -H "Authorization: Bearer <TASK_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"question": "What did I decide about the login flow?"}'
```

### 4. Test through the UI

1. Open the Notes tab.
2. Add a note.
3. Open the AI Assistant tab.
4. Ask a question related to the saved note.
5. The AI can retrieve the relevant note and use it to answer the question.
