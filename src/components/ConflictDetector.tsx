"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompare, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Contract {
    id: string;
    title: string;
    risk_score?: number;
}

interface Contradiction {
    clause: string;
    contract1_says: string;
    contract2_says: string;
    severity: "low" | "medium" | "high";
    recommendation: string;
}

interface ConflictDetectorProps {
    currentContractId: string;
    currentContractTitle: string;
    userContracts: Contract[];
}

export function ConflictDetector({ currentContractId, currentContractTitle, userContracts }: ConflictDetectorProps) {
    const [selectedId, setSelectedId] = useState<string>("");
    const [isChecking, setIsChecking] = useState(false);
    const [results, setResults] = useState<Contradiction[] | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const otherContracts = userContracts.filter(c => c.id !== currentContractId);

    const handleCheck = async () => {
        if (!selectedId) return;
        setIsChecking(true);
        setResults(null);
        const toastId = toast.loading("Checking for contradictions between contracts...");
        try {
            const res = await fetch("/api/conflict-check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contractId1: currentContractId, contractId2: selectedId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Check failed");
            setResults(data.contradictions ?? []);
            toast.dismiss(toastId);
            toast.success(`Conflict check complete — ${data.contradictions?.length ?? 0} issues found`);
        } catch (err: any) {
            toast.dismiss(toastId);
            toast.error(err.message || "Conflict check failed");
        } finally {
            setIsChecking(false);
        }
    };

    if (otherContracts.length === 0) return null;

    const SEVER_COLORS: Record<string, string> = {
        high: "bg-red-500/10 border-red-500/20 text-red-300",
        medium: "bg-amber-500/10 border-amber-500/20 text-amber-300",
        low: "bg-slate-500/10 border-slate-500/20 text-slate-400",
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
            >
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                    <GitCompare className="h-4 w-4 text-violet-400" />
                    Conflict Detector
                    <span className="text-xs font-normal text-slate-500 ml-1">— Compare against another contract</span>
                </span>
                {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-white/10"
                    >
                        <div className="px-6 py-5 space-y-4">
                            <p className="text-xs text-slate-500">
                                Select a previous contract from the same client to detect contradictions or conflicting terms.
                            </p>

                            <div className="flex gap-3">
                                <select
                                    value={selectedId}
                                    onChange={e => setSelectedId(e.target.value)}
                                    className="flex-1 bg-[#0f0f12] border border-white/10 text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500/50"
                                >
                                    <option value="">Select a contract to compare…</option>
                                    {otherContracts.map(c => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleCheck}
                                    disabled={!selectedId || isChecking}
                                    className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
                                >
                                    {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitCompare className="h-4 w-4" />}
                                    {isChecking ? "Checking…" : "Check Conflicts"}
                                </button>
                            </div>

                            {results !== null && (
                                <div className="space-y-3">
                                    {results.length === 0 ? (
                                        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
                                            <CheckCircle className="h-4 w-4" /> No contradictions found between these contracts. ✓
                                        </div>
                                    ) : (
                                        results.map((c, i) => (
                                            <div key={i} className={`p-4 rounded-xl border space-y-2 ${SEVER_COLORS[c.severity] ?? SEVER_COLORS.low}`}>
                                                <p className="text-xs font-bold uppercase tracking-widest opacity-70">{c.severity} conflict · {c.clause}</p>
                                                <div className="grid grid-cols-2 gap-3 text-xs">
                                                    <div>
                                                        <p className="font-semibold text-slate-400 mb-1">This contract says:</p>
                                                        <p className="leading-relaxed">{c.contract1_says}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-400 mb-1">Previous contract says:</p>
                                                        <p className="leading-relaxed">{c.contract2_says}</p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 pt-1 border-t border-white/10">{c.recommendation}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
