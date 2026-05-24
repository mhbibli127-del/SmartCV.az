import OpenAI from "openai";
import { getOpenAIKey } from "@/lib/env";

let cachedClient: OpenAI | null = null;

export function getOpenAI() {
  const apiKey = getOpenAIKey();
  if (!apiKey) {
    throw new Error(
      "[openai] OPENAI_API_KEY is missing or a placeholder. " +
        "Set a real OpenAI key in .env.local."
    );
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey });
  }

  return cachedClient;
}

