import React from "react";
import { createClient } from "../../../utils/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Pull aggregate stats for this user
    const [contractsResult, alertsResult, tasksResult, profileResult] = await Promise.all([
        supabase.from("contracts").select("id, risk_score").eq("user_id", user.id) as any,
        supabase.from("risk_alerts").select("id, severity").eq("user_id", user.id) as any,
        supabase.from("extracted_tasks").select("id").eq("user_id", user.id) as any,
        supabase.from("profiles").select("subscription_status, scan_count").eq("id", user.id).single() as any,
    ]);

    const contracts = contractsResult.data || [];
    const alerts = alertsResult.data || [];
    const tasks = tasksResult.data || [];
    const profile = profileResult.data;

    const totalContracts = contracts.length;
    const highRiskCount = alerts.filter((a: any) => a.severity === "critical" || a.severity === "high").length;
    const tasksExtracted = tasks.length;
    const avgRiskScore = totalContracts > 0
        ? Math.round(contracts.reduce((sum: number, c: any) => sum + (c.risk_score || 0), 0) / totalContracts)
        : 0;

    const isFree = !profile || profile.subscription_status !== "pro";
    const scanCount = profile?.scan_count ?? totalContracts;

    return (
        <DashboardClient
            totalContracts={totalContracts}
            highRiskCount={highRiskCount}
            tasksExtracted={tasksExtracted}
            avgRiskScore={avgRiskScore}
            scanCount={scanCount}
            isFree={isFree}
        />
    );
}
