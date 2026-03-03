"use client";

import React, { useState } from "react";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface AdminApprovalButtonProps {
    paymentId: string;
    userId: string;
    plan: string;
}

export function AdminApprovalButton({ paymentId, userId, plan }: AdminApprovalButtonProps) {
    const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

    const handleApprove = async () => {
        setStatus("loading");
        try {
            const res = await fetch("/api/admin/approve-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId, userId, plan }),
            });
            if (res.ok) {
                setStatus("done");
            } else {
                alert("Failed to approve. Check server logs.");
                setStatus("idle");
            }
        } catch {
            alert("Network error.");
            setStatus("idle");
        }
    };

    if (status === "done") {
        return (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <CheckCircle className="h-4 w-4" /> Activated!
            </span>
        );
    }

    return (
        <button
            onClick={handleApprove}
            disabled={status === "loading"}
            className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-xl transition-all disabled:opacity-70"
        >
            {status === "loading" ? (
                <motion.div className="h-3.5 w-3.5 border-2 border-black/30 border-t-black rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }} />
            ) : (
                <CheckCircle className="h-3.5 w-3.5" />
            )}
            {status === "loading" ? "Activating..." : "Approve & Activate"}
        </button>
    );
}
