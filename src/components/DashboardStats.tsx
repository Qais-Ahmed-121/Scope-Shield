"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, ShieldAlert, TrendingUp, CheckCircle2 } from "lucide-react";

interface DashboardStatsProps {
    totalContracts: number;
    highRiskCount: number;
    tasksExtracted: number;
    avgRiskScore: number;
}

export function DashboardStats({ totalContracts, highRiskCount, tasksExtracted, avgRiskScore }: DashboardStatsProps) {
    const stats = [
        {
            label: "Contracts Scanned",
            value: totalContracts,
            icon: FileText,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10 border-indigo-500/20",
            suffix: ""
        },
        {
            label: "High-Risk Flags",
            value: highRiskCount,
            icon: ShieldAlert,
            color: "text-red-400",
            bg: "bg-red-500/10 border-red-500/20",
            suffix: ""
        },
        {
            label: "Tasks Extracted",
            value: tasksExtracted,
            icon: CheckCircle2,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10 border-emerald-500/20",
            suffix: ""
        },
        {
            label: "Avg. Risk Score",
            value: avgRiskScore,
            icon: TrendingUp,
            color: avgRiskScore > 66 ? "text-red-400" : avgRiskScore > 33 ? "text-amber-400" : "text-emerald-400",
            bg: avgRiskScore > 66 ? "bg-red-500/10 border-red-500/20" : avgRiskScore > 33 ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20",
            suffix: "/100"
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border bg-white/5 ${stat.bg} relative overflow-hidden`}
                >
                    {/* Glow blob */}
                    <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-2xl opacity-30 ${stat.bg.split(" ")[0]}`} />

                    <div className={`p-2.5 rounded-xl border ${stat.bg} shrink-0`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div className="min-w-0">
                        <CountUp value={stat.value} suffix={stat.suffix} className={`text-2xl font-extrabold ${stat.color}`} />
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{stat.label}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

function CountUp({ value, suffix, className }: { value: number; suffix: string; className: string }) {
    const [display, setDisplay] = React.useState(0);

    React.useEffect(() => {
        let start = 0;
        const end = value;
        if (end === 0) return;
        const duration = 800;
        const step = Math.ceil(end / (duration / 16));
        const timer = setInterval(() => {
            start += step;
            if (start >= end) {
                setDisplay(end);
                clearInterval(timer);
            } else {
                setDisplay(start);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [value]);

    return <span className={className}>{display}{suffix}</span>;
}
