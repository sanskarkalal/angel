import { supabaseAdmin } from "./supabase";
import { generateChatReply } from "./llm";

export async function updateVoiceProfile(userId: string): Promise<void> {
  try {
    // Step 1: Increment convo_count and read the new value
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from("user_profiles")
      .select("convo_count")
      .eq("user_id", userId)
      .single<{ convo_count: number }>();

    if (fetchError || !profile) {
      console.warn(`[voiceProfile] Could not fetch profile for user=${userId}`);
      return;
    }

    const newCount = (profile.convo_count ?? 0) + 1;

    await supabaseAdmin
      .from("user_profiles")
      .update({ convo_count: newCount })
      .eq("user_id", userId);

    // Step 2: Only regenerate voice profile every 10 conversations
    if (newCount % 10 !== 0) {
      console.log(
        `[voiceProfile] user=${userId} convo_count=${newCount} — skipping regeneration`
      );
      return;
    }

    console.log(
      `[voiceProfile] user=${userId} convo_count=${newCount} — regenerating voice profile`
    );

    // Step 3: Fetch last 5 conversations ordered by most recent
    const { data: conversations, error: convError } = await supabaseAdmin
      .from("conversations")
      .select("messages, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(5);

    if (convError || !conversations || conversations.length === 0) {
      console.warn(`[voiceProfile] No conversations found for user=${userId}`);
      return;
    }

    // Step 4: Extract only the user's messages from each conversation
    const userMessages: string[] = [];
    for (const conv of conversations) {
      const messages = (conv.messages as Array<{ role: string; content: string }>) ?? [];
      const fromUser = messages
        .filter((m) => m.role === "user")
        .map((m) => m.content.trim())
        .filter((m) => m.length > 0);
      userMessages.push(...fromUser);
    }

    if (userMessages.length < 3) {
      console.log(
        `[voiceProfile] Not enough user messages (${userMessages.length}) to generate profile`
      );
      return;
    }

    // Step 5: Build the summarisation prompt
    const systemPrompt =
      "You are an observer. Your only job is to describe how someone writes based on their messages. Be specific and factual. Do not evaluate or judge. Do not say whether their writing is good or bad. Just describe what you observe — sentence length, vocabulary level, punctuation habits, emotional tone, how they start and end messages, any recurring words or phrases, topics they return to. Write 3 to 5 sentences. Plain language only.";

    const userMessagesFormatted = userMessages
      .slice(0, 30)
      .map((m, i) => `Message ${i + 1}: "${m.slice(0, 200)}"`)
      .join("\n");

    const prompt = `Here are messages written by one person to their spiritual companion app:\n\n${userMessagesFormatted}\n\nDescribe in 3 to 5 sentences how this person writes. Be specific and observational.`;

    // Step 6: Call LLM to generate the voice summary
    const voiceProfile = await generateChatReply(systemPrompt, "", prompt, []);

    if (!voiceProfile || voiceProfile.trim().length === 0) {
      console.warn(`[voiceProfile] LLM returned empty voice profile for user=${userId}`);
      return;
    }

    // Step 7: Write voice_profile back to user_profiles
    const { error: updateError } = await supabaseAdmin
      .from("user_profiles")
      .update({ voice_profile: voiceProfile.trim() })
      .eq("user_id", userId);

    if (updateError) {
      console.error(
        `[voiceProfile] Failed to save voice_profile for user=${userId}:`,
        updateError
      );
      return;
    }

    console.log(
      `[voiceProfile] Successfully updated voice_profile for user=${userId} preview="${voiceProfile.slice(0, 80)}"`
    );
  } catch (err) {
    // Never throw — this is a background job and must not crash the main request
    console.error(`[voiceProfile] Unexpected error for user=${userId}:`, err);
  }
}
