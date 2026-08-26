import { beforeEach, describe, expect, it, vi } from "vitest";

const { embedContentMock } = vi.hoisted(() => ({
  embedContentMock: vi.fn(),
}));

vi.mock("../../src/config/gemini", () => ({
  default: {
    models: {
      embedContent: embedContentMock,
    },
  },
}));

import { generateEmbedding } from "../../src/services/embeddingService";

describe("embeddingService", () => {
  beforeEach(() => {
    embedContentMock.mockReset();
  });

  it("should generate an embedding for the given text", async () => {
    embedContentMock.mockResolvedValue({
      embeddings: [
        {
          values: [0.1, 0.2, 0.3],
        },
      ],
    });

    const result = await generateEmbedding(
      "I decided to use JWT authentication."
    );

    expect(result).toEqual([0.1, 0.2, 0.3]);

    expect(embedContentMock).toHaveBeenCalledWith({
      model: "gemini-embedding-001",
      contents: "I decided to use JWT authentication.",
    });
  });

  it("should throw an error when Gemini does not return an embedding", async () => {
    embedContentMock.mockResolvedValue({
      embeddings: [],
    });

    await expect(
      generateEmbedding("Some note")
    ).rejects.toThrow("Failed to generate embedding.");
  });
});