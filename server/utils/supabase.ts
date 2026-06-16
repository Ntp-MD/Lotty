import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";

let _client: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin(): SupabaseClient<Database> {
	if (_client) return _client;
	const url = process.env.SUPABASE_URL;
	const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
	if (!url || !key) {
		throw createError({ statusCode: 500, message: "Supabase credentials not configured (SUPABASE_URL / SUPABASE_SERVICE_KEY)" });
	}
	_client = createClient<Database>(url, key, { auth: { persistSession: false } });
	return _client;
}
