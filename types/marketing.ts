export type TestimonialAudience = "applicant" | "partner";
export type TestimonialAvatarShape = "circle" | "square";
export type TestimonialAccent = "mint" | "coral" | "amber" | "violet";

export interface AdminTestimonial {
    id: string;
    name: string;
    subtitle: string;
    quote: string;
    audience: TestimonialAudience;
    avatarLabel: string;
    avatarShape: TestimonialAvatarShape;
    accent: TestimonialAccent;
    enabled: boolean;
    sortOrder: number;
    tagLabel: "Partner" | "Applicant";
    groupLabel: "Institutions" | "Students";
}

export interface CreateTestimonialInput {
    name: string;
    subtitle: string;
    quote: string;
    audience: TestimonialAudience;
    avatarLabel: string;
    avatarShape: TestimonialAvatarShape;
    accent: TestimonialAccent;
    enabled: boolean;
}

export type FormatCardAccent = "mint" | "coral" | "amber" | "violet";

export interface AdminFormatCard {
    id: string;
    title: string;
    description: string;
    accent: FormatCardAccent;
    enabled: boolean;
    sortOrder: number;
}

export interface CreateFormatCardInput {
    title: string;
    description: string;
    accent: FormatCardAccent;
    enabled: boolean;
}

export type PricingPlanType = "free" | "pro";

export interface PricingFeature {
    id: string;
    label: string;
    included: boolean;
}

export interface PricingBillingCycle {
    id: string;
    months: number;
    price: number;
    perMonth: number;
    savingsPct: number | null;
    badge: string | null;
}

export interface PricingPlan {
    planType: PricingPlanType;
    price: number;
    periodLabel: string;
    priceNote: string;
    badge: string | null;
    buttonLabel: string;
    defaultCycleMonths: number | null;
    features: PricingFeature[];
    billingCycles: PricingBillingCycle[];
}

export interface UpdatePricingPlanInput {
    price?: number;
    periodLabel?: string;
    priceNote?: string;
    badge?: string | null;
    buttonLabel?: string;
    defaultCycleMonths?: number | null;
}

export interface CreateFeatureInput {
    label: string;
    included: boolean;
}

export interface CreateBillingCycleInput {
    months: number;
    price: number;
    perMonth: number;
    savingsPct?: number | null;
    badge?: string | null;
}