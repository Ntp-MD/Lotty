import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";

let _client: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin(): SupabaseClient<Database> {
	if (_client) return _client;
	const config = useRuntimeConfig();
	_client = createClient<Database>(
		process.env.SUPABASE_URL ?? config.public.supabaseUrl,
		process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || config.public.supabaseKey,
		{ auth: { persistSession: false } }
	);
	return _client;
}
