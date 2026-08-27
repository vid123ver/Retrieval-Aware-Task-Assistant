import dotenv from "dotenv";

dotenv.config();

import { GoogleGenAI } from "@google/genai";

const apiKey =
  process.env.GEMINI_API_KEY || "test-api-key";

const geminiClient = new GoogleGenAI({
  apiKey,
});

export default geminiClient;