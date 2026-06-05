import { createClient } from "@supabase/supabase-js";

let _client: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (_client) return _client;
  const config = useRuntimeConfig();
  _client = createClient(
    process.env.SUPABASE_URL ?? config.public.supabaseUrl,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || config.public.supabaseKey,
    { auth: { persistSession: false } }
  );
  return _client;
}
