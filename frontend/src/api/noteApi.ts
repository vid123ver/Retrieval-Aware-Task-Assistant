import api from "./api";
import type { Note } from "../types/Note";

export const getNotes = async (): Promise<Note[]> => {
  const response = await api.get("/notes");

  return response.data;
};

export const addNote = async (
  text: string
): Promise<Note> => {
  try {
    const response = await api.post("/notes", {
      text,
    });

    return response.data;
  } catch {
    throw new Error(
      "Unable to create the note. Please try again."
    );
  }
};