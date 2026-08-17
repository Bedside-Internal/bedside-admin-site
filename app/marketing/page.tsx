"use client";

import { useAuth } from "@clerk/nextjs";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import AdminNav from "@/components/layout/AdminNav";
import TestimonialsContent from "@/components/marketing/TestimonialsContent";

export default function MarketingPage() {
    const { isLoaded } = useAuth();
    const { can, isLoading: permsLoading } = useAdminPermissions();

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
                    <h2 className="font-poppins text-2xl font-bold text-coral">
                        Access Denied
                    </h2>
                    <p className="mt-2 max-w-sm text-sm text-ink/50">
                        You do not have permission to view marketing settings.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-cream font-dm text-ink">
            <AdminNav />
            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    <div className="mb-8 flex items-center gap-3">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="font-poppins text-2xl font-bold text-ink">
                                    Testimonials
                                </h1>
                                <span className="rounded-full bg-mint/15 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-mint">
                                    TESTIMONIALS
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-ink/50">
                                Manage homepage testimonials — add, reorder, edit, or remove.
                            </p>
                        </div>
                    </div>
                    <TestimonialsContent />
                </div>
            </main>
        </div>
    );
}