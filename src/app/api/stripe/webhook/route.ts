import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2025-02-24.acacia",
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

// Map Stripe Price IDs to tier names for profile update
const PRICE_TO_TIER: Record<string, string> = {
    [process.env.STRIPE_PRICE_ID_PRO ?? "price_professional_placeholder"]: "professional",
    [process.env.STRIPE_PRICE_ID_ENTERPRISE ?? "price_enterprise_placeholder"]: "enterprise",
};

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") ?? "";

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = await createClient();

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.user_id ?? session.client_reference_id;
            const plan = session.metadata?.plan;

            if (userId && plan) {
                await (supabase.from("profiles") as any).upsert({
                    id: userId,
                    subscription_tier: plan,
                    subscription_status: "active",
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: session.subscription as string,
                    scan_count: 0,
                }, { onConflict: "id" });
            }
            break;
        }

        case "invoice.payment_succeeded": {
            const invoice = event.data.object as Stripe.Invoice;
            const subscriptionId = (invoice as any).subscription as string;
            if (!subscriptionId) break;

            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const priceId = subscription.items.data[0]?.price.id;
            const tier = PRICE_TO_TIER[priceId] ?? "professional";

            // Find user by stripe_customer_id
            const { data: profile } = await (supabase.from("profiles") as any)
                .select("id")
                .eq("stripe_customer_id", invoice.customer as string)
                .maybeSingle();

            if (profile?.id) {
                await (supabase.from("profiles") as any).update({
                    subscription_status: "active",
                    subscription_tier: tier,
                }).eq("id", profile.id);
            }
            break;
        }

        case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            const { data: profile } = await (supabase.from("profiles") as any)
                .select("id")
                .eq("stripe_subscription_id", subscription.id)
                .maybeSingle();

            if (profile?.id) {
                await (supabase.from("profiles") as any).update({
                    subscription_status: "canceled",
                    subscription_tier: "starter",
                }).eq("id", profile.id);
            }
            break;
        }

        default:
            console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
