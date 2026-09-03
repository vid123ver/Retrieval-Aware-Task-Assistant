# Writeup — Phase 2 (Retrieval)

## What I learned

Phase 1 — Testing: I learned how to properly test each layer of the app — pure functions with plain unit tests, services by mocking the repository layer, and full API routes with Supertest. Writing a regression test for a real Assignment 3 bug made it click why tests matter: it's the difference between hoping code works and proving it.

Phase 2 — Retrieval: I learned how retrieval (RAG) works end to end — converting text into embeddings, comparing them with cosine similarity, and using the most relevant notes to ground an answer instead of letting the model guess. I built the notes system, the /notes/search endpoint, and wired it into the chat's tool-calling alongside the task tools.

Phase 3 — UI + Polish: I learned how to close the loop by connecting the frontend to the new backend features — a Notes panel to add/view notes, and a "From your notes" badge in chat so it's visible when an answer came from retrieval instead of a task action. This phase mainly taught me how much time integration and connecting-the-dots takes compared to building each piece alone.
## Problems faced

Testing retrieval when no notes were available:

While testing the /notes/search endpoint, the API initially returned count: 0 and an empty results array. At first, I thought there was a problem with retrieval, but the endpoint was working correctly.

The actual reason was that the Notes system uses in-memory storage. This means the notes are removed when the backend server restarts. Because of this, there were no notes available for retrievalService.ts to compare with the user's question. I fixed this by adding the notes again and testing the search without restarting the server.

Integrating different parts of the application:

Another problem I faced was connecting different parts of the application together. The frontend, backend, notes, retrieval, and chat features were working separately, but I faced some issues when connecting and testing them together.

I had to check API responses, frontend-backend communication, and whether the correct data was being shown in the UI. This took some time because I needed to find out whether an issue was coming from the frontend, backend, or Gemini API.