import { Router } from "express";

import {
  createNote,
  getAllNotes,
} from "../controllers/noteController";

import { apiAuth } from "../middlewares/apiAuth";

const router = Router();

router.use(apiAuth);

router.post("/", createNote);

router.get("/", getAllNotes);

export default router;