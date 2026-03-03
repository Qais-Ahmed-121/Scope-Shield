"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { UploadZone } from "@/components/UploadZone";
import { DashboardStats } from "@/components/DashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, AlertCircle, X, Sparkles, Crown, Check } from "lucide-react";
import { toast } from "sonner";

const STAGES = [
    { label: "Scanning Document", sub: "Reading PDF structure and extracting text layers..." },
    { label: "Identifying Clauses", sub: "Mapping deliverables and payment milestones..." },
    { label: "AI Risk Analysis", sub: "Gemini 2.5 contract attorney is assessing danger zones..." },
    { label: "Generating Report", sub: "Compiling your Shield Report with negotiation strategies..." },
];

interface DashboardClientProps {
    totalContracts: number;
    highRiskCount: number;
    tasksExtracted: number;
    avgRiskScore: number;
    scanCount: number;
    isFree: boolean;
}

export function DashboardClient({ totalContracts, highRiskCount, tasksExtracted, avgRiskScore, scanCount, isFree }: DashboardClientProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [stageIndex, setStageIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [limitReached, setLimitReached] = useState(isFree && scanCount >= 1);
    const [upgradeSuccess, setUpgradeSuccess] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Auto-confirm Stripe upgrade on redirect back from checkout (no webhook needed)
    useEffect(() => {
        const upgraded = searchParams.get("upgraded");
        const plan = searchParams.get("plan");
        if (upgraded === "true" && plan) {
            fetch("/api/stripe/confirm-upgrade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan }),
            }).then(() => {
                setUpgradeSuccess(plan);
                // Clean the URL
                router.replace("/dashboard");
                // Refresh after 2s to reload server-side plan badge
                setTimeout(() => router.refresh(), 2000);
            }).catch(console.error);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpload = useCallback(async (file: File) => {
        if (limitReached) {
            router.push("/pricing?ref=limit");
            return;
        }

        setIsProcessing(true);
        setError(null);
        setStageIndex(0);

        const interval = setInterval(() => {
            setStageIndex(prev => Math.min(prev + 1, STAGES.length - 1));
        }, 2800);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const toastId = toast.loading("Scanning contract with Gemini AI...");
            const response = await fetch("/api/analyze-contract", { method: "POST", body: formData });
            clearInterval(interval);
            toast.dismiss(toastId);
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 403) {
                    setLimitReached(true);
                    toast.error("Free scan limit reached — upgrade to Pro.");
                    router.push("/pricing?ref=limit");
                    return;
                }
                const msg = data.error || "Failed to analyze. Please try again.";
                toast.error(msg);
                setError(msg);
                setIsProcessing(false);
                return;
            }

            if (data.contractId) {
                toast.success("Contract scanned successfully! Redirecting to report...");
                router.push(`/dashboard/contracts/${data.contractId}`);
            } else {
                const msg = "Analysis ran but no contract was saved. Check your Contracts list.";
                toast.error(msg);
                setError(msg);
                setIsProcessing(false);
            }
        } catch (err: unknown) {
            clearInterval(interval);
            setError(err instanceof Error ? err.message : "An unexpected error occurred.");
            setIsProcessing(false);
        }
    }, [limitReached, router]);

    return (
        <div className="pb-12">
            {/* Upgrade Success Toast */}
            {upgradeSuccess && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl"
                >
                    <Check className="h-5 w-5 text-emerald-400 shrink-0" />
                    <p className="text-emerald-300 font-semibold">
                        🎉 Welcome to <span className="capitalize">{upgradeSuccess}</span>! Your plan has been upgraded.
                    </p>
                </motion.div>
            )}

            {/* Stats Header */}
            <DashboardStats
                totalContracts={totalContracts}
                highRiskCount={highRiskCount}
                tasksExtracted={tasksExtracted}
                avgRiskScore={avgRiskScore}
            />

            {/* Free Tier Limit Banner */}
            {limitReached && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl"
                >
                    <Crown className="h-6 w-6 text-amber-400 shrink-0" />
                    <div className="flex-1">
                        <p className="font-bold text-amber-300">Free Scan Limit Reached</p>
                        <p className="text-sm text-amber-400/70">You&apos;ve used your 1 free contract scan. Upgrade to Pro for unlimited scans.</p>
                    </div>
                    <a
                        href="/pricing?ref=limit"
                        className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-105"
                    >
                        <Crown className="h-4 w-4" /> Upgrade Now
                    </a>
                </motion.div>
            )}

            <AnimatePresence mode="popLayout">
                {isProcessing ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-8"
                    >
                        {/* Laser Scanning Animation */}
                        <div className="relative mx-auto w-full max-w-lg h-64 rounded-3xl border border-indigo-500/30 bg-indigo-500/5 overflow-hidden flex flex-col items-center justify-center">
                            {/* Grid lines background */}
                            <div className="absolute inset-0 opacity-10"
                                style={{
                                    backgroundImage: "linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)",
                                    backgroundSize: "30px 30px"
                                }}
                            />

                            {/* Laser scan line */}
                            <motion.div
                                className="absolute left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                                animate={{ top: ["5%", "95%", "5%"] }}
                                transition={{ duration: 2.5, ease: "linear", repeat: Infinity }}
                            />

                            {/* Corner brackets */}
                            {[["top-3 left-3", "border-t-2 border-l-2"], ["top-3 right-3", "border-t-2 border-r-2"], ["bottom-3 left-3", "border-b-2 border-l-2"], ["bottom-3 right-3", "border-b-2 border-r-2"]].map(([pos, borders], i) => (
                                <div key={i} className={`absolute ${pos} w-5 h-5 border-indigo-400 ${borders} rounded-sm`} />
                            ))}

                            <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                <Shield className="h-12 w-12 text-indigo-400 mb-4" />
                            </motion.div>

                            <AnimatePresence mode="wait">
                                <motion.div key={stageIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-center px-6">
                                    <h3 className="text-lg font-bold text-white">{STAGES[stageIndex]?.label}</h3>
                                    <p className="text-sm text-slate-400 mt-1">{STAGES[stageIndex]?.sub}</p>
                                </motion.div>
                            </AnimatePresence>

                            {/* Stage dots */}
                            <div className="flex gap-1.5 mt-5 absolute bottom-4">
                                {STAGES.map((_, i) => (
                                    <div key={i} className={`h-1 rounded-full transition-all duration-700 ${i <= stageIndex ? "w-8 bg-indigo-400" : "w-2 bg-white/10"}`} />
                                ))}
                            </div>
                        </div>

                        {/* Skeleton layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                                <Skeleton className="h-5 w-3/4 bg-white/10" />
                                <div className="flex justify-center py-4">
                                    <Skeleton className="h-40 w-40 rounded-full bg-white/10" />
                                </div>
                                {[1, 2].map(i => (
                                    <div key={i} className="p-4 rounded-2xl border border-white/10 space-y-2">
                                        <Skeleton className="h-4 w-1/4 bg-white/10" />
                                        <Skeleton className="h-4 w-full bg-white/10" />
                                    </div>
                                ))}
                            </div>
                            <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex gap-4 pl-6 border-l-2 border-white/10">
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-1/2 bg-white/10" />
                                            <Skeleton className="h-3 w-full bg-white/10" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center min-h-[55vh]"
                    >
                        <div className="text-center mb-10 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full text-sm font-medium mb-6">
                                <Sparkles className="h-3.5 w-3.5" /> Powered by Gemini 2.5 · Contract Attorney AI
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
                                Upload your contract.
                                <br />
                                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">We protect you.</span>
                            </h2>
                            <p className="text-slate-400 text-lg">
                                Our AI reads the fine print so you don&apos;t have to. Detect hidden risks, scope creep traps, and unfair clauses in seconds.
                            </p>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm text-red-300">
                                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-400" />
                                <p className="flex-1">{error}</p>
                                <button onClick={() => setError(null)}><X className="h-4 w-4 text-red-400/60 hover:text-red-400" /></button>
                            </motion.div>
                        )}

                        <UploadZone onUpload={handleUpload} isProcessing={isProcessing} />

                        {isFree && !limitReached && (
                            <p className="mt-5 text-xs text-slate-600 text-center">
                                {1 - scanCount} free scan{1 - scanCount !== 1 ? "s" : ""} remaining on Free Plan · <a href="/pricing" className="text-indigo-400 hover:underline">Upgrade to Pro</a>
                            </p>
                        )}

                        <div className="flex flex-wrap justify-center gap-6 mt-6 text-xs text-slate-600">
                            {["🔒 End-to-end encrypted", "⚡ Results in under 30s", "🛡️ Supabase RLS protected", "📄 Supports PDF up to 10MB"].map((item, i) => (
                                <span key={i}>{item}</span>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
