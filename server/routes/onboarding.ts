import { Router, type Request, type Response } from "express";
import { getUserFromToken, supabaseAdmin } from "../lib/supabase";
import { getLifePathNumber } from "../lib/numerology";

const router = Router();

// POST /api/onboard
router.post("/", async (req: Request, res: Response): Promise<void> => {
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

  const {
    name,
    pronouns,
    birth_date,
    birth_time,
    birth_city,
    onboarding_story,
    intentions,
    photo_uri,
  } = req.body as {
    name: string;
    pronouns?: string;
    birth_date?: string;
    birth_time?: string;
    birth_city?: string;
    onboarding_story?: string;
    intentions?: string[];
    photo_uri?: string | null;
  };

  if (!name?.trim()) {
    res.status(400).json({ error: "Name is required" });
    return;
  }

  // Compute life path number
  let lifePathNumber: number | null = null;
  if (birth_date) {
    try {
      const dateObj = new Date(birth_date + "T12:00:00Z"); // use noon to avoid timezone issues
      lifePathNumber = getLifePathNumber(dateObj);
    } catch (err) {
      console.error("Life path calculation error:", err);
    }
  }

  // Compute basic sun sign from birth date (simplified)
  let sunSign: string | null = null;
  if (birth_date) {
    sunSign = getSunSign(new Date(birth_date + "T12:00:00Z"));
  }

  // Check if profile already exists
  const { data: existingProfile } = await supabaseAdmin
    .from("user_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const profileData = {
    user_id: user.id,
    name: name.trim(),
    pronouns: pronouns || null,
    birth_date: birth_date || null,
    birth_time: birth_time || null,
    birth_city: birth_city || null,
    sun_sign: sunSign,
    moon_sign: null, // Would require full astrology calculation
    rising_sign: null,
    life_path_number: lifePathNumber,
    onboarding_story: onboarding_story || null,
    intentions: intentions?.filter((i) => i.trim()) ?? [],
    photo_url: null, // Photo upload handled separately (would need storage)
    onboarding_complete: true,
  };

  let profile;
  if (existingProfile) {
    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .update(profileData)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to save your profile" });
      return;
    }
    profile = data;
  } else {
    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .insert(profileData)
      .select()
      .single();

    if (error) {
      console.error("Profile insert error:", error);
      res.status(500).json({ error: "Failed to create your profile" });
      return;
    }
    profile = data;
  }

  res.json({ profile });
});

function getSunSign(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

export default router;
