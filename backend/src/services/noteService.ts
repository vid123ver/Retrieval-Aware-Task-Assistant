

import { randomUUID } from "crypto";
import { Note } from "../models/Note";
import { addNote, getAllNotes } from "../repositories/noteRepository";

export const createNote = (text: string): Note => {
  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error("Note text is required");
  }

  const note: Note = {
    id: randomUUID(),
    text: trimmedText,
  };

  return addNote(note);
};

export const listNotes = (): Note[] => {
  return getAllNotes();
};