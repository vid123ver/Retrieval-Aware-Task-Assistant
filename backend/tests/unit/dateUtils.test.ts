import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeDueDate } from "../../src/utils/dateUtils";

describe("normalizeDueDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return today's date for 'today'", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 20, 12, 0, 0));

    const result = normalizeDueDate("today");

    expect(result).toBe("2026-08-20");
  });

  it("should return tomorrow's date for 'tomorrow'", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 20, 12, 0, 0));

    const result = normalizeDueDate("tomorrow");

    expect(result).toBe("2026-08-21");
  });

  it("should return the next Monday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 20, 12, 0, 0));

    const result = normalizeDueDate("monday");

    expect(result).toBe("2026-08-24");
  });

  it("should return the next Tuesday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 20, 12, 0, 0));

    const result = normalizeDueDate("tuesday");

    expect(result).toBe("2026-08-25");
  });

  it("should return the next Wednesday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 20, 12, 0, 0));

    const result = normalizeDueDate("wednesday");

    expect(result).toBe("2026-08-26");
  });

  it("should return the next Thursday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 20, 12, 0, 0));

    const result = normalizeDueDate("thursday");

    expect(result).toBe("2026-08-27");
  });

  it("should return the next Friday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 20, 12, 0, 0));

    const result = normalizeDueDate("friday");

    expect(result).toBe("2026-08-21");
  });

  it("should return the next Saturday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 20, 12, 0, 0));

    const result = normalizeDueDate("saturday");

    expect(result).toBe("2026-08-22");
  });

  it("should return the next Sunday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 20, 12, 0, 0));

    const result = normalizeDueDate("sunday");

    expect(result).toBe("2026-08-23");
  });

  it("should return a valid ISO date unchanged", () => {
    const result = normalizeDueDate("2026-08-25");

    expect(result).toBe("2026-08-25");
  });

  it("should return null for an invalid ISO date", () => {
    const result = normalizeDueDate("2026-02-31");

    expect(result).toBeNull();
  });

  it("should return null for garbage input", () => {
    const result = normalizeDueDate("hello123");

    expect(result).toBeNull();
  });

  it("should return null for an empty string", () => {
    const result = normalizeDueDate("");

    expect(result).toBeNull();
  });

  it("should handle extra spaces and uppercase input", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 20, 12, 0, 0));

    const result = normalizeDueDate("  TOMORROW  ");

    expect(result).toBe("2026-08-21");
  });
});