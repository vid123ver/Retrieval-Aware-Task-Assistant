import api from "./api";
import type { Note } from "../types/Note";

export const getNotes = async (): Promise<Note[]> => {
  const response = await api.get("/notes");

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data.notes)) {
    return response.data.notes;
  }

  return [];
};

export const addNote = async (
  text: string
): Promise<Note> => {
  try {
    const response = await api.post("/notes", {
      text,
    });

    if (response.data.note) {
      return response.data.note;
    }

    return response.data;
  } catch {
    throw new Error(
      "Unable to create the note. Please try again."
    );
  }
};