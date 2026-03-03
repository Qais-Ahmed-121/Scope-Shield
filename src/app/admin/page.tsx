import React from "react";
import { createClient } from "../../../utils/supabase/server";
import { Users, Activity, CreditCard, CheckCircle, Clock, DollarSign, FileText } from "lucide-react";
import { AdminApprovalButton } from "@/components/AdminApprovalButton";

export default async function AdminPage() {
    const supabase = await createClient();

    // Fetch all users / profiles
    const { data: profiles } = await (supabase
        .from("profiles")
        .select("id, subscription_tier, subscription_status, scan_count, stripe_customer_id, created_at")
        .order("created_at", { ascending: false }) as any);

    // Fetch pending manual payment requests
    const { data: pendingPayments } = await (supabase
        .from("manual_payments")
        .select("id, user_id, plan, receipt_url, status, created_at")
        .order("created_at", { ascending: false }) as any);

    // Aggregate analytics
    const today = new Date().toISOString().split("T")[0];
    const { count: scansToday } = await (supabase
        .from("contracts")
        .select("id", { count: "exact", head: true })
        .gte("created_at", `${today}T00:00:00`) as any);

    const totalUsers = profiles?.length ?? 0;
    const activeProUsers = profiles?.filter((p: any) =>
        p.subscription_tier === "professional" || p.subscription_tier === "enterprise"
    ).length ?? 0;
    const pendingCount = pendingPayments?.filter((p: any) => p.status === "pending").length ?? 0;

    const PLAN_COLOR: Record<string, string> = {
        starter: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        professional: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
        enterprise: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    };

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-extrabold text-white mb-1">Admin Dashboard</h1>
                <p className="text-slate-500 text-sm">Platform overview and management center.</p>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Users", value: totalUsers, icon: Users, color: "indigo" },
                    { label: "Active Subscribers", value: activeProUsers, icon: CreditCard, color: "emerald" },
                    { label: "Scans Today", value: scansToday ?? 0, icon: Activity, color: "amber" },
                    { label: "Pending Approvals", value: pendingCount, icon: Clock, color: "red" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className={`p-5 rounded-2xl border border-white/10 bg-${color}-500/5 flex items-center gap-4`}>
                        <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center shrink-0`}>
                            <Icon className={`h-5 w-5 text-${color}-400`} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{value}</p>
                            <p className="text-xs text-slate-500">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment Approval Center */}
            {pendingPayments && pendingPayments.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-amber-400" />
                        Payment Approval Center
                        <span className="ml-2 text-xs bg-amber-500 text-black font-bold px-2 py-0.5 rounded-full">{pendingCount} pending</span>
                    </h2>
                    <div className="space-y-3">
                        {pendingPayments.map((payment: any) => (
                            <div key={payment.id} className="flex items-center justify-between p-5 rounded-2xl border border-white/10 bg-white/5">
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-white">User: <span className="font-mono text-slate-400">{payment.user_id}</span></p>
                                    <p className="text-xs text-slate-500">Plan: <span className="font-semibold text-slate-300 capitalize">{payment.plan}</span> · Submitted: {new Date(payment.created_at).toLocaleDateString()}</p>
                                    <span className={`inline-flex text-xs px-2 py-0.5 rounded-full border font-semibold ${payment.status === "pending" ? "bg-amber-500/10 border-amber-500/20 text-amber-300" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"}`}>
                                        {payment.status === "pending" ? "⏳ Awaiting Approval" : "✅ Approved"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {payment.receipt_url && (
                                        <a
                                            href={payment.receipt_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 px-3 py-2 rounded-xl transition-colors"
                                        >
                                            <FileText className="h-4 w-4" /> View Receipt
                                        </a>
                                    )}
                                    {payment.status === "pending" && (
                                        <AdminApprovalButton paymentId={payment.id} userId={payment.user_id} plan={payment.plan} />
                                    )}
                                    {payment.status === "approved" && (
                                        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                                            <CheckCircle className="h-4 w-4" /> Activated
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* User Management */}
            <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-400" /> User Management
                </h2>
                <div className="rounded-2xl border border-white/10 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">User ID</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Plan</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Scans</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(profiles ?? []).map((profile: any, i: number) => (
                                <tr key={profile.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                                    <td className="px-5 py-3 font-mono text-xs text-slate-400 truncate max-w-[180px]">{profile.id}</td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${PLAN_COLOR[profile.subscription_tier ?? "starter"] ?? PLAN_COLOR.starter}`}>
                                            {profile.subscription_tier ?? "starter"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-slate-300">{profile.scan_count ?? 0}</td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs font-semibold ${profile.subscription_status === "active" ? "text-emerald-400" : "text-slate-600"}`}>
                                            {profile.subscription_status ?? "free"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-xs text-slate-500">
                                        {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
                                    </td>
                                </tr>
                            ))}
                            {(!profiles || profiles.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-5 py-8 text-center text-slate-600">No users yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
