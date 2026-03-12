"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Mail, ChevronDown, ChevronUp, Zap } from "lucide-react";

interface NegotiationCoPilotProps {
    clauseText: string;          // The original risky clause
    negotiationStrategy?: string; // AI-generated strategy text
    counterClause?: string;      // Specific AI-generated counter-clause
    planTier?: string;           // "starter" | "professional" | "enterprise"
}

function generateCounterClause(clauseText: string, strategy: string): string {
    // Derive a professional counter-clause suggestion from the strategy
    const lower = clauseText.toLowerCase();

    if (lower.includes("net-90") || lower.includes("net 90")) {
        return `Dear [Client Name],\n\nThank you for the contract. I'd like to propose an adjustment to the payment terms. Instead of Net-90, I'd prefer Net-30 to better align with my project cashflow requirements. This is standard practice for freelance engagements of this scope.\n\nI'm confident this adjustment will not impact delivery timelines. Please let me know if you can accommodate this.\n\nBest regards,\n[Your Name]`;
    }
    if (lower.includes("revision") || lower.includes("revisions")) {
        return `Dear [Client Name],\n\nI'd like to clarify the revision policy in our contract. My standard terms include up to 2 rounds of revisions. Additional revisions beyond this scope would be billed at my hourly rate of $[Rate]/hr.\n\nThis ensures we both have clear expectations and protects both parties. Happy to discuss further.\n\nBest regards,\n[Your Name]`;
    }
    if (lower.includes("intellectual property") || lower.includes("ip") || lower.includes("all rights")) {
        return `Dear [Client Name],\n\nRegarding the IP ownership clause: I'd like to propose that I retain rights to the underlying code/methodology, while you receive full ownership of the final deliverable. This is common in professional freelance agreements and protects my ability to use similar approaches in future projects.\n\nI'm happy to provide a full work-for-hire clause for the deliverable itself.\n\nBest regards,\n[Your Name]`;
    }
    if (lower.includes("non-compete") || lower.includes("exclusivity")) {
        return `Dear [Client Name],\n\nI'd like to request a modification to the non-compete clause. As a freelancer, I work with multiple clients — an exclusivity clause would significantly impact my livelihood. I'd propose limiting the non-compete to [your direct competitors only / 90 days / specific industry vertical].\n\nThis should address your legitimate concerns while being fair to both parties.\n\nBest regards,\n[Your Name]`;
    }

    // Generic strategy-based counter
    return `Dear [Client Name],\n\nI've reviewed the contract and have a proposed amendment regarding the following clause:\n\n"${clauseText.slice(0, 120)}..."\n\n${strategy}\n\nI believe this adjustment is fair and in line with industry standards. Please let me know if you're open to discussing this before we finalize the agreement.\n\nBest regards,\n[Your Name]`;
}

export function NegotiationCoPilot({ clauseText, negotiationStrategy, counterClause, planTier = "starter" }: NegotiationCoPilotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const isPro = planTier === "professional" || planTier === "enterprise";

    const getEmailContent = () => {
        if (counterClause) {
            return `Dear [Client Name],\n\nI've reviewed the contract and have a proposed amendment regarding the following clause:\n\n"${clauseText.slice(0, 120)}..."\n\nProposed Counter-Clause:\n${counterClause}\n\nI believe this adjustment is fair and in line with industry standards. Please let me know if you're open to discussing this before we finalize the agreement.\n\nBest regards,\n[Your Name]`;
        }
        return negotiationStrategy
            ? generateCounterClause(clauseText, negotiationStrategy)
            : generateCounterClause(clauseText, "");
    };

    const counterEmail = getEmailContent();

    const handleCopy = () => {
        navigator.clipboard.writeText(counterEmail);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isPro) {
        return (
            <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                <Zap className="h-4 w-4 text-indigo-400 shrink-0" />
                <p className="text-xs text-indigo-400">
                    <strong>Negotiation Co-Pilot</strong> — available on Professional & Enterprise.{" "}
                    <a href="/pricing" className="underline hover:no-underline">Upgrade to unlock →</a>
                </p>
            </div>
        );
    }

    return (
        <div className="mt-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 transition-all text-sm font-semibold"
            >
                <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    ✦ One-Click Counter-Clause
                </span>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-2 p-4 rounded-xl bg-[#0f0f12] border border-white/10 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Draft</p>
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
                                >
                                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>
                            <pre className="text-xs text-slate-400 whitespace-pre-wrap font-sans leading-relaxed max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                                {counterEmail}
                            </pre>
                            <p className="text-[10px] text-slate-700">Tweak [placeholders] before sending. Not legal advice.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
