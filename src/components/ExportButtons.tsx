"use client";

import React, { useState } from "react";
import { Download, Printer, Copy, Check } from "lucide-react";
import { AlertItem } from "@/components/RiskMeter";
import { TimelineItem } from "@/components/RoadmapTimeline";

interface ExportButtonsProps {
    contractTitle: string;
    tasks: TimelineItem[];
    alerts: AlertItem[];
}

export function ExportButtons({ contractTitle, tasks, alerts }: ExportButtonsProps) {
    const [copied, setCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const exportCSV = () => {
        const header = "Title,Type,Status,Description\n";
        const rows = tasks.map(t =>
            `"${t.title}","${t.type}","${t.status}","${t.description?.replace(/"/g, '""')}"`
        ).join("\n");
        const blob = new Blob([header + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${contractTitle || "contract"}_roadmap.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setIsOpen(false);
    };

    const exportMarkdown = () => {
        const date = new Date().toLocaleDateString();
        let md = `# Contract Shield Report\n**${contractTitle}** — Generated ${date}\n\n`;
        md += `## 📋 Task Roadmap\n\n`;
        tasks.forEach(t => {
            const icon = t.type === "payment" ? "💳" : "📦";
            const check = t.status === "completed" ? "x" : " ";
            md += `- [${check}] ${icon} **${t.title}** *(${t.type})*\n`;
            if (t.description) md += `  > ${t.description}\n`;
        });
        md += `\n## 🚨 Risk Alerts (${alerts.length} flags)\n\n`;
        alerts.forEach(a => {
            const emoji = a.severity === "critical" ? "🔴" : a.severity === "high" ? "🟠" : "🟡";
            md += `### ${emoji} ${a.severity.toUpperCase()} RISK\n${a.description}\n\n`;
            if (a.legalTranslation) md += `**Plain English:** ${a.legalTranslation}\n\n`;
            if (a.negotiationStrategy) md += `**Negotiation Strategy:** ${a.negotiationStrategy}\n\n`;
        });
        const blob = new Blob([md], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${contractTitle || "contract"}_report.md`;
        a.click();
        URL.revokeObjectURL(url);
        setIsOpen(false);
    };

    const copyMarkdown = async () => {
        const date = new Date().toLocaleDateString();
        let md = `# ${contractTitle} — Shield Report (${date})\n\n## Tasks\n`;
        tasks.forEach(t => {
            md += `- [ ] **${t.title}** (${t.type})\n`;
        });
        md += `\n## Risk Flags\n`;
        alerts.forEach(a => {
            md += `- **[${a.severity.toUpperCase()}]** ${a.description}\n`;
        });
        await navigator.clipboard.writeText(md);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-300 transition-all px-4 py-2.5 rounded-xl font-medium text-sm"
            >
                <Download className="w-4 h-4" />
                Export
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2 z-30">
                        <button
                            onClick={exportCSV}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 rounded-xl transition-colors text-left"
                        >
                            <span className="text-lg">📊</span>
                            Export as CSV
                        </button>
                        <button
                            onClick={exportMarkdown}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 rounded-xl transition-colors text-left"
                        >
                            <span className="text-lg">📝</span>
                            Export as Markdown
                        </button>
                        <button
                            onClick={copyMarkdown}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 rounded-xl transition-colors text-left"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copied!" : "Copy for Notion/Trello"}
                        </button>
                        <div className="border-t border-white/10 mt-1 pt-1">
                            <button
                                onClick={() => { window.print(); setIsOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 rounded-xl transition-colors text-left"
                            >
                                <Printer className="w-4 h-4" />
                                Print / Save PDF
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
