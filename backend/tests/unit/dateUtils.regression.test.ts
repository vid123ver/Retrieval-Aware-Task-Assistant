import { describe, expect, it } from "vitest";
import { normalizeDueDate } from "../../src/utils/dateUtils";

describe("Regression: invalid due date handling", () => {
  it("should reject invalid calendar date 2026-02-31", () => {
    const result = normalizeDueDate("2026-02-31");

    expect(result).toBe(null);
  });
});