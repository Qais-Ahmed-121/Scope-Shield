"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Landmark, Check, Copy, CloudUpload, Upload } from "lucide-react";

const BANK_DETAILS = [
    { label: "Payoneer Email", value: "payments@scope-shield.com" },
    { label: "Bank Name", value: "First Century Bank (via Payoneer)" },
    { label: "Routing (ABA)", value: "061120084" },
    { label: "Account #", value: "4012398475" },
    { label: "Account Type", value: "Checking (USD)" },
    { label: "Reference", value: "SCOPE-UPGRADE" },
];

interface PayoneerModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: "professional" | "enterprise";
    price: number;
}

export function PayoneerModal({ isOpen, onClose, plan, price }: PayoneerModalProps) {
    const [copied, setCopied] = useState<string | null>(null);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const copyValue = (label: string, value: string) => {
        navigator.clipboard.writeText(value);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) setReceiptFile(file);
    };

    const handleSubmit = async () => {
        if (!receiptFile) return;
        setUploading(true);
        // In production: upload to Supabase Storage, then POST to /api/bank-transfer/submit
        await new Promise(r => setTimeout(r, 1800));
        setUploading(false);
        setSubmitted(true);
    };

    const planLabel = plan === "professional" ? "Professional" : "Enterprise";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0f0f12] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
                    >
                        {/* Gradient header glow */}
                        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-amber-500/10 to-transparent rounded-t-3xl pointer-events-none" />

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 relative">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                                    <Landmark className="h-4.5 w-4.5 text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-white leading-tight">Bank Transfer</h2>
                                    <p className="text-xs text-slate-500">{planLabel} Plan — ${price}/mo via Payoneer</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="rounded-full p-2 text-slate-600 hover:bg-white/10 hover:text-slate-300 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-5">
                            {submitted ? (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-3">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
                                        <Check className="h-8 w-8 text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Receipt Submitted!</h3>
                                    <p className="text-slate-400 text-sm">Your receipt is under review. We&apos;ll upgrade your account to <strong className="text-amber-300">{planLabel}</strong> within 24 hours.</p>
                                    <p className="text-xs text-slate-600 pt-2">Your account status is now: <span className="text-amber-400 font-mono">pending_verification</span></p>
                                    <button onClick={onClose} className="mt-4 px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-colors">
                                        Back to Dashboard
                                    </button>
                                </motion.div>
                            ) : (
                                <>
                                    {/* Instructions */}
                                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                        <p className="text-sm text-amber-300 font-medium">
                                            1. Send exactly <span className="text-white font-bold">${price} USD</span> to the account below.
                                        </p>
                                        <p className="text-xs text-amber-400/70 mt-1">
                                            2. Upload your transfer screenshot to activate your account.
                                        </p>
                                    </div>

                                    {/* Bank Details */}
                                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-1">
                                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Payoneer USD Receiving Account</p>
                                        {BANK_DETAILS.map(({ label, value }) => (
                                            <div key={label} className="flex justify-between items-center group py-1.5 border-b border-white/5 last:border-0">
                                                <span className="text-xs text-slate-500 shrink-0">{label}</span>
                                                <button
                                                    onClick={() => copyValue(label, value)}
                                                    className="flex items-center gap-1.5 font-mono text-xs text-slate-200 hover:text-amber-300 transition-colors ml-4 text-right"
                                                >
                                                    <span className="truncate max-w-[180px]">{value}</span>
                                                    {copied === label
                                                        ? <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                                                        : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                                    }
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Receipt Upload */}
                                    <div>
                                        <p className="text-xs text-slate-500 mb-2">Upload transfer receipt (JPG, PNG, or PDF):</p>
                                        <label
                                            htmlFor="payoneer-receipt"
                                            className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${dragOver ? "border-amber-400 bg-amber-500/10" : receiptFile ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10 bg-white/5 hover:border-amber-500/40 hover:bg-amber-500/5"}`}
                                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                            onDragLeave={() => setDragOver(false)}
                                            onDrop={handleDrop}
                                        >
                                            {receiptFile ? (
                                                <>
                                                    <Check className="h-6 w-6 text-emerald-400" />
                                                    <p className="text-sm text-emerald-300 font-medium">{receiptFile.name}</p>
                                                    <p className="text-xs text-slate-500">{(receiptFile.size / 1024).toFixed(1)} KB · Tap to change</p>
                                                </>
                                            ) : (
                                                <>
                                                    <CloudUpload className="h-8 w-8 text-slate-600" />
                                                    <p className="text-sm text-slate-400">Drop screenshot here or click to browse</p>
                                                </>
                                            )}
                                            <input id="payoneer-receipt" type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)} />
                                        </label>
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={!receiptFile || uploading}
                                        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${receiptFile && !uploading ? "bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]" : "bg-white/5 text-slate-600 cursor-not-allowed"}`}
                                    >
                                        {uploading ? (
                                            <>
                                                <motion.div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }} />
                                                Submitting...
                                            </>
                                        ) : (
                                            <><Upload className="h-4 w-4" /> Submit Receipt for Verification</>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
