"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, CreditCard, Box, Clock } from "lucide-react";
import { InvoiceDraft } from "@/components/InvoiceDraft";

export type TimelineItem = {
    id: string;
    title: string;
    description: string;
    type: "deliverable" | "payment" | "milestone";
    status: "completed" | "in_progress" | "pending";
};

interface RoadmapTimelineProps {
    items: TimelineItem[];
    contractId?: string;
    contractTitle?: string;
}

export function RoadmapTimeline({ items = [], contractId, contractTitle = "Contract" }: RoadmapTimelineProps) {
    const [localItems, setLocalItems] = useState(items);

    const toggleStatus = (id: string) => {
        setLocalItems(prev => prev.map(item => {
            if (item.id !== id) return item;
            return {
                ...item,
                status: item.status === "completed" ? "pending" : "completed"
            };
        }));
    };

    const completedCount = localItems.filter(i => i.status === "completed").length;

    const getIcon = (type: TimelineItem["type"], status: TimelineItem["status"]) => {
        if (status === "completed") return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
        switch (type) {
            case "payment":
                return <CreditCard className={`h-5 w-5 ${status === "in_progress" ? "text-indigo-400" : "text-slate-500"}`} />;
            case "deliverable":
                return <Box className={`h-5 w-5 ${status === "in_progress" ? "text-indigo-400" : "text-slate-500"}`} />;
            default:
                return <Circle className={`h-5 w-5 ${status === "in_progress" ? "text-indigo-400" : "text-slate-500"}`} />;
        }
    };

    if (localItems.length === 0) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-sm h-full flex flex-col items-center justify-center text-center gap-4">
                <Clock className="h-12 w-12 text-slate-600" />
                <p className="text-slate-400">No tasks or milestones were extracted from this contract.</p>
            </div>
        );
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-sm h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-white">Task Roadmap</h3>
                    <p className="text-slate-400 text-sm mt-0.5">Click any task to mark complete</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-xs text-slate-500 mb-0.5">Progress</p>
                        <p className="text-sm font-bold text-white">{completedCount}/{localItems.length}</p>
                    </div>
                    <div className="w-16 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                            style={{ width: `${(completedCount / localItems.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            <motion.div
                className="relative border-l-2 border-white/10 ml-3 space-y-6"
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: { staggerChildren: 0.12 }
                    }
                }}
                initial="hidden"
                animate="show"
            >
                {localItems.map((item) => (
                    <motion.div
                        key={item.id}
                        variants={{
                            hidden: { opacity: 0, x: -20 },
                            show: { opacity: 1, x: 0 }
                        }}
                        className="relative pl-8"
                    >
                        {/* Timeline dot */}
                        <div className="absolute -left-[13px] top-3 bg-[#09090b] ring-4 ring-[#09090b] rounded-full">
                            {getIcon(item.type, item.status)}
                        </div>

                        <button
                            onClick={() => toggleStatus(item.id)}
                            className={`w-full text-left p-4 rounded-xl border transition-all group ${item.status === "completed"
                                ? "bg-emerald-500/5 border-emerald-500/20 opacity-60"
                                : item.type === "payment"
                                    ? "bg-indigo-500/5 border-indigo-500/20 hover:bg-indigo-500/10"
                                    : "bg-white/5 border-white/10 hover:bg-white/8"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`font-semibold text-sm transition-all ${item.status === "completed" ? "text-slate-500 line-through" : "text-slate-100"
                                    }`}>
                                    {item.title}
                                </h4>
                                <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${item.type === "payment"
                                    ? "text-emerald-400 bg-emerald-400/10"
                                    : "text-indigo-400 bg-indigo-400/10"
                                    }`}>
                                    {item.type}
                                </span>
                            </div>
                            <p className={`text-xs leading-relaxed transition-all ${item.status === "completed" ? "text-slate-600" : "text-slate-400"
                                }`}>
                                {item.description}
                            </p>
                        </button>

                        {/* Invoice Draft — show for payment and milestone types */}
                        {(item.type === "payment" || item.type === "milestone") && (
                            <InvoiceDraft
                                milestone={{ title: item.title, description: item.description }}
                                contractTitle={contractTitle}
                                milestoneIndex={localItems.indexOf(item)}
                            />
                        )}
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
