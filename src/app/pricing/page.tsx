import React from "react";
import Link from "next/link";
import { Shield, Zap } from "lucide-react";
import { PricingCards } from "@/components/PricingCards";
import { createClient } from "../../../utils/supabase/server";

export default async function PricingPage({ searchParams }: { searchParams: Promise<{ ref?: string; cancelled?: string }> }) {
    const params = await searchParams;
    const isLimitRef = params?.ref === "limit";

    // Check if user is logged in
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isLoggedIn = !!user;

    return (
        <div className="min-h-screen bg-[#09090b] text-slate-50">
            {/* Nav */}
            <nav className="sticky top-0 z-40 border-b border-white/10 px-6 py-4 flex items-center justify-between bg-[#09090b]/80 backdrop-blur-xl">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-indigo-400" />
                    </div>
                    <span className="font-extrabold tracking-tight text-white">Scope-Shield</span>
                </Link>
                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">← Back to Dashboard</Link>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Log in</Link>
                            <Link href="/login?plan=starter" className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-full transition-colors">
                                Get Started Free
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-20">
                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full text-sm font-medium mb-6">
                        <Zap className="h-3.5 w-3.5" /> Simple, Transparent Pricing
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
                        Pick your shield level.
                    </h1>
                    <p className="text-xl text-slate-400 max-w-xl mx-auto">
                        Start free. No credit card required. Upgrade whenever your contracts demand it.
                    </p>
                </div>

                {/* 3-Tier Pricing Cards (client component) */}
                <PricingCards isLimitRef={isLimitRef} isLoggedIn={isLoggedIn} />

                {/* FAQ */}
                <div className="mt-20 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-white text-center mb-8">Common Questions</h2>
                    <div className="space-y-4">
                        {[
                            { q: "What happens when I hit my 2 free scans?", a: "You'll see a prompt to upgrade. Your existing analysis results are always accessible." },
                            { q: "Can I pay via bank transfer if Stripe isn't available?", a: "Yes! Use the 'Pay via Bank Transfer (Payoneer)' option below any paid plan. Upload your receipt and we'll activate your account within 24 hours." },
                            { q: "Is my contract data secure?", a: "Absolutely. All uploads are encrypted, row-level security is enforced at the database level, and no contract text is ever stored beyond your session." },
                        ].map(({ q, a }) => (
                            <div key={q} className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                                <p className="font-semibold text-white mb-1.5">{q}</p>
                                <p className="text-sm text-slate-400">{a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-slate-600 mt-14">
                    Enterprise needs a custom quote? <a href="mailto:enterprise@scope-shield.com" className="text-indigo-400 hover:underline">Contact us</a>
                </p>
            </div>
        </div>
    );
}
