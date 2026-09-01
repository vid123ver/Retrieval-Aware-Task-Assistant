import { Router } from "express";

import {
  createNote,
  getAllNotes,
  searchNotes,
} from "../controllers/noteController";

import { apiAuth } from "../middlewares/apiAuth";

const router = Router();

router.use(apiAuth);

router.post("/", createNote);

router.post("/search", searchNotes);

router.get("/", getAllNotes);

export default router;