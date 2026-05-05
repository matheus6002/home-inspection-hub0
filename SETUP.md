# Home Inspection Hub — Setup Guide

## Prerequisites

### 1. Install Node.js
Download and install Node.js (v20 or newer) from:
https://nodejs.org/en/download

After installing, open a new terminal and verify:
```
node --version
npm --version
```

### 2. Create a Supabase Project (free)
1. Go to https://supabase.com and sign up / log in
2. Click **New Project** — give it a name (e.g. "home-inspection-hub")
3. Choose a region close to you, set a database password
4. Wait ~2 minutes for it to provision

### 3. Run the Database Schema
1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the contents of `supabase/schema.sql` and paste it in
4. Click **Run**

### 4. Get Your API Keys
1. In Supabase, go to **Project Settings → API**
2. Copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon / public** key

### 5. Configure Environment Variables
1. Copy `.env.local.example` to `.env.local`:
   ```
   cp .env.local.example .env.local
   ```
2. Open `.env.local` and fill in your keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Running the App

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser.

## Building for Production

```bash
npm run build
npm start
```

Or deploy to Vercel for free:
1. Push this folder to a GitHub repo
2. Go to https://vercel.com, import the repo
3. Add your environment variables in Vercel's project settings
4. Deploy — done!
