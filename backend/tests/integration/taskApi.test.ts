import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import request from "supertest";

vi.mock("../../src/services/geminiService", () => ({
  default: {
    sendMessage: vi.fn(),
  },
}));

vi.mock("../../src/middlewares/apiAuth", () => ({
  apiAuth: (
    req: any,
    res: any,
    next: any
  ) => {
    next();
  },
}));

vi.mock("../../src/repositories/taskRepository", () => ({
  readTasks: vi.fn(),
  writeTasks: vi.fn(),
}));

import app from "../../src/app";
import * as taskRepository from "../../src/repositories/taskRepository";

const mockReadTasks = vi.mocked(taskRepository.readTasks);
const mockWriteTasks = vi.mocked(taskRepository.writeTasks);

describe("Task API Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /tasks", () => {
    it("should return all tasks", async () => {
      const tasks = [
        {
          id: "task-1",
          title: "First Task",
          completed: false,
          priority: "low" as const,
        },
        {
          id: "task-2",
          title: "Second Task",
          completed: true,
          priority: "high" as const,
        },
      ];

      mockReadTasks.mockResolvedValue(tasks);

      const response = await request(app)
        .get("/tasks");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(tasks);
    });
  });

  describe("GET /tasks/:id", () => {
    it("should return a task when the task exists", async () => {
      const task = {
        id: "task-1",
        title: "Complete Assignment 4",
        completed: false,
        priority: "high" as const,
        dueDate: "2026-08-25",
      };

      mockReadTasks.mockResolvedValue([task]);

      const response = await request(app)
        .get("/tasks/task-1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(task);
    });

    it("should return 404 when the task does not exist", async () => {
      mockReadTasks.mockResolvedValue([]);

      const response = await request(app)
        .get("/tasks/missing-task");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        "message",
        "Task not found"
      );
    });
  });

  describe("POST /tasks", () => {
    it("should create a new task", async () => {
      mockReadTasks.mockResolvedValue([]);
      mockWriteTasks.mockResolvedValue(undefined);

      const response = await request(app)
        .post("/tasks")
        .send({
          title: "Learn Supertest",
          priority: "high",
          dueDate: "2026-08-25",
        });

      expect(response.status).toBe(201);

      expect(response.body).toHaveProperty(
        "title",
        "Learn Supertest"
      );

      expect(response.body).toHaveProperty(
        "completed",
        false
      );

      expect(response.body).toHaveProperty(
        "priority",
        "high"
      );

      expect(response.body).toHaveProperty(
        "dueDate",
        "2026-08-25"
      );

      expect(response.body).toHaveProperty("id");

      expect(mockWriteTasks).toHaveBeenCalledTimes(1);
    });

    it("should return 400 when the title is invalid", async () => {
      const response = await request(app)
        .post("/tasks")
        .send({
          title: "",
          priority: "high",
        });

      expect(response.status).toBe(400);
    });

    it("should return 400 when the due date is invalid", async () => {
      const response = await request(app)
        .post("/tasks")
        .send({
          title: "Invalid Date Task",
          priority: "medium",
          dueDate: "2026-02-31",
        });

      expect(response.status).toBe(400);
    });

    it("should return 409 when a duplicate task is created", async () => {
      mockReadTasks.mockResolvedValue([
        {
          id: "task-1",
          title: "Existing Task",
          completed: false,
          priority: "medium" as const,
        },
      ]);

      const response = await request(app)
        .post("/tasks")
        .send({
          title: "Existing Task",
          priority: "high",
        });

      expect(response.status).toBe(409);
    });
  });

  describe("PUT /tasks/:id", () => {
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

      const response = await request(app)
        .put("/tasks/task-1")
        .send({
          title: "Updated Task",
          completed: true,
          priority: "high",
          dueDate: "2026-08-30",
        });

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        id: "task-1",
        title: "Updated Task",
        completed: true,
        priority: "high",
        dueDate: "2026-08-30",
      });
    });

    it("should return 404 when updating a missing task", async () => {
      mockReadTasks.mockResolvedValue([]);

      const response = await request(app)
        .put("/tasks/missing-task")
        .send({
          title: "Updated Task",
        });

      expect(response.status).toBe(404);

      expect(response.body).toHaveProperty(
        "message",
        "Task not found"
      );
    });

    it("should return 400 when no update fields are provided", async () => {
      const response = await request(app)
        .put("/tasks/task-1")
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /tasks/:id", () => {
    it("should delete an existing task", async () => {
      const task = {
        id: "task-1",
        title: "Task to Delete",
        completed: false,
        priority: "medium" as const,
      };

      mockReadTasks.mockResolvedValue([task]);
      mockWriteTasks.mockResolvedValue(undefined);

      const response = await request(app)
        .delete("/tasks/task-1");

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        message: "Task deleted successfully",
      });

      expect(mockWriteTasks).toHaveBeenCalledTimes(1);
    });

    it("should return 404 when deleting a missing task", async () => {
      mockReadTasks.mockResolvedValue([]);

      const response = await request(app)
        .delete("/tasks/missing-task");

      expect(response.status).toBe(404);

      expect(response.body).toHaveProperty(
        "message",
        "Task not found"
      );

      expect(mockWriteTasks).not.toHaveBeenCalled();
    });
  });

  describe("PATCH /tasks/:id", () => {
    it("should toggle task completion status", async () => {
      const task = {
        id: "task-1",
        title: "Toggle Task",
        completed: false,
        priority: "medium" as const,
      };

      mockReadTasks.mockResolvedValue([task]);
      mockWriteTasks.mockResolvedValue(undefined);

      const response = await request(app)
        .patch("/tasks/task-1");

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(true);

      expect(mockWriteTasks).toHaveBeenCalledTimes(1);
    });

    it("should return 404 when toggling a missing task", async () => {
      mockReadTasks.mockResolvedValue([]);

      const response = await request(app)
        .patch("/tasks/missing-task");

      expect(response.status).toBe(404);

      expect(response.body).toHaveProperty(
        "message",
        "Task not found"
      );

      expect(mockWriteTasks).not.toHaveBeenCalled();
    });
  });
});