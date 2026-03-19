# TruckLog — DOT-Compliant Fleet Inspection SaaS

A production-ready fleet pre-trip inspection and compliance management platform built with Next.js 14, Supabase, and Tailwind CSS.

## What It Is

TruckLog helps fleet managers ensure DOT compliance by:
- Managing vehicles and their inspection status (Safe ✅ / Fail ❌ / Pending ⏳)
- Generating shareable, token-based inspection links for drivers (no app download required)
- Enforcing a dispatch gatekeeper — vehicles cannot be dispatched if they haven't passed inspection
- Recording 16-point DOT pre-trip inspection checklists with defect tracking

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and API keys from **Settings → API**

### 2. Run Database Migrations

In the Supabase SQL Editor, run the contents of:
```
supabase/migrations/001_initial.sql
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Vercel Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create your-org/henry-trucklog --public --source=. --push
```

### 2. Deploy to Vercel

```bash
vercel --yes
```

Or connect your GitHub repo at [vercel.com/new](https://vercel.com/new)

### 3. Set Environment Variables in Vercel

In your Vercel project dashboard → **Settings → Environment Variables**, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Usage

1. **Sign up** at `/login` to create a manager account
2. **Add vehicles** from the dashboard
3. **Assign inspections** — generates a shareable link
4. **Share the link** with your driver (no login required)
5. **Driver completes** the 16-point DOT checklist on their phone
6. **Vehicle status updates** automatically (Safe/Fail)
7. **Dispatch gatekeeper** locks failed/pending vehicles

## Tech Stack

- **Next.js 14** — App Router, Server Components
- **TypeScript** — Full type safety
- **Tailwind CSS** — Mobile-first styling
- **Supabase** — Auth + PostgreSQL database
- **Vercel** — Deployment platform

## DOT Inspection Points

The checklist covers all 16 FMCSA-required pre-trip inspection categories:
- Exterior: Lights, Tires, Mirrors, Coupling Devices
- Safety: Brakes, Steering, Horn, Wipers, Emergency Equipment
- Engine: Fluids, Battery, Belts, Exhaust, Fuel System
- Load: Cargo Security
- Administrative: Required Documents
