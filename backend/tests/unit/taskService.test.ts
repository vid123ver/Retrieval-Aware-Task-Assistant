import { afterEach, describe, expect, it, vi } from "vitest";
import * as taskRepository from "../../src/repositories/taskRepository";
import * as taskService from "../../src/services/taskService";

vi.mock("../../src/repositories/taskRepository", () => ({
  readTasks: vi.fn(),
  writeTasks: vi.fn(),
}));

const mockReadTasks = vi.mocked(taskRepository.readTasks);
const mockWriteTasks = vi.mocked(taskRepository.writeTasks);

describe("taskService", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new task", async () => {
      mockReadTasks.mockResolvedValue([]);
      mockWriteTasks.mockResolvedValue(undefined);

      const result = await taskService.create(
        "Complete Assignment 4",
        "high",
        "2026-08-25"
      );

      expect(result.title).toBe("Complete Assignment 4");
      expect(result.completed).toBe(false);
      expect(result.priority).toBe("high");
      expect(result.dueDate).toBe("2026-08-25");
      expect(result.id).toBeDefined();

      expect(mockReadTasks).toHaveBeenCalledTimes(1);
      expect(mockWriteTasks).toHaveBeenCalledTimes(1);
    });

    it("should reject a duplicate task title", async () => {
      mockReadTasks.mockResolvedValue([
        {
          id: "task-1",
          title: "Complete Assignment 4",
          completed: false,
          priority: "high",
          dueDate: "2026-08-25",
        },
      ]);

      await expect(
        taskService.create(
          "  COMPLETE   ASSIGNMENT 4  ",
          "medium"
        )
      ).rejects.toMatchObject({
        statusCode: 409,
      });

      expect(mockWriteTasks).not.toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should return a task when the task exists", async () => {
      const task = {
        id: "task-1",
        title: "Complete Assignment 4",
        completed: false,
        priority: "high" as const,
        dueDate: "2026-08-25",
      };

      mockReadTasks.mockResolvedValue([task]);

      const result = await taskService.findById("task-1");

      expect(result).toEqual(task);
    });

    it("should throw 404 when the task does not exist", async () => {
      mockReadTasks.mockResolvedValue([]);

      await expect(
        taskService.findById("missing-task")
      ).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe("update", () => {
    it("should update an existing task", async () => {
      const task = {
        id: "task-1",
        title: "Old Task",
        completed: false,
        priority: "low" as const,
        dueDate: "2026-08-25",
      };

      mockReadTasks.mockResolvedValue([task]);
      mockWriteTasks.mockResolvedValue(undefined);

      const result = await taskService.update("task-1", {
        title: "Updated Task",
        completed: true,
        priority: "high",
        dueDate: "2026-08-30",
      });

      expect(result).toEqual({
        id: "task-1",
        title: "Updated Task",
        completed: true,
        priority: "high",
        dueDate: "2026-08-30",
      });

      expect(mockWriteTasks).toHaveBeenCalledTimes(1);
    });

    it("should throw 404 when updating a missing task", async () => {
      mockReadTasks.mockResolvedValue([]);

      await expect(
        taskService.update("missing-task", {
          title: "Updated Task",
        })
      ).rejects.toMatchObject({
        statusCode: 404,
      });

      expect(mockWriteTasks).not.toHaveBeenCalled();
    });

    it("should reject updating to a duplicate title", async () => {
      mockReadTasks.mockResolvedValue([
        {
          id: "task-1",
          title: "First Task",
          completed: false,
          priority: "low",
        },
        {
          id: "task-2",
          title: "Second Task",
          completed: false,
          priority: "medium",
        },
      ]);

      await expect(
        taskService.update("task-1", {
          title: "  SECOND   TASK  ",
        })
      ).rejects.toMatchObject({
        statusCode: 409,
      });

      expect(mockWriteTasks).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("should remove an existing task", async () => {
      const task = {
        id: "task-1",
        title: "Task to Delete",
        completed: false,
        priority: "medium" as const,
      };

      mockReadTasks.mockResolvedValue([task]);
      mockWriteTasks.mockResolvedValue(undefined);

      await taskService.remove("task-1");

      expect(mockWriteTasks).toHaveBeenCalledTimes(1);

      expect(mockWriteTasks).toHaveBeenCalledWith([]);
    });

    it("should throw 404 when deleting a missing task", async () => {
      mockReadTasks.mockResolvedValue([]);

      await expect(
        taskService.remove("missing-task")
      ).rejects.toMatchObject({
        statusCode: 404,
      });

      expect(mockWriteTasks).not.toHaveBeenCalled();
    });
  });

  describe("toggle", () => {
    it("should toggle task completion status", async () => {
      const task = {
        id: "task-1",
        title: "Toggle Task",
        completed: false,
        priority: "medium" as const,
      };

      mockReadTasks.mockResolvedValue([task]);
      mockWriteTasks.mockResolvedValue(undefined);

      const result = await taskService.toggle("task-1");

      expect(result.completed).toBe(true);
      expect(mockWriteTasks).toHaveBeenCalledTimes(1);
    });

    it("should throw 404 when toggling a missing task", async () => {
      mockReadTasks.mockResolvedValue([]);

      await expect(
        taskService.toggle("missing-task")
      ).rejects.toMatchObject({
        statusCode: 404,
      });

      expect(mockWriteTasks).not.toHaveBeenCalled();
    });
  });
});