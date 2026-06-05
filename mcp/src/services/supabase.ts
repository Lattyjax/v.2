import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(
        "Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) env vars."
      );
    }

    client = createClient(url, key, {
      auth: { persistSession: false }
    });
  }
  return client;
}

export async function testConnection(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    // Try the simple leads table first; a "does not exist" error still means the connection is alive.
    const { error } = await supabase.from("leads").select("id").limit(1);
    return !error || error.code === "PGRST116" || error.message.includes("does not exist");
  } catch {
    return false;
  }
}
