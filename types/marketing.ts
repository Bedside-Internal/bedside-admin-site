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

export type TestimonialNameDisplay = "full_name" | "first_name_only" | "anonymous";
 
export interface TestimonialSubmissionAdmin {
    id: string;
    rating: number;
    quote: string;
    subtitle: string | null;
    audience: TestimonialAudience;
    nameDisplay: TestimonialNameDisplay;
    consentToPublish: boolean;
    submittedByName: string;
    submittedByEmail: string | null;
    submittedAt: string;
}

export interface ApproveTestimonialSubmissionInput {
    quote?: string;
    subtitle?: string;
    accent?: TestimonialAccent;
}
 
export interface RejectTestimonialSubmissionInput {
    reason?: string;
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

export interface AdminPricingTier {
    id: string;
    title: string;
    featured: boolean;
    enabled: boolean;
    sortOrder: number;
    price: number;
    periodLabel: string;
    priceNote: string;
    badge: string | null;
    buttonLabel: string;
    defaultCycleMonths: number | null;
    features: PricingFeature[];
    billingCycles: PricingBillingCycle[];
}

export interface CreatePricingTierInput {
    title: string;
    featured: boolean;
    price: number;
    periodLabel: string;
    priceNote: string;
    badge: string | null;
    buttonLabel: string;
    defaultCycleMonths: number | null;
    enabled: boolean;
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

export type UpdatePricingTierInput = Partial<CreatePricingTierInput>;

export interface AdminFaqEntry {
    id: string;
    question: string;
    answer: string;
    enabled: boolean;
    sortOrder: number;
}

export interface CreateFaqEntryInput {
    question: string;
    answer: string;
    enabled: boolean;
}