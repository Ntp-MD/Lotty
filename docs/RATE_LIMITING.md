# Rate Limiting Configuration

## Current Implementation

The application uses in-memory rate limiting via `server/middleware/rate-limit.ts`:

- **Limit**: 100 requests per minute per IP/path
- **Storage**: In-memory Map (not suitable for multi-instance deployments)
- **Cleanup**: Automatic cleanup when map exceeds 10,000 entries

## Production Recommendations

For production deployments with multiple instances, implement Redis-based rate limiting:

### Option 1: Using Upstash Redis (Recommended for Vercel/Serverless)

```bash
npm install @upstash/redis @upstash/ratelimit
```

```typescript
// server/utils/rate-limit-redis.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
});
```

### Option 2: Using ioredis (For Traditional Deployments)

```bash
npm install ioredis rate-limiter-flexible
```

```typescript
// server/utils/rate-limit-redis.ts
import Redis from "ioredis";
import { RateLimiterRedis } from "rate-limiter-flexible";

const redis = new Redis(process.env.REDIS_URL);

export const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  points: 100,
  duration: 60,
  blockDuration: 60,
});
```

## Environment Variables

Add to `.env`:

```
# For Upstash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# For ioredis
REDIS_URL=redis://localhost:6379
```

## Migration Steps

1. Install chosen Redis client
2. Create new rate limit utility file
3. Update `server/middleware/rate-limit.ts` to use Redis
4. Test thoroughly in staging environment
5. Deploy to production

## Current Limitations

⚠️ **Warning**: The current in-memory implementation:
- Does not share state across multiple server instances
- Resets on server restart
- May allow rate limit bypass in load-balanced environments

For single-instance deployments (e.g., hobby projects), the current implementation is acceptable.
