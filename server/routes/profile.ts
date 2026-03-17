import { Router, type Request, type Response } from "express";
import { getUserFromToken, supabaseAdmin } from "../lib/supabase";

const router = Router();

// GET /api/profile
router.get("/", async (req: Request, res: Response): Promise<void> => {
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

  const { data: profile, error } = await supabaseAdmin
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      res.status(404).json({ error: "Profile not found" });
    } else {
      console.error("Profile fetch error:", error);
      res.status(500).json({ error: "Failed to load profile" });
    }
    return;
  }

  res.json({ profile });
});

// PATCH /api/profile
router.patch("/", async (req: Request, res: Response): Promise<void> => {
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

  const allowedFields = [
    "name", "pronouns", "birth_city", "onboarding_story",
    "intentions", "photo_url", "sun_sign", "moon_sign", "rising_sign",
  ];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in req.body) {
      updates[field] = (req.body as Record<string, unknown>)[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No valid fields to update" });
    return;
  }

  const { data: profile, error } = await supabaseAdmin
    .from("user_profiles")
    .update(updates)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
    return;
  }

  res.json({ profile });
});

export default router;
