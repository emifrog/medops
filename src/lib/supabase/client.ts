import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types.generated";

let _supabase: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> | null {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  _supabase = createClient<Database>(url, key);
  return _supabase;
}

// Compat : export direct (retourne null si env manquant, ex: prerender)
export const supabase = typeof window !== "undefined" ? getSupabase() : null;
