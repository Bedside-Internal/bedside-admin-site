"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import type { UserSubmittedQuestionAdmin } from "@/types/marketing";

const VISIBILITY_STYLES: Record<UserSubmittedQuestionAdmin["visibility"], string> = {
    private: "text-sand bg-sand/20",
    pending: "text-amber bg-amber/20",
    approved: "text-mint bg-mint/20",
    rejected: "text-coral bg-coral/20",
};

const VISIBILITY_LABELS: Record<UserSubmittedQuestionAdmin["visibility"], string> = {
    private: "Private",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
};

function StatusBadge({ visibility }: { visibility: UserSubmittedQuestionAdmin["visibility"] }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${VISIBILITY_STYLES[visibility]}`}>
            {VISIBILITY_LABELS[visibility]}
        </span>
    );
}

interface SubmittedQuestionsContentProps {
    items: UserSubmittedQuestionAdmin[];
    loading: boolean;
    error: string | null;
    clearError: () => void;
    pendingActionId: string | null;
    approve: (id: string) => Promise<void>;
    reject: (id: string, input?: { reason?: string }) => Promise<void>;
}

export default function SubmittedQuestionsContent({
    items,
    loading,
    error,
    clearError,
    pendingActionId,
    approve,
    reject,
}: SubmittedQuestionsContentProps) {
    const { can } = useAdminPermissions();
    const canWrite = can("content", "write");
    const router = useRouter();
    const [rejectTarget, setRejectTarget] = useState<UserSubmittedQuestionAdmin | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    const handleApprove = async (id: string) => {
        await approve(id);
        // Redirect to write question form with prefill
        router.push(`/admin/content?prefill=submission:${id}`);
    };

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
                Review submitted questions before they go live. Approved questions can be turned into full practice questions via the "Write Question" form.
            </p>

            <div className="rounded-lg border border-ink/10 bg-white">
                {/* Table header */}
                <div className="flex items-center border-b-2 border-ink/10">
                    <div className="w-[140px] flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Format
                    </div>
                    <div className="min-w-[200px] flex-1 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Question
                    </div>
                    <div className="w-[160px] flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Category
                    </div>
                    <div className="w-[180px] flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Submitted by
                    </div>
                    <div className="w-[110px] flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Submitted
                    </div>
                    <div className="w-[100px] flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Status
                    </div>
                    <div className="w-[180px] flex-shrink-0 px-3 py-2" />
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
                                className={`flex items-start border-b border-ink/10 px-3 py-4 last:border-b-0 ${i % 2 === 1 ? "bg-ink/[0.02]" : ""}`}
                            >
                                <div className="w-[140px] flex-shrink-0 px-3 pt-0.5 text-[13px] text-ink">
                                    {item.formatTitle ?? "—"}
                                </div>
                                <div className="min-w-[200px] flex-1 px-3 text-[14px] leading-relaxed text-ink">
                                    {item.questionText}
                                </div>
                                <div className="w-[160px] flex-shrink-0 px-3 text-[13px] text-ink">
                                    {item.categoryText}
                                </div>
                                <div className="w-[180px] flex-shrink-0 px-3">
                                    <div className="text-[14px] font-semibold text-ink">{item.submittedByName}</div>
                                    <div className="truncate text-[12px] text-ink/40">{item.submittedByEmail}</div>
                                </div>
                                <div className="w-[110px] flex-shrink-0 px-3 text-[13px] text-ink/40">
                                    {new Date(item.submittedAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </div>
                                <div className="w-[100px] flex-shrink-0 px-3">
                                    <StatusBadge visibility={item.visibility} />
                                </div>
                                <div className="flex w-[180px] flex-shrink-0 items-center justify-end gap-3 px-3">
                                    {canWrite && item.visibility === "pending" ? (
                                        <>
                                            <button
                                                onClick={() => handleApprove(item.id)}
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

            {/* Reject confirm */}
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
                            This marks {rejectTarget.submittedByName}'s submission as rejected — it will be kept for audit trail with the reason below.
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
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}