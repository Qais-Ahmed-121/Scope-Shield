"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Eye, AlertTriangle } from "lucide-react";

interface HighlightSegment {
    text: string;
    severity: "medium" | "high" | "critical";
}

interface RedlinePreviewProps {
    contractText: string;             // The raw contract text
    highlightedSegments?: HighlightSegment[]; // Risky segments to highlight
    alerts?: { description: string; severity: "medium" | "high" | "critical" }[];
}

const SEVERITY_STYLES: Record<string, string> = {
    critical: "bg-red-500/25 text-red-200 border-b-2 border-red-500 cursor-pointer",
    high: "bg-amber-500/20 text-amber-100 border-b-2 border-amber-500 cursor-pointer",
    medium: "bg-yellow-500/10 text-yellow-100 border-b border-yellow-600/50 cursor-pointer",
};

function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function RedlinePreview({ contractText, highlightedSegments = [], alerts = [] }: RedlinePreviewProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

    // Build segments from alerts if no explicit highlightedSegments
    const segments: HighlightSegment[] = highlightedSegments.length > 0
        ? highlightedSegments
        : alerts.map(a => ({ text: a.description.slice(0, 80), severity: a.severity }));

    const renderedText = useMemo(() => {
        if (!contractText || segments.length === 0) return [{ text: contractText, highlighted: false, severity: undefined }];

        const parts: { text: string; highlighted: boolean; severity?: string; tooltip?: string }[] = [];
        let remaining = contractText;

        // Sort by text length descending to match longer strings first
        const sorted = [...segments].sort((a, b) => b.text.length - a.text.length);

        const splitBySegments = (str: string): typeof parts => {
            for (const seg of sorted) {
                const idx = str.toLowerCase().indexOf(seg.text.toLowerCase().slice(0, 40));
                if (idx !== -1) {
                    const matchLen = Math.min(seg.text.length, str.length - idx);
                    return [
                        ...splitBySegments(str.slice(0, idx)),
                        { text: str.slice(idx, idx + matchLen), highlighted: true, severity: seg.severity, tooltip: seg.text },
                        ...splitBySegments(str.slice(idx + matchLen)),
                    ];
                }
            }
            return [{ text: str, highlighted: false }];
        };

        return splitBySegments(remaining);
    }, [contractText, segments]);

    if (!contractText) return null;

    const preview = contractText.slice(0, 600);
    const hasMore = contractText.length > 600;

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
            >
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                    <Eye className="h-4 w-4 text-indigo-400" />
                    Redline Preview
                    <span className="text-xs font-normal text-slate-500 ml-1">— Risky clauses highlighted</span>
                </span>
                <div className="flex items-center gap-2">
                    {alerts.length > 0 && (
                        <span className="flex items-center gap-1 text-xs bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-1 rounded-full font-semibold">
                            <AlertTriangle className="h-3 w-3" />
                            {alerts.filter(a => a.severity === "critical").length} critical
                        </span>
                    )}
                    <span className="text-xs text-slate-600">{isExpanded ? "▲ Collapse" : "▼ Expand"}</span>
                </div>
            </button>

            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-white/10"
                >
                    <div className="px-6 py-5 max-h-[420px] overflow-y-auto">
                        <div className="font-mono text-xs text-slate-400 leading-7 whitespace-pre-wrap">
                            {renderedText.map((part, i) =>
                                part.highlighted && part.severity ? (
                                    <span
                                        key={i}
                                        className={`relative inline ${SEVERITY_STYLES[part.severity] ?? ""}`}
                                        onClick={() => setActiveTooltip(activeTooltip === String(i) ? null : String(i))}
                                        title={`${part.severity?.toUpperCase()} RISK`}
                                    >
                                        {part.text}
                                        {activeTooltip === String(i) && (
                                            <span className="absolute bottom-full left-0 z-50 w-56 bg-[#09090b] border border-red-500/30 text-red-300 text-[10px] rounded-xl p-2 leading-relaxed pointer-events-none shadow-xl">
                                                ⚠️ {part.severity?.toUpperCase()} RISK – see alert details below
                                            </span>
                                        )}
                                    </span>
                                ) : (
                                    <span key={i}>{part.text}</span>
                                )
                            )}
                        </div>
                        {hasMore && !isExpanded && (
                            <p className="text-center text-xs text-slate-600 mt-4">— showing first 600 characters —</p>
                        )}
                    </div>
                    <div className="px-6 pb-4">
                        <div className="flex gap-4 text-[10px]">
                            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 bg-red-500/25 border-b-2 border-red-500 rounded-sm" /> Critical Risk</span>
                            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 bg-amber-500/20 border-b-2 border-amber-500 rounded-sm" /> High Risk</span>
                            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 bg-yellow-500/10 border-b border-yellow-600/50 rounded-sm" /> Medium Risk</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
