import { Router, type Request, type Response } from "express";
import { getUserFromToken, supabaseAdmin } from "../lib/supabase";
import { generateReading, generateChatReply } from "../lib/gemini";
import { getAngelSystemPrompt, buildReadingContext, buildChatContext } from "../lib/context";
import { getMoonPhase, isHighEnergyMoon } from "../lib/moonphase";

const router = Router();
const readingInFlight = new Set<string>();
const readingCooldownByUser = new Map<string, number>();
let globalProviderCooldownUntil = 0;

const MIN_USER_RETRY_SECONDS = 15;
const DEFAULT_QUOTA_RETRY_SECONDS = 60;

function extractRetryAfterSeconds(err: unknown): number | null {
  if (!err || typeof err !== "object") return null;
  const maybeAny = err as {
    retryAfterSec?: number;
    message?: string;
    errorDetails?: Array<{ ["@type"]?: string; retryDelay?: string }>;
  };

  if (typeof maybeAny.retryAfterSec === "number" && maybeAny.retryAfterSec > 0) {
    return maybeAny.retryAfterSec;
  }

  const details = maybeAny.errorDetails;
  if (Array.isArray(details)) {
    const retryInfo = details.find(
      (d) => d?.["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
    );
    const rawDelay = retryInfo?.retryDelay;
    if (rawDelay) {
      const match = rawDelay.match(/(\d+)s/);
      if (match) {
        return Number.parseInt(match[1], 10);
      }
    }
  }

  const msg = maybeAny.message ?? "";
  const match = msg.match(/(\d+)\s*s(ec(onds?)?)?/i);
  if (!match) return null;
  const sec = Number.parseInt(match[1], 10);
  return Number.isNaN(sec) ? null : sec;
}

function isQuotaError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const maybeAny = err as { status?: number; message?: string };
  const msg = (maybeAny.message ?? "").toLowerCase();
  return (
    maybeAny.status === 429 ||
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("too many requests")
  );
}

function isSpendingCapError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const maybeAny = err as { message?: string };
  const msg = (maybeAny.message ?? "").toLowerCase();
  return msg.includes("spending cap");
}

// ========== Tarot deck (inline for server use) ==========
interface SimpleCard {
  id: string;
  name: string;
  arcana: "major" | "minor";
  reversed?: boolean;
  uprightMeaning: string;
  reversedMeaning: string;
  keywords: string[];
}

const MAJOR_ARCANA_NAMES = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
  "Judgement", "The World",
];

// Simple card draw without the full deck import
function drawServerCard(): SimpleCard {
  const highEnergy = isHighEnergyMoon();
  const isMajor = highEnergy ? Math.random() < 0.35 : Math.random() < 0.22;

  if (isMajor) {
    const name = MAJOR_ARCANA_NAMES[Math.floor(Math.random() * MAJOR_ARCANA_NAMES.length)];
    return {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      arcana: "major",
      uprightMeaning: "Transformation, awakening, and alignment with your higher path.",
      reversedMeaning: "Resistance to change, inner blocks, or delayed awakening.",
      keywords: ["transformation", "awakening", "path", "destiny", "soul"],
    };
  }

  const suits = ["Wands", "Cups", "Swords", "Pentacles"];
  const suit = suits[Math.floor(Math.random() * suits.length)];
  const numbers = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];
  const cardNum = numbers[Math.floor(Math.random() * numbers.length)];
  const name = `${cardNum} of ${suit}`;

  return {
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    arcana: "minor",
    uprightMeaning: "Action, movement, and the unfolding of daily life energy.",
    reversedMeaning: "Blocked energy, delays, or the need to look within.",
    keywords: ["energy", "action", "flow", "balance", "clarity"],
  };
}

function isCardReversed(): boolean {
  return Math.random() < 0.3;
}

// ========== POST /api/reading ==========
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const reqId = `reading-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  // 1. Verify auth
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  const user = await getUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  console.log(`[${reqId}] /api/reading start user=${user.id}`);

  const today = new Date().toISOString().split("T")[0];
  const inFlightKey = `${user.id}:${today}`;
  const nowMs = Date.now();

  const userCooldownUntil = readingCooldownByUser.get(user.id) ?? 0;
  const activeCooldownUntil = Math.max(userCooldownUntil, globalProviderCooldownUntil);
  if (activeCooldownUntil > nowMs) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((activeCooldownUntil - nowMs) / 1000)
    );
    res.status(429).json({
      error: "Please wait before requesting another reading.",
      retryAfterSec,
    });
    return;
  }

  // 2. Check daily gate — return cached if exists
  const { data: existingReading } = await supabaseAdmin
    .from("daily_readings")
    .select("*")
    .eq("user_id", user.id)
    .eq("reading_date", today)
    .single();

  if (existingReading) {
    console.log(
      `[${reqId}] cached reading hit id=${existingReading.id} textLen=${(existingReading.reading_text ?? "").length}`
    );
    // Return cached reading
    res.status(429).json({
      cached: true,
      reading: existingReading,
    });
    return;
  }

  if (readingInFlight.has(inFlightKey)) {
    res.status(429).json({
      error: "A reading is already being prepared. Please wait a few seconds.",
      retryAfterSec: 8,
    });
    return;
  }
  readingInFlight.add(inFlightKey);
  readingCooldownByUser.set(user.id, nowMs + MIN_USER_RETRY_SECONDS * 1000);
  const clearInFlight = () => readingInFlight.delete(inFlightKey);
  res.once("close", clearInFlight);
  res.once("finish", clearInFlight);

  // 3. Draw card
  const card = drawServerCard();
  const reversed = isCardReversed();
  console.log(`[${reqId}] card drawn name="${card.name}" reversed=${reversed}`);

  // 4. Build context
  let context: string;
  try {
    context = await buildReadingContext(user.id, card.name, reversed, {
      name: card.name,
      uprightMeaning: card.uprightMeaning,
      reversedMeaning: card.reversedMeaning,
      keywords: card.keywords,
    });
  } catch (err) {
    console.error("buildReadingContext error:", err);
    const moon = getMoonPhase(new Date());
    context = [
      "=== ABOUT THE PERSON YOU ARE SPEAKING WITH ===",
      "Name: Beloved",
      "",
      "=== COSMIC CONTEXT ===",
      `Current moon phase: ${moon.name} ${moon.emoji}`,
      `Moon meaning: ${moon.meaning}`,
      `Cosmic tone: ${moon.toneModifier}`,
      "",
      "=== TODAY'S CARD ===",
      `Today's tarot card: ${card.name} (${reversed ? "reversed" : "upright"})`,
      `Card meaning: ${reversed ? card.reversedMeaning : card.uprightMeaning}`,
      `Card keywords: ${card.keywords.join(", ")}`,
      "",
      "=== YOUR TASK ===",
      "Offer a warm, poetic, grounded reading that references the moon phase and card symbolism.",
    ].join("\n");
  }

  const systemPrompt = getAngelSystemPrompt();

  // 5. Set up SSE streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send card info first
  res.write(
    `data: ${JSON.stringify({
      type: "card",
      card: { name: card.name, arcana: card.arcana, reversed },
    })}\n\n`
  );

  // 6. Stream AI response
  let fullText = "";
  let chunkCount = 0;
  try {
    for await (const chunk of generateReading(systemPrompt, context)) {
      fullText += chunk;
      chunkCount += 1;
      res.write(`data: ${JSON.stringify({ type: "text", text: chunk })}\n\n`);
    }
    console.log(
      `[${reqId}] stream complete chunks=${chunkCount} textLen=${fullText.length} preview="${fullText.slice(0, 120).replace(/\s+/g, " ")}"`
    );
  } catch (err) {
    console.error("AI streaming error:", err);
    const quotaLike = isQuotaError(err);
    const detectedRetryAfter = extractRetryAfterSeconds(err);
    let retryAfterSec = detectedRetryAfter;

    if (quotaLike) {
      const cooldownSec = Math.max(
        detectedRetryAfter ?? DEFAULT_QUOTA_RETRY_SECONDS,
        MIN_USER_RETRY_SECONDS
      );
      const cooldownUntil = Date.now() + cooldownSec * 1000;
      readingCooldownByUser.set(user.id, cooldownUntil);
      globalProviderCooldownUntil = Math.max(globalProviderCooldownUntil, cooldownUntil);
      retryAfterSec = cooldownSec;
    }

    const message = quotaLike
      ? isSpendingCapError(err)
        ? `Model provider billing cap is reached for this project. Please raise the cap or try again in ${retryAfterSec ?? DEFAULT_QUOTA_RETRY_SECONDS} seconds.`
        : `The current is crowded right now. Please try again in ${retryAfterSec ?? DEFAULT_QUOTA_RETRY_SECONDS} seconds.`
      : "The connection wavered.";
    res.write(
      `data: ${JSON.stringify({ type: "error", message, retryAfterSec })}\n\n`
    );
    res.end();
    return;
  }

  // 7. Save to database
  let savedReadingId: string | null = null;
  try {
    const { data: saved } = await supabaseAdmin
      .from("daily_readings")
      .insert({
        user_id: user.id,
        reading_date: today,
        card_name: card.name,
        card_arcana: card.arcana,
        card_reversed: reversed,
        reading_text: fullText,
      })
      .select("id")
      .single();

    savedReadingId = saved?.id ?? null;
    console.log(`[${reqId}] reading saved id=${savedReadingId ?? "null"}`);
  } catch (err) {
    console.error("Error saving reading:", err);
  }

  // 8. Send done signal with reading ID
  res.write(
    `data: ${JSON.stringify({ type: "done", readingId: savedReadingId })}\n\n`
  );
  res.write("data: [DONE]\n\n");
  res.end();
});

// ========== POST /api/reading/chat ==========
router.post("/chat", async (req: Request, res: Response): Promise<void> => {
  const reqId = `chat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  const user = await getUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const { message, readingId, history } = req.body as {
    message: string;
    readingId: string;
    history: Array<{ role: "angel" | "user"; content: string }>;
  };

  if (!message?.trim()) {
    res.status(400).json({ error: "Message is required" });
    return;
  }
  console.log(
    `[${reqId}] /api/reading/chat start user=${user.id} readingId=${readingId} historyCount=${history?.length ?? 0} msgLen=${message.length}`
  );

  // Fetch the reading for context
  const { data: reading } = await supabaseAdmin
    .from("daily_readings")
    .select("card_name, card_reversed, reading_text")
    .eq("id", readingId)
    .eq("user_id", user.id)
    .single<{ card_name: string; card_reversed: boolean; reading_text: string }>();

  if (!reading) {
    res.status(404).json({ error: "Reading not found" });
    return;
  }

  const systemPrompt = getAngelSystemPrompt();
  const context = await buildChatContext(
    user.id,
    reading.reading_text,
    reading.card_name,
    reading.card_reversed
  );

  // Build history for AI provider
  const geminiHistory = history.map((msg) => ({
    role: msg.role === "angel" ? "model" as const : "user" as const,
    parts: msg.content,
  }));

  try {
    const reply = await generateChatReply(systemPrompt, context, message, geminiHistory);
    console.log(
      `[${reqId}] chat reply generated len=${reply.length} preview="${reply.slice(0, 120).replace(/\s+/g, " ")}"`
    );

    // Save conversation
    const { data: existingConv } = await supabaseAdmin
      .from("conversations")
      .select("id, messages")
      .eq("reading_id", readingId)
      .eq("user_id", user.id)
      .single<{ id: string; messages: Array<{ role: string; content: string; timestamp: string }> }>();

    const newMessages = [
      ...(existingConv?.messages ?? []),
      { role: "user", content: message, timestamp: new Date().toISOString() },
      { role: "angel", content: reply, timestamp: new Date().toISOString() },
    ];

    if (existingConv?.id) {
      await supabaseAdmin
        .from("conversations")
        .update({ messages: newMessages, updated_at: new Date().toISOString() })
        .eq("id", existingConv.id);
    } else {
      await supabaseAdmin.from("conversations").insert({
        user_id: user.id,
        reading_id: readingId,
        messages: newMessages,
      });
    }

    console.log(`[${reqId}] chat response sent`);
    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    const retryAfterSec = extractRetryAfterSeconds(err);
    if (isQuotaError(err)) {
      res
        .status(429)
        .json({
          error: `The current is crowded right now. Please try again in ${retryAfterSec ?? 45} seconds.`,
          retryAfterSec,
        });
      return;
    }
    res.status(500).json({ error: "The connection wavered. Please try again." });
  }
});

export default router;
