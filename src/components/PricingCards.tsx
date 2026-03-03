"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Zap, Shield, Crown, Landmark, Users, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PayoneerModal } from "@/components/PayoneerModal";
import { toast } from "sonner";

const TIERS = [
    {
        key: "starter",
        label: "Starter",
        price: 0,
        priceSuffix: "/forever",
        description: "Explore the power of AI contract review.",
        accent: "slate",
        features: [
            { text: "2 Contract Scans", included: true },
            { text: "Basic Risk Detection", included: true },
            { text: "Task & Milestone Extraction", included: true },
            { text: "PDF Upload (up to 5MB)", included: true },
            { text: "AI Negotiation Counter-Clauses", included: false },
            { text: "PDF & Markdown Export", included: false },
            { text: "Advanced Gemini Analysis", included: false },
            { text: "Team Collaboration", included: false },
        ],
        cta: "Get Started Free",
        ctaHref: "/login?plan=starter",
        highlighted: false,
    },
    {
        key: "professional",
        label: "Professional",
        price: 19,
        priceSuffix: "/month",
        description: "For serious freelancers protecting their income.",
        accent: "indigo",
        badge: "✦ Most Popular",
        features: [
            { text: "Unlimited Contract Scans", included: true },
            { text: "Advanced Gemini 1.5 Pro Analysis", included: true },
            { text: "AI Counter-Clause Generator", included: true },
            { text: "PDF & Markdown Export Hub", included: true },
            { text: "Plain English Legal Translation", included: true },
            { text: "Conflict Detector (compare contracts)", included: true },
            { text: "Team Collaboration", included: false },
            { text: "Dedicated Support & CRM Sync", included: false },
        ],
        cta: "Upgrade to Professional",
        highlighted: true,
    },
    {
        key: "enterprise",
        label: "Enterprise",
        price: 49,
        priceSuffix: "/month",
        description: "For agencies and studios managing complex deals.",
        accent: "violet",
        features: [
            { text: "Unlimited Contract Scans", included: true },
            { text: "Priority Gemini 1.5 Ultra Analysis", included: true },
            { text: "AI Counter-Clause Generator", included: true },
            { text: "PDF & Markdown Export Hub", included: true },
            { text: "Team Collaboration & Bulk Analysis", included: true },
            { text: "Conflict Detector (compare contracts)", included: true },
            { text: "Dedicated Support Manager", included: true },
            { text: "CRM Sync (HubSpot / Pipedrive)", included: true },
        ],
        cta: "Upgrade to Enterprise",
        highlighted: false,
    },
];

type PayoneerPlan = "professional" | "enterprise";

interface PricingCardsProps {
    isLimitRef: boolean;
    isLoggedIn: boolean;
}

export function PricingCards({ isLimitRef, isLoggedIn }: PricingCardsProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [payoneerPlan, setPayoneerPlan] = useState<{ plan: PayoneerPlan; price: number } | null>(null);
    const router = useRouter();

    const handleStripeCheckout = async (plan: string) => {
        if (!isLoggedIn) {
            router.push(`/login?plan=${plan}`);
            return;
        }
        setLoading(plan);
        const toastId = toast.loading("Creating checkout session...");
        try {
            const res = await fetch("/api/stripe/create-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan }),
            });
            const data = await res.json();
            toast.dismiss(toastId);
            if (data.url) {
                toast.success("Redirecting to Stripe...");
                window.location.href = data.url;
            } else {
                toast.error(data.error ?? "Something went wrong");
            }
        } catch {
            toast.dismiss(toastId);
            toast.error("Could not connect to Stripe. Please try again.");
        } finally {
            setLoading(null);
        }
    };

    return (
        <>
            {/* Limit Reached Banner */}
            <AnimatePresence>
                {isLimitRef && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-10 flex items-center gap-4 p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl"
                    >
                        <Crown className="h-8 w-8 text-amber-400 shrink-0" />
                        <div>
                            <p className="font-bold text-amber-300 text-lg">You&apos;ve reached your free scan limit</p>
                            <p className="text-amber-400/70 mt-0.5">Upgrade to Professional or Enterprise for unlimited analysis.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 3-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {TIERS.map((tier, i) => (
                    <motion.div
                        key={tier.key}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.4 }}
                        className={`relative rounded-3xl flex flex-col p-7 ${tier.highlighted
                                ? "border-2 border-indigo-500/50 bg-indigo-950/30 shadow-[0_0_40px_rgba(99,102,241,0.25)]"
                                : "border border-white/10 bg-white/5"
                            }`}
                    >
                        {/* Animated pulsing glow ring for Pro card */}
                        {tier.highlighted && (
                            <motion.div
                                className="absolute inset-0 rounded-3xl border-2 border-indigo-400/30 pointer-events-none"
                                animate={{
                                    boxShadow: [
                                        "0 0 15px rgba(99,102,241,0.15), inset 0 0 15px rgba(99,102,241,0.05)",
                                        "0 0 50px rgba(99,102,241,0.45), inset 0 0 30px rgba(99,102,241,0.1)",
                                        "0 0 15px rgba(99,102,241,0.15), inset 0 0 15px rgba(99,102,241,0.05)",
                                    ],
                                    borderColor: ["rgba(99,102,241,0.3)", "rgba(139,92,246,0.7)", "rgba(99,102,241,0.3)"],
                                }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            />
                        )}

                        {/* Most Popular badge */}
                        {"badge" in tier && (
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                                    {(tier as any).badge}
                                </span>
                            </div>
                        )}

                        {/* Tier Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${tier.key === "starter" ? "bg-slate-500/10 border border-slate-500/20" :
                                tier.key === "professional" ? "bg-indigo-500/15 border border-indigo-500/30" :
                                    "bg-violet-500/15 border border-violet-500/30"
                            }`}>
                            {tier.key === "starter" ? <Shield className="h-5 w-5 text-slate-400" /> :
                                tier.key === "professional" ? <Zap className="h-5 w-5 text-indigo-400" /> :
                                    <Crown className="h-5 w-5 text-violet-400" />}
                        </div>

                        {/* Tier Info */}
                        <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${tier.key === "starter" ? "text-slate-500" :
                                tier.key === "professional" ? "text-indigo-400" : "text-violet-400"
                            }`}>{tier.label}</p>

                        <div className="flex items-end gap-1 mb-2">
                            <span className="text-4xl font-extrabold text-white">${tier.price}</span>
                            <span className="text-slate-500 pb-1">{tier.priceSuffix}</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{tier.description}</p>

                        {/* Features */}
                        <ul className="space-y-2.5 flex-1 mb-7">
                            {tier.features.map((f, fi) => (
                                <li key={fi} className={`flex items-center gap-2.5 text-sm ${f.included ? "text-slate-300" : "text-slate-700 line-through"}`}>
                                    {f.included
                                        ? <Check className={`h-4 w-4 shrink-0 ${tier.key === "professional" ? "text-indigo-400" : tier.key === "enterprise" ? "text-violet-400" : "text-emerald-500"}`} />
                                        : <X className="h-4 w-4 shrink-0 text-slate-800" />
                                    }
                                    {f.text}
                                </li>
                            ))}
                        </ul>

                        {/* CTA */}
                        {tier.key === "starter" ? (
                            <Link
                                href={(tier as any).ctaHref}
                                className="block text-center py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all font-semibold text-sm"
                            >
                                {tier.cta} <ArrowRight className="inline h-4 w-4 ml-1" />
                            </Link>
                        ) : (
                            <div className="space-y-3">
                                <button
                                    onClick={() => handleStripeCheckout(tier.key)}
                                    disabled={loading === tier.key}
                                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 ${tier.key === "professional"
                                            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] hover:scale-[1.02]"
                                            : "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_50px_rgba(139,92,246,0.6)] hover:scale-[1.02]"
                                        }`}
                                >
                                    {loading === tier.key ? (
                                        <motion.div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }} />
                                    ) : (
                                        <><Sparkles className="h-4 w-4" /> {tier.cta}</>
                                    )}
                                </button>
                                <button
                                    onClick={() => setPayoneerPlan({ plan: tier.key as PayoneerPlan, price: tier.price })}
                                    className="w-full py-2.5 rounded-xl border border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20 transition-all text-xs flex items-center justify-center gap-1.5"
                                >
                                    <Landmark className="h-3.5 w-3.5" /> Pay via Bank Transfer (Payoneer)
                                </button>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Compare features note */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-slate-600">
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> All plans include a 7-day free trial</span>
                <span>🔒 Secured by Stripe · SSL encrypted</span>
                <span>Cancel anytime · No hidden fees</span>
            </div>

            {/* Payoneer Modal */}
            {payoneerPlan && (
                <PayoneerModal
                    isOpen={!!payoneerPlan}
                    onClose={() => setPayoneerPlan(null)}
                    plan={payoneerPlan.plan}
                    price={payoneerPlan.price}
                />
            )}
        </>
    );
}
