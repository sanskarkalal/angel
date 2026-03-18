import { Router, type Request, type Response } from "express";
import { getUserFromToken, supabaseAdmin } from "../lib/supabase";
import { generateReading, generateChatReply } from "../lib/llm";
import { getAngelSystemPrompt, buildReadingContext, buildChatContext } from "../lib/context";
import { getMoonPhase, isHighEnergyMoon } from "../lib/moonphase";
import { updateVoiceProfile } from "../lib/voiceProfile";

const router = Router();
const readingInFlight = new Set<string>();
const readingCooldownByUser = new Map<string, number>();
let globalProviderCooldownUntil = 0;

const MIN_USER_RETRY_SECONDS = 15;
const DEFAULT_QUOTA_RETRY_SECONDS = 60;
const HISTORY_TEXT_LIMIT = 260;

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

type ConversationMessage = {
  role: "user" | "angel" | "model" | string;
  content: string;
  timestamp?: string;
};

function compactText(input: string, maxLen = HISTORY_TEXT_LIMIT): string {
  const clean = input.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1)}…`;
}

function summariseConversation(messages: ConversationMessage[]): string {
  if (!messages.length) {
    return "No conversation saved for this reading yet.";
  }
  const userMessages = messages.filter((m) => m.role === "user" && m.content?.trim());
  const angelMessages = messages.filter(
    (m) => (m.role === "angel" || m.role === "model") && m.content?.trim()
  );

  const latestUser = userMessages[userMessages.length - 1]?.content ?? "";
  const latestAngel = angelMessages[angelMessages.length - 1]?.content ?? "";
  const focus =
    latestUser && latestAngel
      ? `They last asked about "${compactText(latestUser, 110)}" and Angel answered "${compactText(latestAngel, 130)}".`
      : latestUser
        ? `Their latest message was "${compactText(latestUser, 170)}".`
        : `Angel shared "${compactText(latestAngel, 170)}".`;

  return `${messages.length} total messages. ${focus}`;
}

function summariseArchive(
  items: Array<{ readingDate: string; cardName: string; messageCount: number; summary: string }>
): string {
  if (!items.length) {
    return "No past readings yet.";
  }
  const totalMessages = items.reduce((sum, item) => sum + item.messageCount, 0);
  const cards = Array.from(new Set(items.map((item) => item.cardName))).slice(0, 5);
  const latest = items[0];

  return [
    `You have ${items.length} saved reading${items.length === 1 ? "" : "s"} with ${totalMessages} total chat message${totalMessages === 1 ? "" : "s"}.`,
    `Recent focus: ${latest.cardName} on ${latest.readingDate}.`,
    cards.length > 0 ? `Cards showing up lately: ${cards.join(", ")}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
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
router.get("/chat/history", async (req: Request, res: Response): Promise<void> => {
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

  const readingId = String(req.query.readingId ?? "").trim();
  if (!readingId) {
    res.status(400).json({ error: "readingId is required" });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select("messages")
    .eq("reading_id", readingId)
    .eq("user_id", user.id)
    .single<{ messages: Array<{ role: "angel" | "user"; content: string; timestamp: string }> }>();

  if (error) {
    if (error.code === "PGRST116") {
      res.json({ messages: [] });
      return;
    }
    console.error("Chat history fetch error:", error);
    res.status(500).json({ error: "Failed to load chat history." });
    return;
  }

  res.json({ messages: data?.messages ?? [] });
});

router.get("/chat/archive", async (req: Request, res: Response): Promise<void> => {
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

  const { data: readings, error: readingsError } = await supabaseAdmin
    .from("daily_readings")
    .select("id, reading_date, card_name, card_arcana, card_reversed, reading_text, created_at")
    .eq("user_id", user.id)
    .order("reading_date", { ascending: false });

  if (readingsError) {
    console.error("Archive readings fetch error:", readingsError);
    res.status(500).json({ error: "Failed to load archive." });
    return;
  }

  if (!readings || readings.length === 0) {
    res.json({ overallSummary: "No past readings yet.", items: [] });
    return;
  }

  const { data: conversations, error: conversationsError } = await supabaseAdmin
    .from("conversations")
    .select("reading_id, messages, updated_at")
    .eq("user_id", user.id);

  if (conversationsError) {
    console.error("Archive conversations fetch error:", conversationsError);
    res.status(500).json({ error: "Failed to load archive." });
    return;
  }

  const convoByReadingId = new Map<string, { messages: ConversationMessage[]; updatedAt: string | null }>();
  for (const conv of conversations ?? []) {
    const readingId = String((conv as { reading_id?: string }).reading_id ?? "").trim();
    if (!readingId) continue;
    const messages =
      ((conv as { messages?: ConversationMessage[] }).messages ?? []).filter(
        (m) => m && typeof m.content === "string"
      );
    const updatedAt = (conv as { updated_at?: string | null }).updated_at ?? null;
    convoByReadingId.set(readingId, { messages, updatedAt });
  }

  const items = readings.map((reading) => {
    const readingId = String((reading as { id?: string }).id ?? "");
    const convo = convoByReadingId.get(readingId);
    const messages = convo?.messages ?? [];
    const summary = summariseConversation(messages);

    return {
      readingId,
      readingDate: String((reading as { reading_date?: string }).reading_date ?? ""),
      cardName: String((reading as { card_name?: string }).card_name ?? ""),
      cardArcana: String((reading as { card_arcana?: string }).card_arcana ?? ""),
      cardReversed: Boolean((reading as { card_reversed?: boolean }).card_reversed),
      readingPreview: compactText(String((reading as { reading_text?: string }).reading_text ?? ""), 220),
      messageCount: messages.length,
      summary,
      lastMessageAt: convo?.updatedAt ?? null,
    };
  });

  res.json({
    overallSummary: summariseArchive(
      items.map((item) => ({
        readingDate: item.readingDate,
        cardName: item.cardName,
        messageCount: item.messageCount,
        summary: item.summary,
      }))
    ),
    items,
  });
});

router.get("/chat/archive/:readingId", async (req: Request, res: Response): Promise<void> => {
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

  const readingId = String(req.params.readingId ?? "").trim();
  if (!readingId) {
    res.status(400).json({ error: "readingId is required" });
    return;
  }

  const { data: reading, error: readingError } = await supabaseAdmin
    .from("daily_readings")
    .select("id, reading_date, card_name, card_arcana, card_reversed, reading_text")
    .eq("id", readingId)
    .eq("user_id", user.id)
    .single();

  if (readingError || !reading) {
    res.status(404).json({ error: "Reading not found" });
    return;
  }

  const { data: conversation } = await supabaseAdmin
    .from("conversations")
    .select("messages, updated_at")
    .eq("reading_id", readingId)
    .eq("user_id", user.id)
    .maybeSingle<{ messages: ConversationMessage[]; updated_at: string | null }>();

  const messages = conversation?.messages ?? [];
  res.json({
    reading: {
      id: (reading as { id?: string }).id ?? readingId,
      readingDate: (reading as { reading_date?: string }).reading_date ?? "",
      cardName: (reading as { card_name?: string }).card_name ?? "",
      cardArcana: (reading as { card_arcana?: string }).card_arcana ?? "",
      cardReversed: Boolean((reading as { card_reversed?: boolean }).card_reversed),
      readingText: (reading as { reading_text?: string }).reading_text ?? "",
    },
    summary: summariseConversation(messages),
    messages,
  });
});

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

    // Fire-and-forget: update voice profile in background
    updateVoiceProfile(user.id).catch(err => {
      console.error("[chat] updateVoiceProfile error:", err);
    });

    console.log(`[${reqId}] chat response sent`);
    res.json({ reply, messages: newMessages });
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
