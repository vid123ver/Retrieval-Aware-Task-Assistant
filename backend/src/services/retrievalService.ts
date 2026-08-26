import { Note } from "../models/Note";
import { getAllNotes } from "../repositories/noteRepository";
import { generateEmbedding } from "./embeddingService";
import { cosineSimilarity } from "../utils/cosineSimilarity";

interface RetrievedNote {
  note: Note;
  similarity: number;
}

export const retrieveRelevantNotes = async (
  question: string,
  limit = 3
): Promise<RetrievedNote[]> => {
  const questionEmbedding = await generateEmbedding(question);

  const notes = getAllNotes();

  const notesWithEmbeddings = notes.filter(
    (note) => note.embedding && note.embedding.length > 0
  );

  const scoredNotes = notesWithEmbeddings.map((note) => ({
    note,
    similarity: cosineSimilarity(
      questionEmbedding,
      note.embedding as number[]
    ),
  }));

  scoredNotes.sort(
    (a, b) => b.similarity - a.similarity
  );

  return scoredNotes.slice(0, limit);
};