"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Landmark, Check, X, ShieldCheck, Zap, Copy, Upload, CloudUpload } from "lucide-react";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FEATURES = [
    "Unlimited Contract Scans",
    "Full AI Risk Analysis with Legal Translation",
    "Pro Negotiation Counter-Clauses",
    "CSV & Markdown Export Hub",
    "Priority AI (Gemini 2.5 Flash)",
    "Dedicated Support"
];

const BANK_DETAILS = [
    { label: "Bank Name", value: "First Century Bank" },
    { label: "Routing (ABA)", value: "021000021" },
    { label: "Account #", value: "401239847589" },
    { label: "Account Type", value: "Checking (USD)" },
];

export function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<"stripe" | "manual">("stripe");
    const [copied, setCopied] = useState<string | null>(null);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptUploading, setReceiptUploading] = useState(false);
    const [receiptSubmitted, setReceiptSubmitted] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const copyValue = (label: string, value: string) => {
        navigator.clipboard.writeText(value);
        setCopied(label);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleStripeCheckout = async () => {
        // TODO: redirect to /api/stripe/create-checkout
        alert("Stripe integration coming soon! Use Bank Transfer to upgrade now.");
    };

    const handleReceiptDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
            setReceiptFile(file);
        }
    };

    const handleReceiptSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setReceiptFile(file);
    };

    const handleReceiptSubmit = async () => {
        if (!receiptFile) return;
        setReceiptUploading(true);
        // Simulate upload — in production, upload to Supabase Storage
        await new Promise(r => setTimeout(r, 1500));
        setReceiptUploading(false);
        setReceiptSubmitted(true);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md"
                    />
                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.7)] z-10"
                    >
                        {/* Gradient header */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 relative z-10">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                                    <ShieldCheck className="h-4 w-4 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-white">Upgrade to Pro</h2>
                                    <p className="text-xs text-slate-500">Unlock the full Shield experience</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-full p-2 text-slate-500 hover:bg-white/10 hover:text-slate-300 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Price */}
                        <div className="text-center pt-6 pb-4 px-6">
                            <div className="inline-flex items-end gap-1">
                                <span className="text-5xl font-extrabold text-white">$29</span>
                                <span className="text-slate-400 mb-2 text-lg">/month</span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">Cancel anytime. No contracts.</p>
                        </div>

                        {/* Features Grid */}
                        <div className="px-6 pb-4">
                            <div className="grid grid-cols-2 gap-2 mb-5">
                                {FEATURES.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                        <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                                        {f}
                                    </div>
                                ))}
                            </div>

                            {/* Payment Method Toggle */}
                            <div className="flex rounded-xl bg-white/5 border border-white/10 p-1 mb-5">
                                {[["stripe", CreditCard, "Credit Card"], ["manual", Landmark, "Bank Transfer"]].map(([key, Icon, label]) => (
                                    <button
                                        key={key as string}
                                        onClick={() => setPaymentMethod(key as any)}
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${paymentMethod === key ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-slate-500 hover:text-slate-300"}`}
                                    >
                                        <Icon className="h-4 w-4" /> {label as React.ReactNode}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {paymentMethod === "stripe" ? (
                                    <motion.div key="stripe" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                        <button
                                            onClick={handleStripeCheckout}
                                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-base shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                                        >
                                            <Zap className="h-5 w-5" /> Upgrade Now — $29/mo
                                        </button>
                                        <p className="text-center text-xs text-slate-600 mt-3">🔒 Secured by Stripe. Your card details are never stored.</p>
                                    </motion.div>
                                ) : (
                                    <motion.div key="manual" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                            <p className="text-sm text-amber-300 text-center">For users in regions where Stripe is unavailable (e.g. Pakistan)</p>
                                        </div>

                                        {/* Bank Details */}
                                        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Payoneer US Receiving Account</p>
                                            {BANK_DETAILS.map(({ label, value }) => (
                                                <div key={label} className="flex justify-between items-center group py-1.5 border-b border-white/5 last:border-0">
                                                    <span className="text-xs text-slate-500">{label}</span>
                                                    <button
                                                        onClick={() => copyValue(label, value)}
                                                        className="flex items-center gap-1.5 font-mono text-sm text-slate-200 hover:text-indigo-300 transition-colors"
                                                    >
                                                        {value}
                                                        {copied === label ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Receipt Upload */}
                                        {receiptSubmitted ? (
                                            <div className="text-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                                <Check className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                                                <p className="font-bold text-emerald-300">Receipt Submitted!</p>
                                                <p className="text-sm text-emerald-400/70 mt-1">We&apos;ll verify and upgrade your account within 24 hours.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <p className="text-xs text-center text-slate-500">
                                                    Send exactly <span className="text-white font-bold">$29 USD</span> then upload your transfer screenshot below.
                                                </p>
                                                <label
                                                    htmlFor="receipt-upload"
                                                    className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${dragOver ? "border-indigo-400 bg-indigo-500/10" : receiptFile ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/10 bg-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5"}`}
                                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                                    onDragLeave={() => setDragOver(false)}
                                                    onDrop={handleReceiptDrop}
                                                >
                                                    {receiptFile ? (
                                                        <>
                                                            <Check className="h-6 w-6 text-emerald-400" />
                                                            <p className="text-sm text-emerald-400 font-medium">{receiptFile.name}</p>
                                                            <p className="text-xs text-slate-500">{(receiptFile.size / 1024).toFixed(1)} KB</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CloudUpload className="h-8 w-8 text-slate-500" />
                                                            <p className="text-sm text-slate-400">Drop your receipt screenshot here</p>
                                                            <p className="text-xs text-slate-600">JPG, PNG, or PDF · Max 5MB</p>
                                                        </>
                                                    )}
                                                    <input
                                                        id="receipt-upload"
                                                        type="file"
                                                        accept="image/*,.pdf"
                                                        className="hidden"
                                                        onChange={handleReceiptSelect}
                                                    />
                                                </label>

                                                <button
                                                    onClick={handleReceiptSubmit}
                                                    disabled={!receiptFile || receiptUploading}
                                                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${receiptFile && !receiptUploading ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-white/5 text-slate-600 cursor-not-allowed"}`}
                                                >
                                                    {receiptUploading ? (
                                                        <>
                                                            <motion.div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} />
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <><Upload className="h-4 w-4" /> Submit Transfer Receipt</>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
