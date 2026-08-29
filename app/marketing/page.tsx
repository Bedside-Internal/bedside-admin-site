"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useTestimonialSubmissions } from "@/hooks/useTestimonialSubmissions";
import AdminNav from "@/components/layout/AdminNav";
import TestimonialsContent from "@/components/marketing/TestimonialsContent";
import SubmissionsContent from "@/components/marketing/SubmissionsContent";
import FormatsContent from "@/components/marketing/FormatsContent";
import PricingContent from "@/components/marketing/PricingContent";
import FaqContent from "@/components/marketing/FaqContent";
import ReferralsContent from "@/components/marketing/ReferralsContent";
import SocialLinksContent from "@/components/marketing/SocialLinksContent";

type Tab = "testimonials" | "submissions" | "formats" | "pricing" | "faq" | "social" | "referrals";

export default function MarketingPage() {
    const { isLoaded } = useAuth();
    const { can, isLoading: permsLoading } = useAdminPermissions();
    const [tab, setTab] = useState<Tab>("testimonials");

    const submissions = useTestimonialSubmissions();

    if (!isLoaded || permsLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-cream font-dm text-ink/40">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-mint border-t-transparent" />
            </div>
        );
    }

    if (!can("marketing", "read")) {
        return (
            <div className="flex min-h-screen flex-col bg-cream font-dm text-ink">
                <AdminNav />
                <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                    <h2 className="font-poppins text-2xl font-bold text-coral">Access Denied</h2>
                    <p className="mt-2 max-w-sm text-sm text-ink/50">
                        You do not have permission to view marketing settings.
                    </p>
                </div>
            </div>
        );
    }

    const tabs: { key: Tab; label: string; badge?: number }[] = [
        { key: "testimonials", label: "Testimonials" },
        {
            key: "submissions",
            label: "Submissions",
            badge: submissions.items.length > 0 ? submissions.items.length : undefined,
        },
        { key: "formats", label: "Formats" },
        { key: "pricing", label: "Pricing" },
        { key: "referrals", label: "Referrals" },
        { key: "faq", label: "FAQ" },
        { key: "social", label: "Social links" },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-cream font-dm text-ink">
            <AdminNav />
            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    <h1 className="mb-6 font-poppins text-2xl font-bold text-ink">Marketing</h1>

                    <div className="mb-8 flex gap-6 border-b border-ink/10">
                        {tabs.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`-mb-px flex items-center gap-2 border-b-2 pb-2.5 text-sm font-medium transition-colors ${tab === t.key
                                    ? "border-mint text-ink"
                                    : "border-transparent text-ink/40 hover:text-ink/70"
                                    }`}
                            >
                                {t.label}
                                {t.badge !== undefined && (
                                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber px-1.5 text-[11px] font-bold text-ink">
                                        {t.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {tab === "testimonials" && <TestimonialsContent />}
                    {tab === "submissions" && (
                        <SubmissionsContent
                            items={submissions.items}
                            loading={submissions.loading}
                            error={submissions.error}
                            clearError={submissions.clearError}
                            pendingActionId={submissions.pendingActionId}
                            approve={submissions.approve}
                            reject={submissions.reject}
                        />
                    )}
                    {tab === "formats" && <FormatsContent />}
                    {tab === "pricing" && <PricingContent />}
                    {tab === "referrals" && <ReferralsContent />}
                    {tab === "faq" && <FaqContent />}
                    {tab === "social" && <SocialLinksContent />}
                </div>
            </main>
        </div>
    );
}