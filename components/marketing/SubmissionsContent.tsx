"use client";

import { useState } from "react";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import type { TestimonialSubmissionAdmin } from "@/types/marketing";

const AUDIENCE_STYLES: Record<TestimonialSubmissionAdmin["audience"], string> = {
    applicant: "text-mint",
    partner: "text-coral",
};

const NAME_DISPLAY_LABELS: Record<TestimonialSubmissionAdmin["nameDisplay"], string> = {
    full_name: "Full name",
    first_name_only: "First name only",
    anonymous: "Anonymous",
};

function StarsReadOnly({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={n <= rating ? "text-amber" : "text-ink/15"}>
                    ★
                </span>
            ))}
        </div>
    );
}

interface SubmissionsContentProps {
    items: TestimonialSubmissionAdmin[];
    loading: boolean;
    error: string | null;
    clearError: () => void;
    pendingActionId: string | null;
    approve: (id: string) => Promise<void>;
    reject: (id: string, input?: { reason?: string }) => Promise<void>;
}

export default function SubmissionsContent({
    items,
    loading,
    error,
    clearError,
    pendingActionId,
    approve,
    reject,
}: SubmissionsContentProps) {
    const { can } = useAdminPermissions();
    const canWrite = can("marketing", "write");
    const [rejectTarget, setRejectTarget] = useState<TestimonialSubmissionAdmin | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    const handleRejectConfirm = async () => {
        if (!rejectTarget) return;
        await reject(rejectTarget.id, { reason: rejectReason.trim() || undefined });
        setRejectTarget(null);
        setRejectReason("");
    };

    return (
        <>
            {/* Error banner */}
            {error && (
                <div className="mb-4 flex items-center justify-between rounded-md bg-coral/10 px-4 py-2.5 text-[13px] text-coral">
                    <span>{error}</span>
                    <button onClick={clearError} className="text-coral/60 hover:text-coral">
                        ×
                    </button>
                </div>
            )}

            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-mint">
                Pending submissions
            </div>
            <p className="mb-6 text-[13px] text-ink/40">
                Review submitted testimonials before they go live. Nothing here is public yet.
            </p>

            <div className="rounded-lg border border-ink/10 bg-white">
                {/* Table header */}
                <div className="flex items-center border-b-2 border-ink/10">
                    <div className="w-[110px] flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Rating
                    </div>
                    <div className="min-w-[220px] flex-1 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Quote
                    </div>
                    <div className="w-[180px] flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Submitted by
                    </div>
                    <div className="w-[110px] flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Audience
                    </div>
                    <div className="w-[140px] flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Credit as
                    </div>
                    <div className="w-[120px] flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Consent
                    </div>
                    <div className="w-[110px] flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Submitted
                    </div>
                    <div className="w-[170px] flex-shrink-0 px-3 py-2" />
                </div>

                {/* Body */}
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 border-b border-ink/10 px-4 py-4">
                            <div
                                className="h-3 flex-1 animate-pulse rounded bg-ink/10"
                                style={{ animationDelay: `${i * 150}ms` }}
                            />
                        </div>
                    ))
                ) : items.length === 0 ? (
                    <div className="px-3 py-10 text-center text-[13px] text-ink/30">
                        All caught up — no pending submissions.
                    </div>
                ) : (
                    items.map((item, i) => {
                        const busy = pendingActionId === item.id;
                        return (
                            <div
                                key={item.id}
                                className={`flex items-start border-b border-ink/10 px-3 py-4 last:border-b-0 ${i % 2 === 1 ? "bg-ink/[0.02]" : ""
                                    }`}
                            >
                                <div className="w-[110px] flex-shrink-0 px-3 pt-0.5">
                                    <StarsReadOnly rating={item.rating} />
                                </div>
                                <div className="min-w-[220px] flex-1 px-3 text-[14px] leading-relaxed text-ink">
                                    {item.quote}
                                </div>
                                <div className="w-[180px] flex-shrink-0 px-3">
                                    <div className="text-[14px] font-semibold text-ink">{item.submittedByName}</div>
                                    <div className="truncate text-[12px] text-ink/40">{item.submittedByEmail}</div>
                                </div>
                                <div className="w-[110px] flex-shrink-0 px-3">
                                    <span
                                        className={`text-[12px] font-semibold uppercase ${AUDIENCE_STYLES[item.audience]}`}
                                    >
                                        {item.audience}
                                    </span>
                                </div>
                                <div className="w-[140px] flex-shrink-0 px-3 text-[13px] text-ink">
                                    {NAME_DISPLAY_LABELS[item.nameDisplay]}
                                </div>
                                <div className="w-[120px] flex-shrink-0 px-3 text-[13px]">
                                    {item.consentToPublish ? (
                                        <span className="text-mint">✓ Consented</span>
                                    ) : (
                                        <span className="text-coral">Not consented</span>
                                    )}
                                </div>
                                <div className="w-[110px] flex-shrink-0 px-3 text-[13px] text-ink/40">
                                    {new Date(item.submittedAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </div>
                                <div className="flex w-[170px] flex-shrink-0 items-center justify-end gap-3 px-3">
                                    {canWrite ? (
                                        <>
                                            <button
                                                onClick={() => approve(item.id)}
                                                disabled={busy}
                                                className="rounded-md border border-ink/15 bg-white px-3.5 py-1.5 text-[13px] font-bold text-ink transition-colors hover:bg-sand disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => setRejectTarget(item)}
                                                disabled={busy}
                                                className="text-[13px] font-medium text-coral transition-colors hover:text-coral/70 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-[12px] text-ink/30">View only</span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Reject confirm — lighter-weight than a full modal, but still asks
                for an optional reason since the row disappears permanently
                (hard delete, no way to recover it after). */}
            {rejectTarget && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setRejectTarget(null);
                    }}
                >
                    <div className="w-[90%] max-w-[420px] rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="mb-1.5 text-[16px] font-semibold text-ink">Reject this submission?</h3>
                        <p className="mb-4 text-[13px] text-ink/50">
                            This permanently deletes {rejectTarget.submittedByName}'s submission — it won't be kept
                            anywhere for later review.
                        </p>
                        <textarea
                            rows={2}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Internal note (optional) — not shown to the user"
                            className="mb-4 w-full resize-none rounded-md border border-ink/15 bg-white px-3 py-2 text-[13px] text-ink outline-none transition-colors focus:border-mint"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setRejectTarget(null)}
                                className="rounded-md border border-ink/15 bg-white px-4 py-2 text-[13px] text-ink transition-colors hover:bg-sand"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectConfirm}
                                className="rounded-md bg-coral px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-coral/90"
                            >
                                Reject & delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}