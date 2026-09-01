import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  generateEmbedding: vi.fn(),
  getAllNotes: vi.fn(),
}));

vi.mock("../../src/services/embeddingService", () => ({
  generateEmbedding: mocks.generateEmbedding,
}));

vi.mock("../../src/repositories/noteRepository", () => ({
  getAllNotes: mocks.getAllNotes,
}));

import { retrieveRelevantNotes } from "../../src/services/retrievalService";

describe("retrievalService", () => {
  beforeEach(() => {
    mocks.generateEmbedding.mockReset();
    mocks.getAllNotes.mockReset();
  });

  it("should return notes sorted by similarity", async () => {
    mocks.generateEmbedding.mockResolvedValue([1, 0]);

    mocks.getAllNotes.mockReturnValue([
      {
        id: "1",
        text: "Relevant note",
        embedding: [0.6, 0.8],
      },
      {
        id: "2",
        text: "Most relevant note",
        embedding: [1, 0],
      },
      {
        id: "3",
        text: "Somewhat relevant note",
        embedding: [1, 1],
      },
    ]);

    const result = await retrieveRelevantNotes(
      "authentication question"
    );

    expect(result).toHaveLength(3);

    expect(result[0].note.id).toBe("2");
    expect(result[1].note.id).toBe("3");
    expect(result[2].note.id).toBe("1");
  });

  it("should return only the requested number of notes", async () => {
    mocks.generateEmbedding.mockResolvedValue([1, 0]);

    mocks.getAllNotes.mockReturnValue([
      {
        id: "1",
        text: "Note 1",
        embedding: [1, 0],
      },
      {
        id: "2",
        text: "Note 2",
        embedding: [1, 1],
      },
      {
        id: "3",
        text: "Note 3",
        embedding: [0.6, 0.8],
      },
      {
        id: "4",
        text: "Unrelated note",
        embedding: [0, 1],
      },
    ]);

    const result = await retrieveRelevantNotes(
      "question",
      2
    );

    expect(result).toHaveLength(2);
    expect(result[0].note.id).toBe("1");
    expect(result[1].note.id).toBe("2");
  });

  it("should ignore notes without embeddings", async () => {
    mocks.generateEmbedding.mockResolvedValue([1, 0]);

    mocks.getAllNotes.mockReturnValue([
      {
        id: "1",
        text: "Note without embedding",
      },
      {
        id: "2",
        text: "Note with embedding",
        embedding: [1, 0],
      },
    ]);

    const result = await retrieveRelevantNotes("question");

    expect(result).toHaveLength(1);
    expect(result[0].note.id).toBe("2");
  });

  it("should return an empty array when no notes have embeddings", async () => {
    mocks.generateEmbedding.mockResolvedValue([1, 0]);

    mocks.getAllNotes.mockReturnValue([
      {
        id: "1",
        text: "Note without embedding",
      },
    ]);

    const result = await retrieveRelevantNotes("question");

    expect(result).toEqual([]);
  });

  it("should return an empty array when no notes meet the similarity threshold", async () => {
    mocks.generateEmbedding.mockResolvedValue([1, 0]);

    mocks.getAllNotes.mockReturnValue([
      {
        id: "1",
        text: "Unrelated note",
        embedding: [0, 1],
      },
      {
        id: "2",
        text: "Another unrelated note",
        embedding: [-1, 0],
      },
    ]);

    const result = await retrieveRelevantNotes(
      "question"
    );

    expect(result).toEqual([]);
  });
});