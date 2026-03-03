"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Copy, Check, Download, ChevronDown, ChevronUp } from "lucide-react";

interface Milestone {
    title: string;
    description?: string;
    dueDate?: string;
    status?: string;
}

interface InvoiceDraftProps {
    milestone: Milestone;
    contractTitle?: string;
    milestoneIndex: number;
}

function generateInvoiceText(milestone: Milestone, contractTitle: string, index: number): string {
    const invoiceNum = `INV-${new Date().getFullYear()}-${String(index + 1).padStart(3, "0")}`;
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const dueDate = milestone.dueDate ?? "Upon completion";

    return `INVOICE
=====================================
Invoice #: ${invoiceNum}
Date: ${today}
=====================================

FROM:
[Your Full Name / Business Name]
[Your Address]
[Your Email]

TO:
[Client Name]
[Client Company]
[Client Address]

=====================================
INVOICE DETAILS
=====================================
Contract:   ${contractTitle}
Milestone:  ${milestone.title}
${milestone.description ? `Description: ${milestone.description}\n` : ""}Due Date:   ${dueDate}

=====================================
AMOUNT DUE
=====================================
Milestone Fee:   $[AMOUNT]
Tax (if any):    $[TAX]
-------------------------------
TOTAL DUE:       $[TOTAL]

=====================================
PAYMENT INSTRUCTIONS
=====================================
Please send payment via:
• Bank Transfer (Payoneer / Wise)
• PayPal: [your@email.com]

Reference: ${invoiceNum}

Payment Terms: Due within 7 days of milestone delivery.

Thank you for your business!
`;
}

export function InvoiceDraft({ milestone, contractTitle = "Contract", milestoneIndex }: InvoiceDraftProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const invoiceText = generateInvoiceText(milestone, contractTitle, milestoneIndex);

    const handleCopy = () => {
        navigator.clipboard.writeText(invoiceText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([invoiceText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice-${milestone.title.replace(/\s+/g, "-")}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="mt-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15 transition-all font-semibold"
            >
                <FileText className="h-3.5 w-3.5" />
                Generate Invoice Draft
                {isOpen ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-2 p-4 rounded-xl bg-[#0f0f12] border border-white/10 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Invoice Draft</p>
                                <div className="flex gap-2">
                                    <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-all">
                                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                        {copied ? "Copied!" : "Copy"}
                                    </button>
                                    <button onClick={handleDownload} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all">
                                        <Download className="h-3.5 w-3.5" /> Download .txt
                                    </button>
                                </div>
                            </div>
                            <pre className="text-xs text-slate-400 whitespace-pre-wrap font-mono leading-relaxed max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                                {invoiceText}
                            </pre>
                            <p className="text-[10px] text-slate-700">Fill in [AMOUNT] and [placeholders] before sending.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
