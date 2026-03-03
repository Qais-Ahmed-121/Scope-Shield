import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/server";

// Owner admin email — set this in .env.local as ADMIN_EMAIL
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@scope-shield.com";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== ADMIN_EMAIL) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-slate-50">
            {/* Admin Topbar */}
            <div className="sticky top-0 z-50 border-b border-red-500/20 bg-red-500/5 px-8 py-3 flex items-center justify-between backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full tracking-widest uppercase">Admin</span>
                    <span className="font-bold text-white">Scope-Shield Control Panel</span>
                </div>
                <span className="text-xs text-slate-500">{user.email}</span>
            </div>
            <div className="max-w-7xl mx-auto px-6 py-10">
                {children}
            </div>
        </div>
    );
}
