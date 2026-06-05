import { getSupabaseAdmin } from "~/server/utils/supabase";

const GLO_API = "https://www.glo.or.th/api/lottery/getLatestLottery";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const auth = getHeader(event, "authorization");
  if (auth !== `Bearer ${config.cronSecret}`) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const gloData = await $fetch<{
    status: { code: string };
    response: { date: string; prizes: { first: { number: string }; last2: { number: string }; last3f: { number: string }; last3b: { number: string } } };
  }>(GLO_API, { method: "POST" });

  if (gloData?.status?.code !== "000") {
    return { status: "not_ready", draw_date: null };
  }

  const prizes = gloData.response.prizes;
  const drawDate = gloData.response.date;

  const db = getSupabaseAdmin();

  const { data: existing } = await db.from("draws").select("id").eq("draw_date", drawDate).maybeSingle();
  if (existing) return { status: "already_exists", draw_date: drawDate };

  const { error } = await db.from("draws").insert({
    draw_date: drawDate,
    first: prizes.first.number,
    last2: prizes.last2.number,
    last3f: prizes.last3f.number,
    last3b: prizes.last3b.number,
    second: [],
    third: [],
    fourth: [],
    fifth: [],
    near1: [],
  });

  if (error) throw createError({ statusCode: 500, message: error.message });

  await db.from("stats_cache").delete().neq("id", 0);

  return { status: "inserted", draw_date: drawDate };
});
