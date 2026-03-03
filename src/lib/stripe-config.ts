// Stripe configuration for Scope-Shield subscription tiers
// Replace placeholder IDs with your real Stripe Price IDs from stripe.com/dashboard

export const STRIPE_CONFIG = {
    plans: {
        professional: {
            name: "Professional",
            priceId: process.env.STRIPE_PRICE_ID_PRO ?? "price_professional_placeholder",
            price: 19,
            currency: "usd",
            interval: "month" as const,
        },
        enterprise: {
            name: "Enterprise",
            priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE ?? "price_enterprise_placeholder",
            price: 49,
            currency: "usd",
            interval: "month" as const,
        },
    },
} as const;

export type PlanKey = keyof typeof STRIPE_CONFIG.plans;

export const PLAN_LIMITS = {
    starter: {
        label: "Starter",
        scanLimit: 2,
        geminiModel: "gemini-1.5-flash",
        hasNegotiation: false,
        hasExport: false,
        hasTeam: false,
    },
    professional: {
        label: "Professional",
        scanLimit: Infinity,
        geminiModel: "gemini-1.5-pro",
        hasNegotiation: true,
        hasExport: true,
        hasTeam: false,
    },
    enterprise: {
        label: "Enterprise",
        scanLimit: Infinity,
        geminiModel: "gemini-1.5-ultra",
        hasNegotiation: true,
        hasExport: true,
        hasTeam: true,
    },
} as const;

export type TierKey = keyof typeof PLAN_LIMITS;
