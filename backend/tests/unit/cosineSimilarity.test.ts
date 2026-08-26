import { describe, expect, it } from "vitest";
import { cosineSimilarity } from "../../src/utils/cosineSimilarity";

describe("cosineSimilarity", () => {
  it("should return 1 for identical vectors", () => {
    const result = cosineSimilarity(
      [1, 2, 3],
      [1, 2, 3]
    );

    expect(result).toBeCloseTo(1);
  });

  it("should return 0 for perpendicular vectors", () => {
    const result = cosineSimilarity(
      [1, 0],
      [0, 1]
    );

    expect(result).toBeCloseTo(0);
  });

  it("should return -1 for opposite vectors", () => {
    const result = cosineSimilarity(
      [1, 0],
      [-1, 0]
    );

    expect(result).toBeCloseTo(-1);
  });

  it("should calculate similarity for known vectors", () => {
    const result = cosineSimilarity(
      [1, 2],
      [3, 4]
    );

    expect(result).toBeCloseTo(0.9839, 3);
  });

  it("should throw when vectors have different dimensions", () => {
    expect(() =>
      cosineSimilarity(
        [1, 2, 3],
        [1, 2]
      )
    ).toThrow("Vectors must have the same dimensions.");
  });

  it("should throw when vectors are empty", () => {
    expect(() =>
      cosineSimilarity([], [])
    ).toThrow("Vectors cannot be empty.");
  });

  it("should return 0 when one vector has zero magnitude", () => {
    const result = cosineSimilarity(
      [0, 0],
      [1, 2]
    );

    expect(result).toBe(0);
  });
});