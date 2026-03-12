"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    User, 
    Shield, 
    Bell, 
    CreditCard, 
    ChevronRight, 
    Settings as SettingsIcon,
    Check,
    Loader2,
    Lock,
    Zap
} from "lucide-react";
import { updateProfile } from "../app/dashboard/settings/actions";
import { toast } from "sonner";

interface SettingsClientProps {
    profile: any;
    userEmail: string;
}

const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "billing", label: "Billing & Plan", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
];

export function SettingsClient({ profile, userEmail }: SettingsClientProps) {
    const [activeTab, setActiveTab] = useState("profile");
    const [fullName, setFullName] = useState(profile?.full_name || "");
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await updateProfile({ fullName });
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const containerVariants: any = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.6, 
                staggerChildren: 0.1,
                ease: "easeOut" 
            }
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="relative min-h-[80vh]">
            {/* ── Liquid Mesh Background ── */}
            <div className="absolute inset-0 -z-10 overflow-hidden rounded-[3rem]">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "8s" }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "12s" }} />
            </div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-4 gap-8"
            >
                {/* ── Sidebar Navigation ── */}
                <div className="space-y-4">
                    <div className="px-4 mb-6">
                        <h2 className="text-3xl font-bold text-white tracking-tight">Settings</h2>
                        <p className="text-sm text-slate-500 mt-1">Manage your elite account.</p>
                    </div>
                    
                    <nav className="space-y-1">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <motion.button
                                    key={tab.id}
                                    variants={itemVariants}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all relative group ${
                                        isActive 
                                        ? "text-white font-bold" 
                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div 
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-white/10 rounded-2xl -z-10 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                                        />
                                    )}
                                    <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "opacity-50"}`} />
                                    <span className="text-sm tracking-wide">{tab.label}</span>
                                    {isActive && <motion.div layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-indigo-400 ml-auto" />}
                                </motion.button>
                            );
                        })}
                    </nav>
                </div>

                {/* ── Main Content Area ── */}
                <div className="md:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden"
                        >
                            {/* Inner Glow */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                            {activeTab === "profile" && (
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-indigo-500/20">
                                            {userEmail.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Profile Identity</h3>
                                            <p className="text-sm text-slate-400">Personalize your global presence.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Account Display Name</label>
                                            <input 
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="Enter your name"
                                                className="w-full px-5 py-4 bg-black/40 border border-white/5 rounded-2xl text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-4 ring-indigo-500/10 transition-all placeholder:text-slate-700"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Verified Email</label>
                                            <div className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl text-slate-500 flex items-center gap-2">
                                                <Check className="w-4 h-4 text-emerald-500" />
                                                {userEmail}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-white/5">
                                        <button 
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            className="px-8 py-3.5 bg-white text-black hover:bg-slate-200 disabled:bg-slate-400 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-white/5 flex items-center gap-2 group active:scale-95"
                                        >
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Secure Save"}
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "billing" && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Elite Subscription</h3>
                                            <p className="text-sm text-slate-400">Manage your power and limits.</p>
                                        </div>
                                        <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                                            {(profile as any)?.subscription_tier || "Starter"}
                                        </div>
                                    </div>

                                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-3xl p-6 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Zap className="w-24 h-24 text-indigo-400" />
                                        </div>
                                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="space-y-2">
                                                <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.1em]">Current Plan</p>
                                                <h4 className="text-3xl font-black text-white capitalize">{(profile as any)?.subscription_tier || "Starter"}</h4>
                                                <p className="text-sm text-slate-500">
                                                    {(profile as any)?.subscription_tier === 'pro' 
                                                        ? "Unlimited expert scans and counter-clauses." 
                                                        : "Standard scanning with 2 free monthly slots."
                                                    }
                                                </p>
                                            </div>
                                            <a 
                                                href="/pricing"
                                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 text-center"
                                            >
                                                Upgrade Membership
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab !== "profile" && activeTab !== "billing" && (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                    <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        <SettingsIcon className="w-8 h-8 text-slate-700" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Coming Soon</h3>
                                        <p className="text-sm text-slate-500 max-w-xs">We are meticulously crafting this experience to meet Scope-Shield standards.</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
