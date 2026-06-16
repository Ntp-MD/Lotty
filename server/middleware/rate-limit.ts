const requestCounts = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 100;
const WINDOW_MS = 60000;

export default defineEventHandler((event) => {
  const path = event.path;
  
  if (!path.startsWith("/api/")) {
    return;
  }
  
  if (path === "/api/health" || path.startsWith("/api/cron/")) {
    return;
  }
  
  const ip = getHeader(event, "x-forwarded-for") || getHeader(event, "x-real-ip");

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
