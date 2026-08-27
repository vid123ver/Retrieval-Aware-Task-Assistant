import { Request, Response } from "express";
import * as noteService from "../services/noteService";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

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