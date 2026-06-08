# Lotty - Deployment Guide

## Pre-Deployment Checklist

### ✅ Completed Fixes

**Priority 1 - Critical:**
- [x] Fixed cron job method (renamed to GET: `fetch-latest.get.ts`)
- [x] Added Thai timezone handling to `nextDrawDate()` function
- [x] Added error handling for GLO API failures (timeout + try-catch)

**Priority 2 - Important:**
- [x] Added rate limiting middleware (100 req/min per IP)
- [x] Added health check endpoint (`/api/health`)
- [x] Enhanced error handling with proper logging

**Priority 3 - Nice to have:**
- [x] Added structured logging utility (`server/utils/logger.ts`)
- [ ] Error tracking (Sentry) - Optional, add if needed
- [ ] Bundle size optimization - Check after first deploy

---

## Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
CRON_SECRET=generate-random-secret-here
```

**Generate CRON_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Vercel Configuration

### Build Settings
- **Framework Preset:** Nuxt.js
- **Build Command:** `nuxt build` (auto-detected)
- **Output Directory:** `.output` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### Cron Jobs
Configured in `vercel.json`:
- **Path:** `/api/cron/fetch-latest`
- **Schedule:** `30 8 1,16 * *` (8:30 AM UTC on 1st and 16th)
- **Method:** GET
- **Auth:** Bearer token via `CRON_SECRET`

---

## API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/advisor?scope=5y` - Lottery recommendations
- `GET /api/stats/2digit?scope=5y&type=last2` - 2-digit stats
- `GET /api/stats/3digit?scope=5y&type=last3b` - 3-digit stats
- `GET /api/stats/digits?scope=5y` - 6-digit breakdown
- `GET /api/stats/lookup?number=12&scope=5y` - Number lookup

### Protected Endpoints
- `GET /api/cron/fetch-latest` - Fetch latest lottery (requires Bearer token)

---

## Rate Limiting

- **Limit:** 100 requests per minute per IP
- **Window:** 60 seconds
- **Excluded:** `/api/health`, `/api/cron/*`
- **Response:** 429 Too Many Requests

---

## Monitoring

### Health Check
```bash
curl https://your-domain.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-06-08T08:00:00.000Z"
}
```

### Logs
- Vercel Dashboard → Deployments → [Your Deployment] → Logs
- Structured JSON logs with levels: info, warn, error, debug

---

## Supabase Requirements

### Required RPC Functions
Ensure these exist in your Supabase database:
- `get_2digit_stats(p_col, p_scope, p_month, p_day)`
- `get_3digit_stats(p_col, p_scope, p_month)`
- `get_digit_stats(p_scope)`
- `get_lookup_stats(p_number, p_col, p_scope)`

### Required Tables
- `draws` - Lottery draw results
- `stats_cache` - Cached statistics

---

## Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Production ready - all fixes applied"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Nuxt.js

3. **Configure Environment Variables**
   - Add all 4 environment variables listed above
   - Apply to Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

5. **Verify Deployment**
   ```bash
   # Check health
   curl https://your-domain.vercel.app/api/health
   
   # Check API
   curl https://your-domain.vercel.app/api/advisor?scope=5y
   ```

6. **Test Cron Job (Manual)**
   ```bash
   curl -X GET https://your-domain.vercel.app/api/cron/fetch-latest \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

---

## Post-Deployment

### Monitor First 24 Hours
- Check Vercel logs for errors
- Verify cron job runs on 1st/16th at 8:30 AM UTC
- Monitor API response times
- Check database connections

### Optional Enhancements
- Add Sentry for error tracking
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure custom domain
- Add analytics (Vercel Analytics)

---

## Troubleshooting

### Cron Job Not Running
- Check `CRON_SECRET` is set correctly
- Verify cron schedule in Vercel dashboard
- Check logs for authentication errors

### Database Connection Errors
- Verify `SUPABASE_URL` and keys are correct
- Check Supabase project is active
- Verify RPC functions exist

### Rate Limit Issues
- Adjust limits in `server/middleware/rate-limit.ts`
- Redeploy after changes

### GLO API Failures
- Check logs for timeout errors
- GLO API may be down temporarily
- Cron will retry next scheduled time

---

## Support

For issues, check:
1. Vercel deployment logs
2. Supabase logs
3. Browser console (for frontend issues)
4. Network tab (for API issues)
