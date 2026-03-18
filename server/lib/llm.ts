import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.HF_TOKEN;
if (!apiKey) {
  console.warn("HF_TOKEN not set. AI features will not work.");
}

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: apiKey ?? "",
});

const configuredModel = process.env.HF_MODEL?.trim();
const DEFAULT_MODEL = "MiniMaxAI/MiniMax-M2.5:novita";
const modelName = configuredModel || DEFAULT_MODEL;

console.log(`[llm] Using Hugging Face model: ${modelName}`);

type GeminiErrorWithMeta = Error & {
  status?: number;
  errorDetails?: Array<{ ["@type"]?: string; retryDelay?: string }>;
};

export async function* generateReading(
  systemPrompt: string,
  context: string
): AsyncGenerator<string> {
  const stream = await client.chat.completions.create({
    model: modelName,
    temperature: 0.9,
    top_p: 0.95,
    max_tokens: 900,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: context },
    ],
  });

  for await (const chunk of stream) {
    const text = chunk.choices?.[0]?.delta?.content ?? "";
    if (text) {
      yield text;
    }
  }
}

export async function generateChatReply(
  systemPrompt: string,
  context: string,
  userMessage: string,
  history: Array<{ role: "user" | "model"; parts: string }>
): Promise<string> {
  const response = await client.chat.completions.create({
    model: modelName,
    temperature: 0.88,
    top_p: 0.95,
    max_tokens: 1200,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "system", content: `Context for this reply:\n${context}` },
      ...history.map((msg) => ({
        role: msg.role === "model" ? ("assistant" as const) : ("user" as const),
        content: msg.parts,
      })),
      { role: "user", content: userMessage },
    ],
  });

  const finishReason = response.choices?.[0]?.finish_reason;
  if (finishReason) {
    console.log(`[chat] HF finishReason=${finishReason}`);
  }

  let text = response.choices?.[0]?.message?.content?.trim() ?? "";
  if (text && !/[.!?…]$/.test(text)) {
    text = `${text}.`;
  }

  if (!text) {
    throw Object.assign(new Error("LLM returned an empty response."), { status: 502 });
  }
  return text;
}

export type { GeminiErrorWithMeta };
