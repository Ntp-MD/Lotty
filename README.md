# Lotty - Thai Lottery Analytics Platform

Advanced lottery analytics platform with real-time data insights, built with Nuxt 3 and Supabase.

## Features

- 📊 **Statistical Analysis**: Comprehensive 2-digit, 3-digit, and 6-digit frequency analysis
- 🔥 **Heatmaps**: Visual representation of number frequencies
- 🎲 **Quick Pick**: Weighted random number generation based on historical gaps
- 🔍 **Number Lookup**: Detailed statistics for specific numbers
- 📱 **Responsive Design**: Mobile-first, accessible UI
- ⚡ **Performance**: Cached queries with Supabase RPC functions
- 🔒 **Security**: Row-level security, rate limiting, security headers

## Tech Stack

- **Framework**: Nuxt 3.12.4
- **UI**: Vue 3.4.34
- **Database**: Supabase (PostgreSQL)
- **Language**: TypeScript (strict mode)
- **Styling**: Custom CSS with CSS variables
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account
- Environment variables configured

### Installation

```bash
npm install
```

### Environment Variables

Create `.env` file:

```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
CRON_SECRET=your-cron-secret
```

### Database Setup

Run the migration file:

```bash
# Execute migrations/001_init.sql in your Supabase SQL editor
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000`

### Build

```bash
npm run build
npm run preview
```

## API Endpoints

### Public Endpoints

- `GET /api/stats/2digit` - 2-digit statistics
- `GET /api/stats/3digit` - 3-digit statistics
- `GET /api/stats/digits` - 6-digit breakdown
- `GET /api/stats/lookup` - Number lookup
- `GET /api/advisor` - Number recommendations
- `GET /api/latest-draw` - Latest draw results
- `GET /api/health` - Health check

### Protected Endpoints

- `GET /api/cron/fetch-latest` - Fetch latest draw (requires Bearer token)

## Project Structure

```
lotty/
├── assets/style/          # CSS files
├── components/            # Vue components
├── composables/           # Vue composables
├── docs/                  # Documentation
├── layouts/               # Nuxt layouts
├── migrations/            # Database migrations
├── pages/                 # Nuxt pages
├── server/
│   ├── api/              # API endpoints
│   ├── middleware/       # Server middleware
│   └── utils/            # Server utilities
├── types/                # TypeScript types
└── nuxt.config.ts        # Nuxt configuration
```

## Security Features

- ✅ Row-level security (RLS) on all tables
- ✅ Rate limiting (100 req/min per IP)
- ✅ Security headers (X-Frame-Options, CSP, etc.)
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Cron endpoint authentication

## Performance Optimizations

- Database query caching via `stats_cache` table
- Supabase RPC functions for complex queries
- Route-level caching (1 hour for stats)
- Indexed database columns
- Lazy loading components

## Code Quality

- TypeScript strict mode enabled
- No `as any` type assertions
- Comprehensive input validation
- Proper error handling
- Type-safe Supabase client

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Thai Government Lottery Office (GLO) for lottery data
- LINE Seed Sans TH font
- Nuxt.js and Vue.js communities
