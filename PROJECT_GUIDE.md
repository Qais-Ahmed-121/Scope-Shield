# 🛡️ Scope-Shield — Complete Project Guide

> AI-powered contract protection for freelancers. Built with Next.js 15, Supabase, Stripe, and Google Gemini.

---

## 📁 Project Location

```
C:\Users\qaisa\OneDrive\Desktop\Vibe Coding\Web Dev\Projects\Scope-Shield
```

---

## 🚀 How to Start the App

Open a terminal inside the project folder and run:

```powershell
npm run dev
```

Then open your browser and go to: **http://localhost:3000**

To **stop** the server: press `Ctrl + C` in that terminal (or run the kill command below)

```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```

---

## 🧱 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend + Backend | **Next.js 15** | One framework for UI + API routes |
| Database | **Supabase** (PostgreSQL) | Stores users, contracts, alerts, tasks |
| Authentication | **Supabase Auth** | Login / Signup (email + password) |
| AI Analysis | **Google Gemini 2.5 Flash** | Reads contracts, finds risks |
| Payments | **Stripe** | Online card payments |
| Manual Payments | **Payoneer** | Bank transfer for Pakistan-based users |
| Email | **Resend** | Sends approval emails to users |
| UI Framework | **Tailwind CSS + Framer Motion** | Styling + animations |
| Icons | **Lucide React** | All icons used in the UI |

---

## 🔑 Environment Variables (`.env.local`)

This file lives at the root of your project. **Never share this file publicly.**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Google Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=AIza...

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin Panel
ADMIN_EMAIL=your@email.com   ← your login email

# Resend (Emails)
RESEND_API_KEY=re_...

# Optional (not needed for no-webhook flow)
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🗄️ Supabase Database Tables

Run these SQL commands once in your **Supabase SQL Editor** (supabase.com → your project → SQL Editor):

```sql
-- User subscription profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    subscription_tier TEXT DEFAULT 'starter',  -- 'starter' | 'professional' | 'enterprise'
    subscription_status TEXT DEFAULT 'free',   -- 'free' | 'active'
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    scan_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Contracts uploaded by users
CREATE TABLE IF NOT EXISTS contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    status TEXT DEFAULT 'analyzed',
    risk_score INTEGER DEFAULT 0,
    content_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own contracts" ON contracts USING (auth.uid() = user_id);

-- AI-extracted tasks/milestones from contracts
CREATE TABLE IF NOT EXISTS extracted_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending',
    is_payment_milestone BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE extracted_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tasks" ON extracted_tasks USING (auth.uid() = user_id);

-- Risk alerts found in contracts
CREATE TABLE IF NOT EXISTS risk_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    risk_type TEXT,
    description TEXT,
    severity TEXT DEFAULT 'medium',  -- 'medium' | 'high' | 'critical'
    suggestion TEXT,
    legal_translation TEXT,
    clause_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE risk_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own alerts" ON risk_alerts USING (auth.uid() = user_id);

-- Manual Payoneer payment requests
CREATE TABLE IF NOT EXISTS manual_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL,
    receipt_url TEXT,
    status TEXT DEFAULT 'pending',  -- 'pending' | 'approved'
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE manual_payments ENABLE ROW LEVEL SECURITY;
```

---

## 📂 Project File Structure

```
Scope-Shield/
├── src/
│   ├── app/                         ← All pages and API routes
│   │   ├── page.tsx                 ← Landing page (/)
│   │   ├── layout.tsx               ← Root layout (Toaster, fonts)
│   │   ├── globals.css              ← Global styles
│   │   ├── login/                   ← Login & signup pages
│   │   ├── pricing/                 ← Pricing page (/pricing)
│   │   ├── admin/                   ← Admin panel (/admin)
│   │   │   ├── layout.tsx           ← Blocks non-admin users
│   │   │   └── page.tsx             ← Admin dashboard UI
│   │   ├── dashboard/               ← User dashboard (/dashboard)
│   │   │   ├── layout.tsx           ← Plan badge in header
│   │   │   ├── page.tsx             ← Main dashboard
│   │   │   └── contracts/
│   │   │       ├── page.tsx         ← All contracts list
│   │   │       └── [id]/page.tsx    ← Single contract report
│   │   └── api/                     ← Backend API routes
│   │       ├── analyze-contract/    ← Upload PDF → Gemini AI
│   │       ├── conflict-check/      ← Compare 2 contracts
│   │       ├── stripe/
│   │       │   ├── create-checkout/ ← Start Stripe payment
│   │       │   ├── confirm-upgrade/ ← After Stripe redirect
│   │       │   └── webhook/         ← (optional) Stripe webhooks
│   │       └── admin/
│   │           └── approve-payment/ ← Admin approves Payoneer
│   │
│   ├── components/                  ← Reusable UI components
│   │   ├── DashboardClient.tsx      ← Upload zone + scan UI
│   │   ├── DashboardSidebar.tsx     ← Left sidebar navigation
│   │   ├── DashboardStats.tsx       ← Stats cards (top of dashboard)
│   │   ├── RiskMeter.tsx            ← Risk score gauge + alert cards
│   │   ├── RoadmapTimeline.tsx      ← Task/milestone roadmap
│   │   ├── RedlinePreview.tsx       ← Contract text with risk highlights
│   │   ├── ConflictDetector.tsx     ← Compare 2 contracts for conflicts
│   │   ├── NegotiationCoPilot.tsx   ← One-click counter-clause email
│   │   ├── InvoiceDraft.tsx         ← Invoice generator per milestone
│   │   ├── ExportButtons.tsx        ← PDF / Markdown export
│   │   ├── PricingCards.tsx         ← 3-tier pricing cards
│   │   ├── PayoneerModal.tsx        ← Bank transfer payment modal
│   │   ├── AdminApprovalButton.tsx  ← Admin approve button
│   │   ├── Shield3D.tsx             ← Animated 3D shield (landing)
│   │   ├── RoadmapTimeline.tsx      ← Project milestone tracker
│   │   └── UploadZone.tsx           ← Drag-and-drop PDF upload
│   │
│   └── lib/
│       └── stripe-config.ts         ← Stripe price IDs and plan limits
│
├── utils/
│   └── supabase/
│       ├── server.ts                ← Supabase client (server-side)
│       └── client.ts                ← Supabase client (browser-side)
│
├── .env.local                       ← 🔐 Your secret API keys
├── package.json                     ← Dependencies
└── next.config.ts                   ← Next.js configuration
```

---

## 🎯 Features — Full List

### For Users
| Feature | Tier | Description |
|---|---|---|
| PDF Contract Upload | All | Upload any PDF contract |
| AI Risk Analysis | All | Gemini finds risky clauses |
| Risk Score (0-100) | All | Visual gauge showing danger level |
| Plain English Translation | All | Legal jargon explained simply |
| Task & Milestone Extraction | All | AI builds your project roadmap |
| Invoice Draft Generator | All | Generate invoice per milestone |
| Redline Preview | All | Contract text with red highlights |
| Negotiation Co-Pilot | Pro/Enterprise | One-click counter-clause email |
| Conflict Detector | Pro/Enterprise | Compare 2 contracts for contradictions |
| PDF & Markdown Export | Pro/Enterprise | Download your full analysis |
| Unlimited Scans | Pro/Enterprise | No scan limits |
| Free Tier | Starter | 2 total scans |

### For You (Admin)
| Feature | Where |
|---|---|
| View all users + their plans | `/admin` |
| See platform scan stats | `/admin` |
| View Payoneer payment receipts | `/admin` |
| Approve payments (1-click) | `/admin` → Approve & Activate |
| Auto-send approval email | Happens automatically via Resend |

---

## 💳 Payment Flow

### Stripe (Card Payment — Global)
```
User clicks "Upgrade to Professional"
→ POST /api/stripe/create-checkout
→ Redirected to Stripe checkout page
→ User pays with card
→ Stripe redirects to /dashboard?upgraded=true&plan=professional
→ Dashboard auto-calls POST /api/stripe/confirm-upgrade
→ Supabase profile updated to "professional"
→ ✅ Green toast: "Welcome to Professional!"
```

### Payoneer (Bank Transfer — Pakistan)
```
User clicks "Pay via Bank Transfer"
→ PayoneerModal opens — shows account details
→ User sends payment manually
→ User uploads receipt screenshot in the modal
→ Receipt saved → manual_payments table entry created
→ You go to /admin → see pending payment
→ Click "Approve & Activate" button
→ User's plan activated instantly
→ ✅ User receives email: "Your subscription is now active!"
```

---

## 🔐 Admin Panel (`/admin`)

**Access:** Only the email set as `ADMIN_EMAIL` in `.env.local` can access this.

**URL:** http://localhost:3000/admin (when dev server is running)

Shows:
- 📊 Analytics: Total Users · Active Subscribers · Scans Today · Pending Approvals
- 💰 Payment Queue: All Payoneer receipts waiting for review
- 👥 User Table: Every user with their plan tier, scan count, and join date

---

## 🏗️ Subscription Tiers

| | Starter (Free) | Professional ($19/mo) | Enterprise ($49/mo) |
|---|---|---|---|
| Scans | 2 total | Unlimited | Unlimited |
| AI Level | Basic | Advanced Gemini Pro | Priority Ultra |
| Counter-Clauses | ❌ | ✅ | ✅ |
| Conflict Detector | ❌ | ✅ | ✅ |
| PDF Export | ❌ | ✅ | ✅ |
| Team Features | ❌ | ❌ | ✅ |

---

## 🌐 Deployment to Vercel (Go Live)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add ALL your `.env.local` variables in Vercel's Environment Variables section
4. Change `NEXT_PUBLIC_APP_URL` to your real domain (e.g. `https://scope-shield.com`)
5. Deploy → your app is live 24/7

---

## ❓ Common Questions

**Q: The app isn't opening at localhost:3000**
→ Run `npm run dev` in your project terminal

**Q: How do I stop the server?**
→ Press `Ctrl+C` in the terminal running `npm run dev`

**Q: Gemini analysis isn't working**
→ Check `NEXT_PUBLIC_GEMINI_API_KEY` in `.env.local`

**Q: Stripe payment fails**
→ Make sure `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID_PRO` are set correctly

**Q: Admin page redirects me to login**
→ Your logged-in email must match `ADMIN_EMAIL` in `.env.local`

**Q: Resend email not sending after approval**
→ Check `RESEND_API_KEY` in `.env.local`. Also verify your sender domain in Resend dashboard.
