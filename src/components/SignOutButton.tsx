"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X, Loader2 } from "lucide-react";
import { signout } from "@/app/login/actions";

export function SignOutButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleSignOut = async () => {
        setIsPending(true);
        // We call the server action. The browser will handle the redirect.
        await signout();
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors border border-transparent"
            >
                <LogOut className="h-4 w-4" /> Sign out
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isPending && setIsOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
                            
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mb-2">
                                    <LogOut className="h-8 w-8 text-red-500" />
                                </div>
                                
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-white">Sign Out?</h3>
                                    <p className="text-sm text-slate-400">Are you sure you want to end your session? Your analyzed contracts are safely stored.</p>
                                </div>

                                <div className="flex flex-col w-full gap-3 pt-4">
                                    <button
                                        onClick={handleSignOut}
                                        disabled={isPending}
                                        className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white rounded-xl py-3 font-bold transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" /> Signing out...
                                            </>
                                        ) : (
                                            "Confirm Sign Out"
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        disabled={isPending}
                                        className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl py-3 font-bold transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
