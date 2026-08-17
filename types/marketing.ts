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