import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars");
}

// Service role client — bypasses RLS for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Create a user-scoped client by verifying the JWT
export async function getUserFromToken(
  token: string
): Promise<{ id: string; email?: string } | null> {
  const anonKey = process.env.SUPABASE_ANON_KEY ?? supabaseServiceKey ?? "";
  const userClient = createClient(supabaseUrl!, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error } = await userClient.auth.getUser();
  if (error || !user) return null;
  return { id: user.id, email: user.email };
}
