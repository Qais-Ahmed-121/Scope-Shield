# Scope-Shield: AI-Powered Contract Analysis for Freelancers

Scope-Shield is a comprehensive SaaS platform built to help freelancers and agencies analyze client contracts, visualize deliverables on a roadmap, and identify harmful "scope creep" clauses before signing.

## 🚀 Features

- **Bank-Grade Security:** Client-side encryption ensures your legal documents stay private.
- **Smart PDF Extraction:** Automatically process and interpret legal jargon natively.
- **AI Task Roadmap:** Extracts deliverables and payment milestones into an interactive timeline view.
- **Risk Meter:** Automatically highlights hostile clauses like "unlimited revisions" or delayed net-90 payment terms.
- **Global Monetization:** Built-in Stripe integration alongside a manual Bank Transfer fallback designed specifically for unsupported regions.

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + `shadcn/ui` + Framer Motion
- **Database & Auth:** Supabase
- **AI Brain:** Google Gemini 2.5 Pro/Flash
- **Payments:** Stripe
- **PDF Processing:** `pdf-parse`

## ⚙️ Quick Start

### 1. Requirements
Ensure you have Node.js 18+ installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.local` or create it in the root directory and add:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

### 4. Database Setup
Execute the `supabase_setup.sql` script into your Supabase project's SQL Editor to automatically generate tables and RLS permissions.

### 5. Start the Application
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the app!

## 🛡️ License
Scope-Shield is private, proprietary software.
