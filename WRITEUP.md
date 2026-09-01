# Writeup — Phase 2 (Retrieval)

## What I learned

I learned how retrieval (RAG) actually works end to end — turning text into
an embedding, comparing embeddings with cosine similarity, and pulling the
top-matching notes to ground an answer instead of letting the model guess.
I created a notes system where users can save notes, and Gemini converts
each note into a searchable format (an embedding), stored alongside the
note text. I also added secure APIs to add and view notes, protected by
the same token-based auth as the rest of the app.


## Problems faced

Testing retrieval when no notes were available

While demonstrating the new /notes/search endpoint, the API initially returned count: 0 and an empty results array. At first, this looked like a retrieval problem, but the endpoint was actually working correctly. The reason was that my Notes system currently uses in-memory storage, so notes exist only while the backend server is running. If the server restarts or reloads, the stored notes are removed from memory. Therefore, there were no notes available for retrievalService.ts to compare with the user's question. I fixed the demonstration by creating a note again and then searching for it without restarting the server.

Vitest mock hoisting

While writing the embedding service test, I initially declared the mock function outside vi.mock(). Since Vitest hoists vi.mock() calls to the top of the file, the mock function was being accessed before it was initialized, which threw a ReferenceError. I fixed it with vi.hoisted(), which initializes the mock before the mocked module is loaded.
