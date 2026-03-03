import React from "react";
import Link from "next/link";
import { Shield, Lock, FileText, ArrowRight, Activity, Zap, Check } from "lucide-react";
import { Shield3D } from "@/components/Shield3D";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#09090b] font-sans text-slate-50">

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30">
              <Shield size={18} className="text-indigo-400" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">Scope-Shield</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-9 items-center justify-center rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:bg-indigo-500 hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-44">
          {/* Background glow */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px]" />
          </div>

          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 mb-8">
                  <span className="flex h-2 w-2 rounded-full bg-indigo-400 mr-2 animate-pulse" />
                  Scope-Shield v1.0 · Now Live
                </div>

                <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl mb-8 leading-[1.05]">
                  Secure your contracts with{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                    Intelligent Analysis
                  </span>
                </h1>

                <p className="text-lg leading-8 text-slate-400 mb-10 max-w-2xl mx-auto lg:mx-0">
                  Upload, analyze, and protect your freelance agreements.
                  Scope-Shield uses Gemini AI to extract task roadmaps and warn you about dangerous scope creep clauses before you sign.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link
                    href="/pricing"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-indigo-600 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-500 hover:scale-105 active:scale-95 w-full sm:w-auto"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href="#features"
                    className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 text-base font-medium text-slate-300 hover:bg-white/10 transition-all w-full sm:w-auto"
                  >
                    See how it works
                  </Link>
                </div>

                {/* Social proof */}
                <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start text-xs text-slate-600">
                  {["🔒 End-to-end encrypted", "⚡  Results in under 30s", "🛡️ Supabase RLS protected"].map((s, i) => (
                    <span key={i}>{s}</span>
                  ))}
                </div>
              </div>

              {/* 3D Shield Hero */}
              <div className="hidden lg:flex justify-center">
                <Shield3D />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 border-t border-white/5">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Everything you need to protect your income
              </h2>
              <p className="mt-4 text-lg text-slate-500">Built for freelancers, agencies, and solo founders.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Lock, color: "indigo", title: "Bank-Grade Encryption", desc: "Your documents are encrypted using AES-256. Only you hold the keys — we never read your contracts." },
                { icon: FileText, color: "emerald", title: "Smart PDF Parsing", desc: "Automatically extract deliverables, payment milestones, and risky clauses from any contract in seconds." },
                { icon: Activity, color: "amber", title: "AI Threat Detection", desc: "Gemini AI flags hidden risks: non-competes, survival clauses, unfair IP ownership, and unlimited revisions." },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="relative group rounded-2xl border border-white/10 bg-white/5 p-8 hover:border-white/20 transition-all">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
                    <Icon className={`h-6 w-6 text-${color}-400`} />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24 border-t border-white/5">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-white">From upload to protected in 3 steps</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Upload your PDF", desc: "Drop any contract PDF into the secure upload zone." },
                { step: "02", title: "AI analyzes it", desc: "Gemini reads the fine print and extracts all tasks and risk alerts in under 30 seconds." },
                { step: "03", title: "Get your Shield Report", desc: "Review your Risk Score, task timeline, and custom negotiation strategies." },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-400">{item.step}</div>
                  <h3 className="font-semibold text-white text-lg">{item.title}</h3>
                  <p className="text-slate-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 border-t border-white/5">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 p-12 shadow-[0_0_80px_rgba(99,102,241,0.4)]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
              <div className="md:flex md:items-center md:justify-between gap-8 relative">
                <div className="mb-8 md:mb-0">
                  <h2 className="text-3xl font-bold text-white">Ready to shield your revenue?</h2>
                  <p className="mt-3 text-indigo-200">Join thousands of freelancers who trust Scope-Shield.</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-indigo-200">
                    {["2 free scans included", "No credit card required", "Cancel anytime"].map(f => (
                      <span key={f} className="flex items-center gap-1"><Check className="h-4 w-4" />{f}</span>
                    ))}
                  </div>
                </div>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-base font-bold text-indigo-600 shadow-sm hover:bg-indigo-50 transition-all hover:scale-105 whitespace-nowrap"
                >
                  Get Started Today <Zap className="ml-2 h-5 w-5 text-amber-500" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Shield size={20} className="text-indigo-400" />
            <span className="font-extrabold text-lg text-white">Scope-Shield</span>
          </div>
          <div className="flex justify-center gap-6 text-sm text-slate-600 mb-4">
            <Link href="/pricing" className="hover:text-slate-400 transition-colors">Pricing</Link>
            <a href="mailto:support@scope-shield.com" className="hover:text-slate-400 transition-colors">Support</a>
            <Link href="/login" className="hover:text-slate-400 transition-colors">Login</Link>
          </div>
          <p className="text-xs text-slate-700">
            © {new Date().getFullYear()} Scope-Shield Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
