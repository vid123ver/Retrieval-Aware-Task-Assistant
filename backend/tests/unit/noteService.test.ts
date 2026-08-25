import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/repositories/noteRepository", () => ({
  addNote: vi.fn((note) => note),
  getAllNotes: vi.fn(() => []),
}));

import { createNote, listNotes } from "../../src/services/noteService";
import {
  addNote,
  getAllNotes,
} from "../../src/repositories/noteRepository";

describe("noteService", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create a note with trimmed text", () => {
    const result = createNote("  I decided to use JWT  ");

    expect(result.text).toBe("I decided to use JWT");
    expect(result.id).toBeDefined();
    expect(addNote).toHaveBeenCalledWith(result);
  });

  it("should reject an empty note", () => {
    expect(() => createNote("   ")).toThrow(
      "Note text is required",
    );

    expect(addNote).not.toHaveBeenCalled();
  });

  it("should return all notes", () => {
    const result = listNotes();

    expect(result).toEqual([]);
    expect(getAllNotes).toHaveBeenCalledTimes(1);
  });
});
