import { Note } from "../models/Note";

const notes: Note[] = [];

export const addNote = (note: Note): Note => {
  notes.push(note);
  return note;
};

export const getAllNotes = (): Note[] => {
  return [...notes];
};

export const clearNotes = (): void => {
  notes.length = 0;
};
