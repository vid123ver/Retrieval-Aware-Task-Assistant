import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks = vi.hoisted(() => ({
  generateEmbedding: vi.fn(),
}));

vi.mock("../../src/repositories/noteRepository", () => ({
  addNote: vi.fn((note) => note),
  getAllNotes: vi.fn(() => []),
}));

vi.mock("../../src/services/embeddingService", () => ({
  generateEmbedding: mocks.generateEmbedding,
}));

import {
  createNote,
  listNotes,
} from "../../src/services/noteService";

import {
  addNote,
  getAllNotes,
} from "../../src/repositories/noteRepository";

describe("noteService", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create a note with trimmed text and embedding", async () => {
    const embedding = [0.1, 0.2, 0.3];

    mocks.generateEmbedding.mockResolvedValue(embedding);

    const result = await createNote(
      "  I decided to use JWT  "
    );

    expect(result.text).toBe("I decided to use JWT");
    expect(result.id).toBeDefined();
    expect(result.embedding).toEqual(embedding);

    expect(
      mocks.generateEmbedding
    ).toHaveBeenCalledWith("I decided to use JWT");

    expect(addNote).toHaveBeenCalledWith(result);
  });

  it("should reject an empty note without generating an embedding", async () => {
    await expect(
      createNote("   ")
    ).rejects.toThrow("Note text is required");

    expect(
      mocks.generateEmbedding
    ).not.toHaveBeenCalled();

    expect(addNote).not.toHaveBeenCalled();
  });

  it("should return all notes", () => {
    const result = listNotes();

    expect(result).toEqual([]);

    expect(getAllNotes).toHaveBeenCalledTimes(1);
  });
});