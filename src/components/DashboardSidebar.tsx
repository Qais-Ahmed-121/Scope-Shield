"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LayoutDashboard, FileText, Settings, LogOut } from "lucide-react";
import { SignOutButton } from "./SignOutButton";
import { useUsage } from "@/context/UsageContext";

interface DashboardSidebarProps {
    userEmail: string;
    recentContracts: any[];
}

export function DashboardSidebar({ userEmail, recentContracts }: DashboardSidebarProps) {
    const pathname = usePathname();
    const { tier } = useUsage();

    const isActive = (path: string) => {
        if (path === '/dashboard' && pathname === '/dashboard') return true;
        if (path !== '/dashboard' && pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <aside className="w-64 border-r border-white/10 bg-slate-900/50 backdrop-blur-xl flex flex-col shrink-0 relative overflow-hidden">
            {/* Subtle Gradient Glow behind sidebar */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[30%] rounded-full bg-indigo-500/10 blur-[80px]" />
            </div>

            <div className="relative z-10 flex h-16 items-center border-b border-white/10 px-6">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <Shield size={18} className="fill-current" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white">Scope-Shield</span>
                </Link>
            </div>

            <nav className="relative z-10 flex-1 p-4 space-y-1 overflow-y-auto">
                <Link
                    href="/dashboard"
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-all ${isActive('/dashboard')
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                        }`}
                >
                    <LayoutDashboard className="h-5 w-5" /> Dashboard
                </Link>
                <Link
                    href="/dashboard/contracts"
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-all ${isActive('/dashboard/contracts')
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                        }`}
                >
                    <FileText className="h-5 w-5" /> My Contracts
                </Link>

                {recentContracts && recentContracts.length > 0 && (
                    <div className="pt-8">
                        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Recent History</p>
                        <div className="space-y-0.5">
                            {recentContracts.map((contract) => (
                                <Link
                                    key={contract.id}
                                    href={`/dashboard/contracts/${contract.id}`}
                                    className={`w-full text-left truncate flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all ${pathname === `/dashboard/contracts/${contract.id}`
                                        ? 'bg-white/10 text-white'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                        }`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 shadow-lg ${(contract.risk_score || 0) > 60 ? 'bg-red-400 shadow-red-400/50' :
                                        (contract.risk_score || 0) > 30 ? 'bg-amber-400 shadow-amber-400/50' :
                                            'bg-emerald-400 shadow-emerald-400/50'
                                        }`}></span>
                                    {contract.title || "Untitled Contract"}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            <div className="relative z-10 p-4 border-t border-white/10 space-y-1">
                <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-black/20 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group"
                >
                    <div className="h-8 w-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-300 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        {userEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">{userEmail}</p>
                        <p className="text-xs text-indigo-400 font-medium italic capitalize">{tier} Plan</p>
                    </div>
                </Link>

                <Link
                    href="/dashboard/settings"
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all border border-transparent ${isActive('/dashboard/settings')
                        ? 'bg-white/10 text-white border-white/10'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                        }`}
                >
                    <Settings className="h-4 w-4" /> Settings
                </Link>
                <SignOutButton />
            </div>
        </aside>
    );
}
