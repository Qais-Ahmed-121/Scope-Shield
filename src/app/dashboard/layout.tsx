import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/server";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { UsageProvider } from "@/context/UsageContext";
import { DashboardHeader } from "@/components/DashboardHeader";

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

    return (
        <UsageProvider initialScanCount={scanCount} initialTier={tier}>
            <div className="flex h-screen bg-[#09090b] text-slate-50 transition-colors duration-300">
                {/* Sidebar */}
                <DashboardSidebar userEmail={user.email || ""} recentContracts={recentContracts} />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto flex flex-col relative z-0">
                    {/* Top glass reflection */}
                    <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none -z-10" />

                    <DashboardHeader />

                    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full relative z-10">
                        {children}
                    </div>
                </main>
            </div>
        </UsageProvider>
    );
}
