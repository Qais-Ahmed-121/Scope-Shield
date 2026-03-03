import React from "react";
import { redirect } from "next/navigation";
import { Shield, Crown, Zap } from "lucide-react";
import Link from "next/link";
import { createClient } from "../../../utils/supabase/server";
import { DashboardSidebar } from "@/components/DashboardSidebar";

const PLAN_BADGES: Record<string, { label: string; color: string; icon: "shield" | "zap" | "crown" }> = {
    starter: { label: "Starter", color: "bg-slate-500/10 border-slate-500/20 text-slate-400", icon: "shield" },
    professional: { label: "Professional", color: "bg-indigo-500/10 border-indigo-500/25 text-indigo-300", icon: "zap" },
    enterprise: { label: "Enterprise", color: "bg-violet-500/10 border-violet-500/25 text-violet-300", icon: "crown" },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    const [contractsResult, recentResult, profileResult] = await Promise.all([
        (supabase.from("contracts").select("id").eq("user_id", user.id) as any),
        (supabase.from("contracts").select("id, title, risk_score").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3) as any),
        (supabase.from("profiles").select("subscription_tier, scan_count").eq("id", user.id).maybeSingle() as any),
    ]);

    const recentContracts = recentResult.data || [];
    const profile = profileResult.data;
    const tier = (profile?.subscription_tier as string) ?? "starter";
    const scanCount = (profile?.scan_count as number) ?? (contractsResult.data?.length ?? 0);
    const badge = PLAN_BADGES[tier] ?? PLAN_BADGES.starter;

    // Free users get 2 scans
    const scanLimit = tier === "starter" ? 2 : Infinity;
    const scansLeft = Math.max(0, scanLimit - scanCount);

    return (
        <div className="flex h-screen bg-[#09090b] text-slate-50 transition-colors duration-300">
            {/* Sidebar */}
            <DashboardSidebar userEmail={user.email || ""} recentContracts={recentContracts} />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto flex flex-col relative z-0">
                {/* Top glass reflection */}
                <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none -z-10" />

                <header className="flex h-16 items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-xl px-6 lg:px-8 sticky top-0 z-10 w-full">
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

                <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full relative z-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
