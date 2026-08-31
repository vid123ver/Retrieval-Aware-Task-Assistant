import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import request from "supertest";

const { generateEmbeddingMock } = vi.hoisted(() => ({
  generateEmbeddingMock: vi.fn(),
}));

vi.mock(
  "../../src/services/embeddingService",
  () => ({
    generateEmbedding: generateEmbeddingMock,
  })
);

import app from "../../src/app";

import {
  clearNotes,
} from "../../src/repositories/noteRepository";

const API_TOKEN = "test-token";

describe("Notes API", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    clearNotes();

    process.env.TASK_API_TOKEN = API_TOKEN;
  });

  it("should create a note with authentication", async () => {
    generateEmbeddingMock.mockResolvedValue([
      0.1,
      0.2,
      0.3,
    ]);

    const response = await request(app)
      .post("/notes")
      .set(
        "Authorization",
        `Bearer ${API_TOKEN}`
      )
      .send({
        text: "I decided to use JWT authentication",
      });

    expect(response.status).toBe(201);

    expect(response.body.text).toBe(
      "I decided to use JWT authentication"
    );

    expect(response.body.id).toBeDefined();

    expect(response.body.embedding).toEqual([
      0.1,
      0.2,
      0.3,
    ]);

    expect(
      generateEmbeddingMock
    ).toHaveBeenCalledWith(
      "I decided to use JWT authentication"
    );
  });

  it(
    "should reject creating a note without authentication",
    async () => {
      const response = await request(app)
        .post("/notes")
        .send({
          text: "This should not be created",
        });

      expect(response.status).toBe(401);

      expect(response.body.success).toBe(false);
    }
  );

  it("should reject a note without text", async () => {
  const response = await request(app)
    .post("/notes")
    .set(
      "Authorization",
      `Bearer ${API_TOKEN}`
    )
    .send({});

  expect(response.status).toBe(400);

  expect(response.body.message).toBe(
    "Note text is required"
  );
});

  it("should return all saved notes", async () => {
    generateEmbeddingMock
      .mockResolvedValueOnce([
        0.1,
        0.2,
        0.3,
      ])
      .mockResolvedValueOnce([
        0.4,
        0.5,
        0.6,
      ]);

    await request(app)
      .post("/notes")
      .set(
        "Authorization",
        `Bearer ${API_TOKEN}`
      )
      .send({
        text: "I use JWT authentication",
      });

    await request(app)
      .post("/notes")
      .set(
        "Authorization",
        `Bearer ${API_TOKEN}`
      )
      .send({
        text: "I use refresh tokens",
      });

    const response = await request(app)
      .get("/notes")
      .set(
        "Authorization",
        `Bearer ${API_TOKEN}`
      );

    expect(response.status).toBe(200);

    expect(Array.isArray(response.body)).toBe(
      true
    );

    expect(response.body.length).toBe(2);

    expect(response.body[0].text).toBe(
      "I use JWT authentication"
    );

    expect(response.body[1].text).toBe(
      "I use refresh tokens"
    );
  });
});