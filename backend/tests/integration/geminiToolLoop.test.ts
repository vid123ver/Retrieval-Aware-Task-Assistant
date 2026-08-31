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
  retrieveRelevantNotesMock,
} = vi.hoisted(() => {
  const sendMessageMock = vi.fn();

  const createChatMock = vi.fn(() => ({
    sendMessage: sendMessageMock,
  }));

  const retrieveRelevantNotesMock = vi.fn();

  return {
    sendMessageMock,
    createChatMock,
    retrieveRelevantNotesMock,
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

vi.mock(
  "../../src/services/retrievalService",
  () => ({
    retrieveRelevantNotes:
      retrieveRelevantNotesMock,
  })
);

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
        "test-session-create",
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

  it("should retrieve relevant notes and send them back to Gemini", async () => {
    const relevantNotes = [
      {
        note: {
          id: "note-1",
          text:
            "I decided to use JWT authentication for the login flow.",
          embedding: [0.1, 0.2, 0.3],
        },
        similarity: 0.95,
      },
      {
        note: {
          id: "note-2",
          text:
            "I will use refresh tokens for longer user sessions.",
          embedding: [0.2, 0.3, 0.4],
        },
        similarity: 0.88,
      },
    ];

    retrieveRelevantNotesMock.mockResolvedValue(
      relevantNotes
    );

    sendMessageMock
      .mockResolvedValueOnce({
        functionCalls: [
          {
            name: "answer_from_notes",
            id: "notes-call-1",
            args: {
              question:
                "What did I decide about the login flow?",
            },
          },
        ],
        text: "",
      })
      .mockResolvedValueOnce({
        functionCalls: [],
        text:
          "You decided to use JWT authentication for the login flow and refresh tokens for longer user sessions.",
      });

    const result =
      await geminiService.sendMessage(
        "test-session-notes",
        "What did I decide about the login flow?"
      );

    expect(
      retrieveRelevantNotesMock
    ).toHaveBeenCalledTimes(1);

    expect(
      retrieveRelevantNotesMock
    ).toHaveBeenCalledWith(
      "What did I decide about the login flow?"
    );

    expect(sendMessageMock).toHaveBeenCalledTimes(2);

    expect(sendMessageMock).toHaveBeenNthCalledWith(
      2,
      {
        message: [
          {
            functionResponse: {
              name: "answer_from_notes",
              id: "notes-call-1",
              response: {
                found: true,
                notes: [
                  {
                    text:
                      "I decided to use JWT authentication for the login flow.",
                    similarity: 0.95,
                  },
                  {
                    text:
                      "I will use refresh tokens for longer user sessions.",
                    similarity: 0.88,
                  },
                ],
                instruction:
                  "Answer the user's question using only the retrieved notes. Do not add information that is not supported by these notes.",
              },
            },
          },
        ],
      }
    );

    expect(result.reply).toBe(
      "You decided to use JWT authentication for the login flow and refresh tokens for longer user sessions."
    );

    expect(result.actions).toEqual([
      {
        type: "answer_from_notes",
      },
    ]);
  });

  it("should tell Gemini when no relevant notes are found", async () => {
    retrieveRelevantNotesMock.mockResolvedValue(
      []
    );

    sendMessageMock
      .mockResolvedValueOnce({
        functionCalls: [
          {
            name: "answer_from_notes",
            id: "notes-call-2",
            args: {
              question:
                "What is my favourite food?",
            },
          },
        ],
        text: "",
      })
      .mockResolvedValueOnce({
        functionCalls: [],
        text:
          "I couldn't find relevant information about that in your saved notes.",
      });

    const result =
      await geminiService.sendMessage(
        "test-session-no-notes",
        "What is my favourite food?"
      );

    expect(
      retrieveRelevantNotesMock
    ).toHaveBeenCalledWith(
      "What is my favourite food?"
    );

    expect(sendMessageMock).toHaveBeenNthCalledWith(
      2,
      {
        message: [
          {
            functionResponse: {
              name: "answer_from_notes",
              id: "notes-call-2",
              response: {
                found: false,
                message:
                  "No relevant information was found in the user's saved notes. Do not guess or make up an answer.",
              },
            },
          },
        ],
      }
    );

    expect(result.reply).toBe(
      "I couldn't find relevant information about that in your saved notes."
    );

    expect(result.actions).toEqual([
      {
        type: "answer_from_notes",
      },
    ]);
  });
});