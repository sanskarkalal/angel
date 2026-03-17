import { Router, type Request, type Response } from "express";
import { getUserFromToken, supabaseAdmin } from "../lib/supabase";
import { generateReading, generateChatReply } from "../lib/gemini";
import { getAngelSystemPrompt, buildReadingContext, buildChatContext } from "../lib/context";
import { getMoonPhase, isHighEnergyMoon } from "../lib/moonphase";

const router = Router();

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

  const today = new Date().toISOString().split("T")[0];

  // 2. Check daily gate — return cached if exists
  const { data: existingReading } = await supabaseAdmin
    .from("daily_readings")
    .select("*")
    .eq("user_id", user.id)
    .eq("reading_date", today)
    .single();

  if (existingReading) {
    // Return cached reading
    res.status(429).json({
      cached: true,
      reading: existingReading,
    });
    return;
  }

  // 3. Draw card
  const card = drawServerCard();
  const reversed = isCardReversed();

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
    res.status(500).json({ error: "Could not build reading context" });
    return;
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

  // 6. Stream Gemini response
  let fullText = "";
  try {
    for await (const chunk of generateReading(systemPrompt, context)) {
      fullText += chunk;
      res.write(`data: ${JSON.stringify({ type: "text", text: chunk })}\n\n`);
    }
  } catch (err) {
    console.error("Gemini streaming error:", err);
    res.write(`data: ${JSON.stringify({ type: "error", message: "The connection wavered." })}\n\n`);
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

  // Build history for Gemini
  const geminiHistory = history.map((msg) => ({
    role: msg.role === "angel" ? "model" as const : "user" as const,
    parts: msg.content,
  }));

  try {
    const reply = await generateChatReply(systemPrompt, context, message, geminiHistory);

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

    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "The connection wavered. Please try again." });
  }
});

export default router;
