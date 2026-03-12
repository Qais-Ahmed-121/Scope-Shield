# Scope-Shield: AI-Powered Contract Governance & Risk Mitigation

Scope-Shield is an elite SaaS platform engineered for freelancers and agencies. We utilize advanced AI to neutralize "scope creep," automate deliverable tracking, and provide comprehensive risk governance for every contract you sign.

## 🚀 Key Strategic Features

- **Risk Governance Engine:** Identifies predatory clauses like "unlimited revisions" and extreme payment delays with precision.
- **Automated Deliverable Roadmaps:** Instantly converts contract terms into interactive, milestone-based project timelines.
- **Financial Intelligence:** Seamlessly tracks payment milestones and generates professional invoice drafts based on contract progression.
- **Negotiation Co-Pilot:** Provides AI-generated counter-clauses and professional communication templates to secure fairer terms.
- **Enterprise-Grade Security:** Utilizes client-side encryption and secure processing to ensure complete confidentiality of legal documents.

## 🛠️ Technology Ecosystem

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
