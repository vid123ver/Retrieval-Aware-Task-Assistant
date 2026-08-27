import { randomUUID } from "crypto";
import { Note } from "../models/Note";
import {
  addNote,
  getAllNotes,
} from "../repositories/noteRepository";
import { generateEmbedding } from "./embeddingService";

export const createNote = async (
  text: string
): Promise<Note> => {
  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error("Note text is required");
  }

  const embedding = await generateEmbedding(trimmedText);

  const note: Note = {
    id: randomUUID(),
    text: trimmedText,
    embedding,
  };

  return addNote(note);
};

export const listNotes = (): Note[] => {
  return getAllNotes();
};