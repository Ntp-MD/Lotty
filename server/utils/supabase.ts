import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";

let _client: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin(): SupabaseClient<Database> {
	if (_client) return _client;
	const url = process.env.SUPABASE_URL;
	// Server-side writes (stats_cache upsert/delete, draws insert) require the
	// service-role key. Silently falling back to the anon key passes RLS for
	// reads but silently NO-OPs every write, leaving the cache stale and the
	// expensive RPCs running on every request. Fail loudly instead.
	const key = process.env.SUPABASE_SERVICE_KEY;
	if (!url || !key) {
		throw createError({
			statusCode: 500,
			message: "Supabase credentials not configured (SUPABASE_URL / SUPABASE_SERVICE_KEY)",
		});
	}
	_client = createClient<Database>(url, key, { auth: { persistSession: false } });
	return _client;
}
