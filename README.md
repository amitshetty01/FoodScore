# 🍎 FoodScore — Know What You Eat

A full-stack Next.js application that gives any food product a health score from 1–10 with detailed nutritional breakdown, powered by Open Food Facts (3M+ products).

![FoodScore](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8) ![Prisma](https://img.shields.io/badge/Prisma-5-2d3748)

---

## ✨ Features

- **Instant Health Scores** — 1–10 rating based on sugar, sodium, sat fat, protein, fiber, additives
- **Barcode Scanner** — Real-time camera scanning via html5-qrcode
- **Search 3M+ Products** — Powered by Open Food Facts API
- **User Accounts** — Email/password + Google OAuth via NextAuth
- **Favorites** — Save and revisit your rated products
- **Dark Mode** — System-aware with manual toggle
- **Admin Dashboard** — Users, searches, top products, analytics
- **SEO-optimized** — Structured data, sitemap, per-product meta tags
- **AdSense Ready** — Placeholder zones for monetization

---

## 📁 Project Structure

```
foodscore/
├── prisma/
│   ├── schema.prisma        # Database schema (User, Favorite, CachedProduct...)
│   └── seed.ts              # Demo data seeder
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/        # NextAuth + signup routes
│   │   │   ├── products/    # Search & barcode lookup
│   │   │   ├── user/        # Favorites CRUD
│   │   │   └── admin/       # Admin stats
│   │   ├── product/[barcode]/ # Product detail page (SEO)
│   │   ├── search/          # Search results page
│   │   ├── scan/            # Barcode scanner page
│   │   ├── dashboard/       # User favorites dashboard
│   │   ├── admin/           # Admin panel
│   │   ├── login/           # Auth pages
│   │   ├── signup/
│   │   ├── sitemap.ts       # Auto-generated sitemap
│   │   ├── robots.ts        # Robots.txt
│   │   └── layout.tsx       # Root layout + metadata
│   ├── components/
│   │   ├── features/
│   │   │   ├── ScoreRing.tsx        # Animated SVG score ring
│   │   │   ├── SearchBar.tsx        # Search/barcode input
│   │   │   ├── ProductCard.tsx      # Search result card
│   │   │   ├── NutritionPanel.tsx   # Full breakdown panel
│   │   │   ├── BarcodeScanner.tsx   # Camera scanner
│   │   │   └── FavoriteButton.tsx   # Save/unsave product
│   │   └── layout/
│   │       ├── Navbar.tsx           # Responsive navbar with theme toggle
│   │       └── Providers.tsx        # Session + ThemeProvider
│   ├── lib/
│   │   ├── openfoodfacts.ts  # Open Food Facts API wrapper
│   │   ├── scoring.ts        # Health score algorithm
│   │   ├── prisma.ts         # Prisma client singleton
│   │   ├── auth.ts           # NextAuth config
│   │   └── utils.ts          # Utility helpers
│   └── types/
│       └── index.ts          # TypeScript interfaces
├── .env.example
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 🗄️ Database Schema

```prisma
User          # id, name, email, password (hashed), role (USER|ADMIN)
Account       # OAuth accounts (NextAuth)
Session       # Active sessions (NextAuth)
Favorite      # userId + barcode + name + score (unique per user+barcode)
SearchHistory # userId + query (analytics)
CachedProduct # barcode + full OFF data + score (TTL cache)
```

---

## 🔌 API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/signup` | — | Register new user |
| GET | `/api/auth/[...nextauth]` | — | NextAuth handlers |
| GET | `/api/products?barcode=X` | — | Get product by barcode |
| GET | `/api/products?q=X&page=N` | — | Search products |
| GET | `/api/user/favorites` | ✓ | Get user's favorites |
| POST | `/api/user/favorites` | ✓ | Add to favorites |
| DELETE | `/api/user/favorites` | ✓ | Remove from favorites |
| GET | `/api/admin` | Admin | Platform stats |

---

## 🧮 Scoring Algorithm

Starting score: **5.0 / 10**

| Factor | Condition | Points |
|--------|-----------|--------|
| Sugar | >22.5g/100g | −2.5 |
| Sugar | >12g/100g | −1.5 |
| Sugar | <5g/100g | +0.5 |
| Sodium | >1.5g/100g | −2.0 |
| Sodium | <0.1g/100g | +0.5 |
| Saturated Fat | >10g/100g | −2.0 |
| Saturated Fat | <1.5g/100g | +0.5 |
| Protein | ≥20g/100g | +2.0 |
| Protein | ≥10g/100g | +1.0 |
| Fiber | ≥6g/100g | +1.5 |
| Fiber | ≥3g/100g | +0.8 |
| Harmful additives | Per additive | −0.7 each |
| NOVA Group 4 | Ultra-processed | −1.0 |
| NOVA Group 1 | Unprocessed | +1.0 |
| Good labels | Organic, etc. | +0.25 each |

Final score is clamped to **1–10**.

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL (local or cloud)
- Git

### Step 1 — Clone and Install

```bash
git clone https://github.com/yourusername/foodscore
cd foodscore
npm install
```

### Step 2 — Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/foodscore"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

Generate a secret:
```bash
openssl rand -base64 32
```

### Step 3 — Database Setup

```bash
# Create the database
createdb foodscore

# Push schema
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed demo data
npm run db:seed
```

### Step 4 — Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo credentials:**
- Admin: `admin@foodscore.app` / `admin123456`
- User: `demo@foodscore.app` / `demo123456`

---

## 🌐 Production Deployment

### Option A — Vercel (Recommended)

1. **Push to GitHub:**
```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/youruser/foodscore
git push -u origin main
```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com) → New Project → Import your repo

3. **Set Environment Variables in Vercel Dashboard:**
```
DATABASE_URL=postgresql://...   (use Vercel Postgres or Supabase)
NEXTAUTH_SECRET=<generated>
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

4. **Database — Vercel Postgres (recommended):**
   - Vercel Dashboard → Storage → Create Postgres database
   - Copy `DATABASE_URL` to environment variables

5. **Run migrations on first deploy:**
```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

6. **Deploy!** — Vercel auto-deploys on every push to main.

### Option B — Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

railway login
railway new foodscore

# Add PostgreSQL plugin in Railway dashboard
# Set environment variables in Railway dashboard

railway up
```

### Option C — Self-hosted (Ubuntu/Debian VPS)

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb foodscore

# Clone and setup
git clone your-repo && cd foodscore
npm install
cp .env.example .env
# Edit .env with production values

npm run db:push
npm run db:generate
npm run db:seed
npm run build

# Start with PM2
npm install -g pm2
pm2 start npm --name "foodscore" -- start
pm2 startup && pm2 save

# Nginx reverse proxy
sudo apt install nginx
# Configure nginx to proxy port 80 → 3000
```

---

## 📈 Monetization Setup

### Google AdSense

1. Sign up at [adsense.google.com](https://adsense.google.com)
2. Add your `NEXT_PUBLIC_ADSENSE_ID` to `.env`
3. Replace ad placeholder divs with actual AdSense components:

```tsx
// src/components/features/AdUnit.tsx
'use client';
import { useEffect } from 'react';

export function AdUnit({ slot }: { slot: string }) {
  useEffect(() => {
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
  }, []);

  return (
    <ins className="adsbygoogle" data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
      data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
  );
}
```

4. Add the AdSense script to `layout.tsx`:

```tsx
<Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`} crossOrigin="anonymous" />
```

### Affiliate Links

Replace the affiliate placeholder sections in product pages with:
- Amazon Product API results for similar/healthier products
- ShareASale or Impact affiliate links
- Custom affiliate tracking via UTM parameters

---

## 🔧 Common Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:push      # Sync schema to DB without migration
npm run db:migrate   # Create and apply migration
npm run db:seed      # Seed demo data
npm run lint         # Run ESLint
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — use freely for personal and commercial projects.

---

Built with ❤️ using Next.js, Tailwind CSS, Prisma, and Open Food Facts API.
