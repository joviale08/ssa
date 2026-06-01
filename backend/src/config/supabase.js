import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

if (!env.supabase.url || !env.supabase.serviceKey) {
  throw new Error(
    "❌ Configuration Supabase manquante. Vérifie SUPABASE_URL et SUPABASE_SERVICE_KEY dans backend/.env"
  );
}

export const supabase = createClient(env.supabase.url, env.supabase.serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});