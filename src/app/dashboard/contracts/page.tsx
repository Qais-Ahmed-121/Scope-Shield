import React from "react";
import Link from "next/link";
import { createClient } from "../../../../utils/supabase/server";
import { FileText, ArrowRight, ShieldAlert, Calendar, Plus } from "lucide-react";

export default async function ContractsListPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: contracts, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }) as any;

    const getRiskLabel = (score: number) => {
        if (score > 66) return { label: "High Risk", cls: "text-red-400 bg-red-500/10 border-red-500/20" };
        if (score > 33) return { label: "Moderate", cls: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
        return { label: "Low Risk", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">My Contracts</h2>
                    <p className="text-slate-400 mt-1">All your analyzed freelance agreements.</p>
                </div>
                <Link href="/dashboard" className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all px-4 py-2.5 rounded-xl font-medium text-sm">
                    <Plus className="w-4 h-4" /> Analyze New
                </Link>
            </div>

            {error ? (
                <div className="p-6 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20">
                    Error loading contracts: {String((error as any).message)}
                </div>
            ) : contracts && contracts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {contracts.map((contract: any) => {
                        const risk = getRiskLabel(contract.risk_score || 0);
                        return (
                            <div key={contract.id} className="group flex flex-col bg-white/5 border border-white/10 rounded-2xl p-6 transition-all hover:bg-white/8 hover:border-indigo-500/30 hover:shadow-[0_8px_30px_rgba(99,102,241,0.1)]">
                                <div className="flex items-start justify-between mb-5">
                                    <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    {contract.risk_score !== null && (
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${risk.cls}`}>
                                            <ShieldAlert className="w-3 h-3" />
                                            {risk.label} · {contract.risk_score}
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-base font-bold text-white mb-1 line-clamp-2 group-hover:text-indigo-200 transition-colors">
                                    {contract.title || "Untitled Contract"}
                                </h3>

                                <div className="flex items-center text-xs text-slate-500 mt-auto mb-5 pt-3">
                                    <Calendar className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                                    {new Date(contract.created_at).toLocaleDateString(undefined, {
                                        year: "numeric", month: "short", day: "numeric"
                                    })}
                                </div>

                                {/* Risk bar */}
                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-5">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${(contract.risk_score || 0) > 66 ? "bg-red-500" :
                                                (contract.risk_score || 0) > 33 ? "bg-amber-500" : "bg-emerald-500"
                                            }`}
                                        style={{ width: `${contract.risk_score || 0}%` }}
                                    />
                                </div>

                                <Link href={`/dashboard/contracts/${contract.id}`} className="w-full">
                                    <button className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-300 transition-all rounded-xl py-2.5 text-sm font-semibold">
                                        View Analysis <ArrowRight className="w-4 h-4" />
                                    </button>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-24 border-2 border-dashed border-white/10 rounded-3xl">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
                        <FileText className="h-8 w-8 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No contracts analyzed yet</h3>
                    <p className="text-slate-400 mb-8">Upload your first freelance agreement to identify hidden risks.</p>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white transition-all px-6 py-3 rounded-xl font-semibold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                        <Plus className="w-4 h-4" /> Analyze First Contract
                    </Link>
                </div>
            )}
        </div>
    );
}
