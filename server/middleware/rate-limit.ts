import type { H3Event } from "h3";

// NOTE: In-memory store. On serverless platforms each function instance has
// its own Map, so this provides best-effort rate limiting only. For strict
// global limits use an external store (Redis/Upstash/Supabase).
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 100;
const WINDOW_MS = 60000;

function resolveClientIp(event: H3Event): string | null {
  // On Vercel / similar PaaS, the platform sets `x-real-ip` to the observed
  // socket peer — the only header value the client cannot spoof end-to-end.
  // Prefer it. For `x-forwarded-for`, the RIGHT-most entry is the one appended
  // by the last trusted proxy hop; the LEFT-most is the client's own claim and
  // is attacker-controlled (it can rotate per request to bypass the bucket).
  const realIp = getHeader(event, "x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = getHeader(event, "x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return event.node.req.socket?.remoteAddress ?? null;
}

export default defineEventHandler((event) => {
  const path = event.path;

  if (!path.startsWith("/api/")) {
    return;
  }

  if (path === "/api/health" || path.startsWith("/api/cron/")) {
    return;
  }

  const ip = resolveClientIp(event);

  // Server-internal SSR $fetch calls carry no client IP header. Skip them so
  // they don't all share an "unknown" bucket and trip the limit under load.
  if (!ip) {
    return;
  }

  const key = `${ip}:${path}`;
  const now = Date.now();
  
  const record = requestCounts.get(key);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + WINDOW_MS });
    return;
  }
  
  if (record.count >= RATE_LIMIT) {
    throw createError({
      statusCode: 429,
      message: "Too many requests",
    });
  }
  
  record.count++;
  
  if (requestCounts.size > 10000) {
    const cutoff = now - WINDOW_MS;
    for (const [k, v] of requestCounts.entries()) {
      if (v.resetTime < cutoff) {
        requestCounts.delete(k);
      }
    }
  }
});
