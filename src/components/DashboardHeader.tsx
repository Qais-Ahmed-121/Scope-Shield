"use client";

import React from "react";
import { Shield, Crown, Zap } from "lucide-react";
import Link from "next/link";
import { useUsage } from "@/context/UsageContext";

const PLAN_BADGES: Record<string, { label: string; color: string; icon: "shield" | "zap" | "crown" }> = {
    starter: { label: "Starter", color: "bg-slate-500/10 border-slate-500/20 text-slate-400", icon: "shield" },
    professional: { label: "Professional", color: "bg-indigo-500/10 border-indigo-500/25 text-indigo-300", icon: "zap" },
    enterprise: { label: "Enterprise", color: "bg-violet-500/10 border-violet-500/25 text-violet-300", icon: "crown" },
};

export function DashboardHeader() {
    const { scanCount, tier } = useUsage();
    const badge = PLAN_BADGES[tier] ?? PLAN_BADGES.starter;

    // Free users get 2 scans
    const scanLimit = tier === "starter" ? 2 : Infinity;
    const scansLeft = Math.max(0, scanLimit - scanCount);

    return (
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-black/60 backdrop-blur-2xl px-6 lg:px-8 sticky top-0 z-50 w-full shadow-2xl">
            <h1 className="text-xl font-bold tracking-tight text-white">Contract Analysis</h1>

            {/* Plan Badge */}
            <div className="flex items-center gap-3">
                <Link
                    href="/pricing"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all hover:scale-105 ${badge.color}`}
                >
                    {badge.icon === "shield" && <Shield className="h-3.5 w-3.5" />}
                    {badge.icon === "zap" && <Zap className="h-3.5 w-3.5" />}
                    {badge.icon === "crown" && <Crown className="h-3.5 w-3.5" />}
                    Plan: {badge.label}
                    {tier === "starter" && (
                        <span className="ml-1 text-slate-600 font-normal">
                            ({scansLeft}/{scanLimit} scans left)
                        </span>
                    )}
                </Link>

                {tier === "starter" && (
                    <Link
                        href="/pricing"
                        className="text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-3 py-1.5 rounded-full hover:from-indigo-500 hover:to-violet-500 transition-all"
                    >
                        Upgrade ↗
                    </Link>
                )}
            </div>
        </header>
    );
}
