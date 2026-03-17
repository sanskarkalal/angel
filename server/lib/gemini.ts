import { GoogleGenerativeAI, type GenerateContentStreamResult } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY not set. AI features will not work.");
}

const genAI = new GoogleGenerativeAI(apiKey ?? "");

const MODEL_NAME = "gemini-2.0-flash-exp";

export async function* generateReading(
  systemPrompt: string,
  context: string
): AsyncGenerator<string> {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.9,
      topP: 0.95,
      maxOutputTokens: 600,
    },
  });

  const result: GenerateContentStreamResult = await model.generateContentStream(context);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}

export async function generateChatReply(
  systemPrompt: string,
  context: string,
  userMessage: string,
  history: Array<{ role: "user" | "model"; parts: string }>
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.88,
      topP: 0.95,
      maxOutputTokens: 400,
    },
  });

  const chat = model.startChat({
    history: history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.parts }],
    })),
    systemInstruction: `${systemPrompt}\n\nContext:\n${context}`,
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}
