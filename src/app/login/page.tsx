import React from "react";
import { login, signup } from "./actions";
import { Shield, AlertCircle, CheckCircle2, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const params = await searchParams;

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#09090b]">
            {/* Left Side: Brand & Testimonial (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden">
                {/* Abstract Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[100px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/20 blur-[120px]" />
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/30">
                        <Shield size={24} className="fill-current text-white" />
                    </div>
                    <span className="font-bold text-2xl tracking-tight">Scope-Shield</span>
                </div>

                <div className="relative z-10 space-y-8 max-w-lg mb-20">
                    <h1 className="text-4xl font-bold leading-tight">
                        Protect your freelance revenue from scope creep.
                    </h1>
                    <div className="space-y-4">
                        {[
                            "Upload any contract or SOW.",
                            "AI automatically flags hidden risks.",
                            "Generate professional counter-clauses instantly."
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle2 className="h-6 w-6 text-indigo-400" />
                                <span className="text-lg text-slate-300">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Testimonial */}
                <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                    <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-lg text-slate-200 mb-6 italic">
                        "Scope-Shield caught a survival clause in my latest MSA that would have locked me out of working with competitors for 3 years. It essentially paid for itself on day one."
                    </p>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="font-semibold text-white">Sarah Jenkins</p>
                            <p className="text-indigo-300 text-sm">Sr. Independent Consultant</p>
                        </div>
                        <div className="px-3 py-1 bg-indigo-500/20 rounded-full text-xs text-indigo-300 font-medium border border-indigo-500/30">
                            Pro Member
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
                {/* Mobile-only logo */}
                <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg">
                        <Shield size={18} className="fill-current" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Scope-Shield</span>
                </div>

                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Welcome back</h2>
                        <p className="text-slate-500 dark:text-slate-400">Sign in or create an account to secure your contracts.</p>
                    </div>

                    {params?.error && (
                        <div className="flex items-center gap-3 p-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/10 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/30">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            {params.error}
                        </div>
                    )}

                    <form className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900 dark:text-slate-200" htmlFor="email">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#09090b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-slate-900 dark:text-slate-200" htmlFor="password">Password</label>
                                <Link href="#" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Forgot password?</Link>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#09090b] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <Button formAction={login} className="w-full h-12 text-base font-semibold shadow-md" size="lg">Log In</Button>
                            <Button formAction={signup} variant="outline" className="w-full h-12 text-base font-semibold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900" size="lg">Sign Up</Button>
                        </div>
                    </form>

                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
                        By continuing, you agree to Scope-Shield's <Link href="#" className="underline hover:text-indigo-600 dark:hover:text-indigo-400">Terms of Service</Link> and <Link href="#" className="underline hover:text-indigo-600 dark:hover:text-indigo-400">Privacy Policy</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}
