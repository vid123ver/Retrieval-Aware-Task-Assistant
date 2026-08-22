import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const {
  sendMessageMock,
  createChatMock,
} = vi.hoisted(() => {
  const sendMessageMock = vi.fn();

  const createChatMock = vi.fn(() => ({
    sendMessage: sendMessageMock,
  }));

  return {
    sendMessageMock,
    createChatMock,
  };
});

vi.mock("../../src/config/gemini", () => ({
  default: {
    chats: {
      create: createChatMock,
    },
  },
}));

vi.mock("../../src/services/taskService", () => ({
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  toggle: vi.fn(),
  findById: vi.fn(),
}));

import geminiService from "../../src/services/geminiService";
import * as taskService from "../../src/services/taskService";

const mockCreateTask = vi.mocked(
  taskService.create
);

describe("Gemini Tool-Call Loop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should execute create_task tool and send the result back to Gemini", async () => {
    const createdTask = {
      id: "task-1",
      title: "Learn Testing",
      completed: false,
      priority: "high" as const,
    };

    mockCreateTask.mockResolvedValue(
      createdTask
    );

    sendMessageMock
      .mockResolvedValueOnce({
        functionCalls: [
          {
            name: "create_task",
            id: "call-1",
            args: {
              title: "Learn Testing",
              priority: "high",
            },
          },
        ],
        text: "",
      })
      .mockResolvedValueOnce({
        functionCalls: [],
        text: "Task created successfully.",
      });

    const result =
      await geminiService.sendMessage(
        "test-session",
        "Create a high priority task called Learn Testing"
      );

    expect(mockCreateTask).toHaveBeenCalledTimes(1);

    expect(mockCreateTask).toHaveBeenCalledWith(
      "Learn Testing",
      "high",
      undefined
    );

    expect(sendMessageMock).toHaveBeenCalledTimes(2);

    expect(sendMessageMock).toHaveBeenNthCalledWith(
      2,
      {
        message: [
          {
            functionResponse: {
              name: "create_task",
              id: "call-1",
              response: {
                task: createdTask,
              },
            },
          },
        ],
      }
    );

    expect(result.reply).toBe(
      "Task created successfully."
    );

    expect(result.actions).toEqual([
      {
        type: "create_task",
        task: createdTask,
      },
    ]);
  });
});