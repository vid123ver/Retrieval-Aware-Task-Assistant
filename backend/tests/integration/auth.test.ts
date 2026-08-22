import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import request from "supertest";

process.env.TASK_API_TOKEN = "test-token";

vi.mock("../../src/services/geminiService", () => ({
  default: {
    sendMessage: vi.fn(),
  },
}));

vi.mock("../../src/repositories/taskRepository", () => ({
  readTasks: vi.fn(),
  writeTasks: vi.fn(),
}));

import app from "../../src/app";
import * as taskRepository from "../../src/repositories/taskRepository";

const mockReadTasks = vi.mocked(
  taskRepository.readTasks
);

describe("Authentication Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TASK_API_TOKEN = "test-token";
  });

  it("should return 401 when no authorization token is provided", async () => {
    const response = await request(app)
      .get("/tasks");

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Authorization token is required",
    });
  });

  it("should return 401 when an invalid token is provided", async () => {
    const response = await request(app)
      .get("/tasks")
      .set(
        "Authorization",
        "Bearer wrong-token"
      );

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid authorization token",
    });
  });

  it("should return 401 when the authorization scheme is not Bearer", async () => {
    const response = await request(app)
      .get("/tasks")
      .set(
        "Authorization",
        "Basic test-token"
      );

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid authorization token",
    });
  });

  it("should allow the request when the correct token is provided", async () => {
    mockReadTasks.mockResolvedValue([]);

    const response = await request(app)
      .get("/tasks")
      .set(
        "Authorization",
        "Bearer test-token"
      );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);

    expect(mockReadTasks).toHaveBeenCalledTimes(1);
  });
});