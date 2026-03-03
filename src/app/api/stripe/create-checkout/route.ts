import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { STRIPE_CONFIG, type PlanKey } from "@/lib/stripe-config";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2025-02-24.acacia",
});

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { plan } = await req.json() as { plan: PlanKey };

        const planConfig = STRIPE_CONFIG.plans[plan];
        if (!planConfig) {
            return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: planConfig.priceId,
                    quantity: 1,
                },
            ],
            success_url: `${baseUrl}/dashboard?upgraded=true&plan=${plan}`,
            cancel_url: `${baseUrl}/pricing?cancelled=true`,
            client_reference_id: user.id,
            customer_email: user.email,
            metadata: {
                user_id: user.id,
                plan,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Stripe checkout error:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
