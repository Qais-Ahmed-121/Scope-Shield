import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../utils/supabase/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@scope-shield.com";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function sendApprovalEmail(toEmail: string, plan: string) {
    if (!RESEND_API_KEY) {
        console.log("[Resend] No API key — skipping approval email");
        return;
    }
    try {
        await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "Scope-Shield <noreply@scope-shield.com>",
                to: [toEmail],
                subject: "🛡️ Your Scope-Shield subscription is now active!",
                html: `
                    <div style="font-family:Inter,sans-serif;background:#09090b;color:#f8fafc;padding:40px;max-width:520px;margin:auto;border-radius:12px;border:1px solid rgba(255,255,255,0.1)">
                        <h1 style="font-size:24px;font-weight:800;margin:0 0 8px">You&rsquo;re all set! 🎉</h1>
                        <p style="color:#94a3b8;font-size:15px;margin:0 0 24px">Your <strong style="color:#a78bfa">${plan.charAt(0).toUpperCase() + plan.slice(1)}</strong> subscription has been manually verified and activated by our team.</p>
                        <a href="https://scope-shield.com/dashboard" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
                            Go to Dashboard →
                        </a>
                        <p style="color:#475569;font-size:12px;margin-top:32px">If you have any questions, reply to this email or contact support@scope-shield.com</p>
                    </div>
                `,
            }),
        });
    } catch (e) {
        console.error("[Resend] Email send failed:", e);
    }
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== ADMIN_EMAIL) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { paymentId, userId, plan } = await req.json();

    // 1. Get the user's email from auth
    const { data: authUser } = await (supabase.auth.admin.getUserById(userId) as any);
    const userEmail = authUser?.user?.email;

    // 2. Activate the user's plan
    await (supabase.from("profiles") as any).upsert({
        id: userId,
        subscription_tier: plan,
        subscription_status: "active",
        scan_count: 0,
    }, { onConflict: "id" });

    // 3. Mark payment as approved
    await (supabase.from("manual_payments") as any)
        .update({ status: "approved" })
        .eq("id", paymentId);

    // 4. Send approval email via Resend
    if (userEmail) {
        await sendApprovalEmail(userEmail, plan);
    }

    return NextResponse.json({ success: true });
}
