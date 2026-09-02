import { useEffect, useState } from "react";
import type { Note } from "../types/Note";
import * as noteApi from "../api/noteApi";

const GENERIC_ERROR_MESSAGE =
  "Something went wrong. Please try again.";

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await noteApi.getNotes();

      setNotes(data);
    } catch {
      setError(GENERIC_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async (text: string) => {
    setError(null);

    try {
      const newNote = await noteApi.addNote(text);

      setNotes((previousNotes) => [
        ...previousNotes,
        newNote,
      ]);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return {
    notes,
    isLoading,
    error,
    fetchNotes,
    addNote,
  };
};