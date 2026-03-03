"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ShieldCheck, AlertCircle, Lock, Zap } from "lucide-react";
import { PaymentModal } from "@/components/PaymentModal";
import { NegotiationCoPilot } from "@/components/NegotiationCoPilot";

export type AlertItem = {
    description: string;
    severity: "medium" | "high" | "critical";
    legalTranslation?: string;
    negotiationStrategy?: string;
};

interface RiskMeterProps {
    score: number; // 0 (safest) to 100 (most dangerous)
    alerts?: AlertItem[];
    title?: string;
    planTier?: string; // "starter" | "professional" | "enterprise"
}

export function RiskMeter({ score, alerts = [], title = "Contract Risk Score", planTier = "starter" }: RiskMeterProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Clamp score between 0 and 100
    const normalizedScore = Math.min(Math.max(score, 0), 100);

    // Calculate stroke dasharray for the gauge (half circle)
    const radius = 80;
    const circumference = radius * Math.PI;
    const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

    let color = "text-emerald-500";
    let bg = "bg-emerald-50 dark:bg-emerald-900/20";
    let statusText = "Low Risk";
    let Icon = ShieldCheck;

    if (normalizedScore > 33 && normalizedScore <= 66) {
        color = "text-amber-500";
        bg = "bg-amber-50 dark:bg-amber-900/20";
        statusText = "Moderate Risk";
        Icon = AlertTriangle;
    } else if (normalizedScore > 66) {
        color = "text-red-500";
        bg = "bg-red-50 dark:bg-red-900/20";
        statusText = "High Risk";
        Icon = AlertCircle;
    }

    return (
        <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center bg-white dark:bg-slate-950 shadow-sm relative overflow-hidden h-full`}>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6">{title}</h3>

            <div className="relative w-48 h-24 flex items-end justify-center">
                {/* Background Arc */}
                <svg className="absolute w-full h-[200%] top-0 left-0" viewBox="0 0 200 200">
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="16"
                        strokeLinecap="round"
                        className="text-slate-100 dark:text-slate-800"
                    />
                </svg>

                {/* Foreground Animated Arc */}
                <svg className="absolute w-full h-[200%] top-0 left-0" viewBox="0 0 200 200">
                    <motion.path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="16"
                        strokeLinecap="round"
                        className={color}
                        initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    />
                </svg>

                {/* Score Display */}
                <div className="absolute -bottom-4 flex flex-col items-center justify-center">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className={`text-4xl font-extrabold ${color}`}
                    >
                        {normalizedScore}
                    </motion.span>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className={`mt-6 flex items-center gap-2 px-4 py-2 rounded-full ${bg} ${color}`}
            >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{statusText}</span>
            </motion.div>

            {alerts.length > 0 && (
                <div className="mt-8 w-full text-sm space-y-4">
                    {alerts.map((alert, idx) => (
                        <div
                            key={idx}
                            className={`flex flex-col gap-4 p-5 rounded-2xl border shadow-sm ${alert.severity === "critical"
                                ? "bg-red-500/5 border-red-500/20"
                                : alert.severity === "high"
                                    ? "bg-amber-500/5 border-amber-500/20"
                                    : "bg-white/5 border-white/10"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-xl mt-0.5 ${alert.severity === "critical" ? "bg-red-500/20 text-red-500" :
                                    alert.severity === "high" ? "bg-amber-500/20 text-amber-500" :
                                        "bg-slate-500/20 text-slate-400"
                                    }`}>
                                    {alert.severity === "critical" ? (
                                        <AlertCircle className="h-5 w-5 shrink-0" />
                                    ) : (
                                        <AlertTriangle className="h-5 w-5 shrink-0" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
                                        {alert.severity.toUpperCase()} RISK FLAG
                                    </h4>
                                    <p className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                                        {alert.description}
                                    </p>

                                    {/* Legal Translation Block */}
                                    {alert.legalTranslation && (
                                        <div className="mb-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                                            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                <ShieldCheck className="w-3.5 h-3.5" /> Plain English Translation
                                            </p>
                                            <p className="text-sm text-indigo-900/80 dark:text-indigo-200/80">
                                                {alert.legalTranslation}
                                            </p>
                                        </div>
                                    )}

                                    {/* Negotiation Co-Pilot (Pro) OR locked blur (Free) */}
                                    {alert.negotiationStrategy && (planTier === "professional" || planTier === "enterprise") ? (
                                        <NegotiationCoPilot
                                            clauseText={alert.description}
                                            negotiationStrategy={alert.negotiationStrategy}
                                            planTier={planTier}
                                        />
                                    ) : alert.negotiationStrategy ? (
                                        <NegotiationCoPilot
                                            clauseText={alert.description}
                                            negotiationStrategy={alert.negotiationStrategy}
                                            planTier="starter"
                                        />
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <PaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
