import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../utils/supabase/server";
import type { PlanKey } from "@/lib/stripe-config";

// Simple fallback: called client-side after Stripe success_url redirect
// Upgrades the profile without needing webhooks (good for MVP/testing)
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { plan } = await req.json() as { plan: PlanKey };

        if (!plan || !["professional", "enterprise"].includes(plan)) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        await (supabase.from("profiles") as any).upsert({
            id: user.id,
            subscription_tier: plan,
            subscription_status: "active",
            scan_count: 0, // reset scan count on upgrade
        }, { onConflict: "id" });

        return NextResponse.json({ success: true, tier: plan });
    } catch (error) {
        console.error("Tier upgrade error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
