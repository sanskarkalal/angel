import { GoogleGenerativeAI, type GenerateContentStreamResult } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY not set. AI features will not work.");
}

const genAI = new GoogleGenerativeAI(apiKey ?? "");

const LEGACY_UNSUPPORTED_MODELS = new Set([
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
]);

const configuredModel = process.env.GEMINI_MODEL?.trim();
const safeConfiguredModel =
  configuredModel && !LEGACY_UNSUPPORTED_MODELS.has(configuredModel)
    ? configuredModel
    : undefined;

if (configuredModel && !safeConfiguredModel) {
  console.warn(
    `GEMINI_MODEL="${configuredModel}" is deprecated/unsupported. Ignoring it and using modern fallback models.`
  );
}

const MODEL_CANDIDATES = Array.from(
  new Set([
    safeConfiguredModel,
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-flash-latest",
  ].filter((m): m is string => Boolean(m && m.trim())))
);

type GeminiErrorWithMeta = Error & {
  status?: number;
  errorDetails?: Array<{ ["@type"]?: string; retryDelay?: string }>;
};

function getStatus(err: unknown): number | undefined {
  if (!err || typeof err !== "object" || !("status" in err)) return undefined;
  const status = (err as { status?: unknown }).status;
  return typeof status === "number" ? status : undefined;
}

function isQuotaLikeMessage(message: string): boolean {
  const msg = message.toLowerCase();
  return (
    msg.includes("quota exceeded") ||
    msg.includes("too many requests") ||
    msg.includes("rate limit")
  );
}

async function withModelFallback<T>(runner: (modelName: string) => Promise<T>): Promise<T> {
  let lastError: unknown;
  let preferredError: unknown;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      console.log(`[ai] trying model=${modelName}`);
      return await runner(modelName);
    } catch (err) {
      lastError = err;

      const status = getStatus(err);
      const message = err instanceof Error ? err.message : "";
      console.warn(
        `[ai] model=${modelName} failed status=${status ?? "unknown"} message="${message.slice(0, 180)}"`
      );
      const isQuota = status === 429 || isQuotaLikeMessage(message);
      const shouldTryNextModel = status === 404 || status === 429 || isQuota;

      if (!preferredError && isQuota) {
        preferredError = err;
      }

      if (!shouldTryNextModel) {
        throw err;
      }
    }
  }

  throw preferredError ?? lastError ?? new Error("No Gemini model candidates configured.");
}

export async function* generateReading(
  systemPrompt: string,
  context: string
): AsyncGenerator<string> {
  const result: GenerateContentStreamResult = await withModelFallback(async (modelName) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        maxOutputTokens: 900,
      },
    });
    return model.generateContentStream(context);
  });

  for await (const chunk of result.stream) {
    const text = chunk.text();
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
  return withModelFallback(async (modelName) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.88,
        topP: 0.95,
        maxOutputTokens: 1200,
      },
    });

    const chat = model.startChat({
      history: history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.parts }],
      })),
    });

    const result = await chat.sendMessage(
      [
        "Context for this reply:",
        context,
        "",
        "User message:",
        userMessage,
      ].join("\n")
    );
    let finishReason = result.response.candidates?.[0]?.finishReason;
    if (finishReason) {
      console.log(`[chat] Gemini finishReason=${finishReason}`);
    }

    let text = result.response.text().trim();
    let continuationCount = 0;

    while (finishReason === "MAX_TOKENS" && continuationCount < 2) {
      continuationCount += 1;
      const continuation = await chat.sendMessage(
        "Continue exactly where you left off. Do not restart or repeat. Finish in complete sentences."
      );
      const continuationText = continuation.response.text().trim();
      const continuationFinish = continuation.response.candidates?.[0]?.finishReason;

      if (continuationFinish) {
        console.log(
          `[chat] Gemini continuation#${continuationCount} finishReason=${continuationFinish}`
        );
      }

      if (continuationText) {
        const needsSpace =
          text.length > 0 &&
          !/[\s([{"'—-]$/.test(text) &&
          !/^[,.;:!?)]/.test(continuationText);
        text = `${text}${needsSpace ? " " : ""}${continuationText}`;
      }

      finishReason = continuationFinish;
    }

    if (text && !/[.!?…]$/.test(text)) {
      text = `${text}.`;
    }

    if (!text) {
      throw Object.assign(new Error("Gemini returned an empty response."), { status: 502 });
    }
    return text;
  });
}

export type { GeminiErrorWithMeta };
