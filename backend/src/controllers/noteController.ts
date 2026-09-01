import { Request, Response } from "express";

import * as noteService from "../services/noteService";

import { asyncHandler } from "../utils/asyncHandler";

import { AppError } from "../utils/AppError";

import { retrieveRelevantNotes } from "../services/retrievalService";

export const createNote = asyncHandler(
  async (req: Request, res: Response) => {
    if (typeof req.body.text !== "string") {
      throw new AppError(
        "Note text is required",
        400
      );
    }

    const note = await noteService.createNote(
      req.body.text
    );

    res.status(201).json(note);
  }
);

export const getAllNotes = asyncHandler(
  async (req: Request, res: Response) => {
    const notes = noteService.listNotes();

    res.json(notes);
  }
);

export const searchNotes = asyncHandler(
  async (req: Request, res: Response) => {
    const { question, limit } = req.body;

    if (
      typeof question !== "string" ||
      !question.trim()
    ) {
      throw new AppError(
        "Question is required",
        400
      );
    }

    let noteLimit = 3;

    if (limit !== undefined) {
      if (
        typeof limit !== "number" ||
        !Number.isInteger(limit) ||
        limit <= 0
      ) {
        throw new AppError(
          "Limit must be a positive integer",
          400
        );
      }

      noteLimit = limit;
    }

    const results =
      await retrieveRelevantNotes(
        question.trim(),
        noteLimit
      );

    res.status(200).json({
      success: true,
      count: results.length,
      results,
    });
  }
);