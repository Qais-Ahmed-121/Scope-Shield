import React from "react";
import { notFound } from "next/navigation";
import { RiskMeter, AlertItem } from "@/components/RiskMeter";
import { RoadmapTimeline, TimelineItem } from "@/components/RoadmapTimeline";
import { RedlinePreview } from "@/components/RedlinePreview";
import { ConflictDetector } from "@/components/ConflictDetector";
import { Download, ArrowLeft, Shield, Calendar, Hash } from "lucide-react";
import Link from "next/link";
import { createClient } from "../../../../../utils/supabase/server";
import { ExportButtons } from "@/components/ExportButtons";

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return notFound();

    const [contractRes, tasksRes, alertsRes, profileRes, allContractsRes] = await Promise.all([
        supabase.from("contracts").select("*").eq("id", id).single(),
        supabase.from("extracted_tasks").select("*").eq("contract_id", id).order("created_at", { ascending: true }),
        supabase.from("risk_alerts").select("*").eq("contract_id", id),
        (supabase.from("profiles").select("subscription_tier").eq("id", user.id).maybeSingle() as any),
        (supabase.from("contracts").select("id, title, risk_score").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20) as any),
    ]);

    const { data: contract, error } = contractRes;
    if (error || !contract) notFound();

    const tasksData = tasksRes.data || [];
    const alertsData = alertsRes.data || [];
    const planTier: string = (profileRes.data as any)?.subscription_tier ?? "starter";
    const userContracts = (allContractsRes.data as any[]) ?? [];

    // Map Tasks
    const timelineItems: TimelineItem[] = (tasksData as any[]).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        type: task.is_payment_milestone ? "payment" : "deliverable",
        status: task.status
    }));

    // Map Alerts
    const alertItems: AlertItem[] = (alertsData as any[]).map(alert => ({
        description: alert.description,
        severity: alert.severity as any,
        legalTranslation: alert.legal_translation || undefined,
        negotiationStrategy: alert.suggestion || undefined
    }));

    const riskScore = (contract as any).risk_score || 0;
    const contractText = (contract as any).content_text || "";
    const getRiskColor = (s: number) => s > 66 ? 'text-red-400' : s > 33 ? 'text-amber-400' : 'text-emerald-400';

    return (
        <div className="space-y-8 pb-16">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <Link href="/dashboard/contracts" className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300 font-medium mb-3 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to My Contracts
                    </Link>
                    <h2 className="text-3xl font-bold text-white leading-tight">{(contract as any).title || "Contract Analysis"}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date((contract as any).created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> {id.slice(0, 8).toUpperCase()}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="text-center px-5 py-3 bg-white/5 border border-white/10 rounded-2xl">
                            <p className="text-xs text-slate-500 mb-0.5">Tasks Found</p>
                            <p className="text-2xl font-bold text-white">{timelineItems.length}</p>
                        </div>
                        <div className="text-center px-5 py-3 bg-white/5 border border-white/10 rounded-2xl">
                            <p className="text-xs text-slate-500 mb-0.5">Risk Score</p>
                            <p className={`text-2xl font-bold ${getRiskColor(riskScore)}`}>{riskScore}</p>
                        </div>
                        <div className="text-center px-5 py-3 bg-white/5 border border-white/10 rounded-2xl">
                            <p className="text-xs text-slate-500 mb-0.5">Flags</p>
                            <p className="text-2xl font-bold text-red-400">{alertItems.length}</p>
                        </div>
                    </div>
                    <ExportButtons contractTitle={(contract as any).title} tasks={timelineItems} alerts={alertItems} />
                </div>
            </div>

            {/* Risk Banner */}
            {riskScore > 60 && (
                <div className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                    <Shield className="h-6 w-6 text-red-400 shrink-0" />
                    <div>
                        <p className="font-bold text-red-300">High-Risk Contract Detected</p>
                        <p className="text-sm text-red-400/70">
                            {alertItems.filter(a => a.severity === 'critical').length} critical and {alertItems.filter(a => a.severity === 'high').length} high-severity risks detected. Review each flag carefully before signing.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Redline Preview ── */}
            {contractText && (
                <RedlinePreview
                    contractText={contractText}
                    alerts={alertItems}
                />
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                    <RiskMeter score={riskScore} alerts={alertItems} planTier={planTier} />
                </div>
                <div className="lg:col-span-3">
                    <RoadmapTimeline items={timelineItems} contractId={id} contractTitle={(contract as any).title} />
                </div>
            </div>

            {/* ── Conflict Detector ── */}
            <ConflictDetector
                currentContractId={id}
                currentContractTitle={(contract as any).title}
                userContracts={userContracts}
            />
        </div>
    );
}
