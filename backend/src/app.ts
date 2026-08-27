import express from "express";
import cors from "cors";

import taskRoutes from "./routes/taskRoutes";
import noteRoutes from "./routes/noteRoutes";
import chatRoutes from "./routes/chatRoutes";

import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/chat", chatRoutes);

app.use("/tasks", taskRoutes);

app.use("/notes", noteRoutes);

app.use(notFound);

app.use(errorHandler);

export default app;