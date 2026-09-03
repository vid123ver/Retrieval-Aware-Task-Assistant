# Writeup — Phase 2 (Retrieval)

## What I learned

In this phase, I learned how retrieval (RAG) works from start to end. I learned how text is converted into an embedding, how embeddings are compared using cosine similarity, and how the most relevant notes are found based on a user's question.

I created a notes system where users can save notes. Gemini converts each note into an embedding, which is stored along with the note text. I also added secure APIs to create and view notes using the same token authentication used in the rest of the application.

I also created a new /notes/search API endpoint so I could directly test whether a user's question was finding the correct notes.

## Problems faced

Testing retrieval when no notes were available:

While testing the /notes/search endpoint, the API initially returned count: 0 and an empty results array. At first, I thought there was a problem with retrieval, but the endpoint was working correctly.

The actual reason was that the Notes system uses in-memory storage. This means the notes are removed when the backend server restarts. Because of this, there were no notes available for retrievalService.ts to compare with the user's question. I fixed this by adding the notes again and testing the search without restarting the server.

Integrating different parts of the application:

Another problem I faced was connecting different parts of the application together. The frontend, backend, notes, retrieval, and chat features were working separately, but I faced some issues when connecting and testing them together.

I had to check API responses, frontend-backend communication, and whether the correct data was being shown in the UI. This took some time because I needed to find out whether an issue was coming from the frontend, backend, or Gemini API.