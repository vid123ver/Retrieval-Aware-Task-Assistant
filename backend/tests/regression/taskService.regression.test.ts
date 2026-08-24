import { afterEach, describe, expect, it, vi } from "vitest";
import * as taskRepository from "../../src/repositories/taskRepository";
import * as taskService from "../../src/services/taskService";

vi.mock("../../src/repositories/taskRepository", () => ({
  readTasks: vi.fn(),
  writeTasks: vi.fn(),
}));

const mockReadTasks = vi.mocked(taskRepository.readTasks);
const mockWriteTasks = vi.mocked(taskRepository.writeTasks);

describe("Regression: duplicate task title detection", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should reject a new task whose title differs only by case and whitespace", async () => {
    mockReadTasks.mockResolvedValue([
      {
        id: "task-1",
        title: "Buy Milk",
        completed: false,
        priority: "low" as const,
      },
    ]);

    await expect(
      taskService.create("  BUY   milk  ", "medium")
    ).rejects.toMatchObject({
      statusCode: 409,
    });

    expect(mockWriteTasks).not.toHaveBeenCalled();
  });
});