"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import type { UserSubmittedQuestionAdmin } from "@/types/marketing";
import type { Format, Section } from "@/types/content";

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
    approve: (id: string, input?: { sectionId?: string }) => Promise<void>;
    reject: (id: string, input?: { reason?: string }) => Promise<void>;
    formats: Format[];
    sections: Section[];
}

export default function SubmittedQuestionsContent({
    items,
    loading,
    error,
    clearError,
    pendingActionId,
    approve,
    reject,
    formats,
    sections,
}: SubmittedQuestionsContentProps) {
    const { can } = useAdminPermissions();
    const canWrite = can("content", "write");
    const router = useRouter();
    const [rejectTarget, setRejectTarget] = useState<UserSubmittedQuestionAdmin | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    // Approve now needs a section before it can proceed — submissions never
    // carry a real sectionId (formatId on a submission is unreliable, see
    // MyQuestionsClient's free-tier form), so the admin picks one here.
    const [approveTarget, setApproveTarget] = useState<UserSubmittedQuestionAdmin | null>(null);
    const [selectedSectionId, setSelectedSectionId] = useState("");
    const [approving, setApproving] = useState(false);

    const activeFormats = useMemo(() => formats.filter((f) => !f.killed), [formats]);
    const activeSections = useMemo(() => sections.filter((s) => !s.killed), [sections]);

    const handleApproveClick = (item: UserSubmittedQuestionAdmin) => {
        setApproveTarget(item);
        setSelectedSectionId("");
    };

    const handleApproveConfirm = async () => {
        if (!approveTarget || !selectedSectionId) return;
        setApproving(true);
        try {
            const { id, questionText } = approveTarget;
            await approve(id, { sectionId: selectedSectionId });
            setApproveTarget(null);
            // Carry sectionId + topic forward in the URL rather than relying
            // on a post-redirect lookup into `items` — approve() already
            // drops this submission from local state immediately, so a
            // find-by-id after redirect would silently come back empty.
            router.push(
                `/admin/content?prefill=submission:${id}&sectionId=${selectedSectionId}&topic=${encodeURIComponent(questionText)}`,
            );
        } finally {
            setApproving(false);
        }
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
                Review submitted questions before they go live. Approving picks a section, then generates a full draft with a real rubric from the submitted text.
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
                                                onClick={() => handleApproveClick(item)}
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

            {/* Approve — section picker */}
            {approveTarget && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setApproveTarget(null);
                    }}
                >
                    <div className="w-[90%] max-w-[440px] rounded-xl bg-white p-6 shadow-xl">
                        <h3 className="mb-1.5 text-[16px] font-semibold text-ink">Approve this submission</h3>
                        <p className="mb-4 text-[13px] text-ink/50">
                            Pick which section this belongs to. You&apos;ll generate a full draft with a real rubric from the submitted text next.
                        </p>

                        <label className="mb-1 block text-xs font-medium text-ink/50">Section</label>
                        <select
                            className="mb-4 w-full rounded-md border border-ink/10 bg-sand/60 px-3 py-2 text-sm outline-none focus:border-mint-500"
                            value={selectedSectionId}
                            onChange={(e) => setSelectedSectionId(e.target.value)}
                        >
                            <option value="">Select section…</option>
                            {activeFormats.map((f) => {
                                const fmtSections = activeSections.filter((s) => s.formatId === f.id);
                                if (fmtSections.length === 0) return null;
                                return (
                                    <optgroup key={f.id} label={f.title}>
                                        {fmtSections.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.title}
                                            </option>
                                        ))}
                                    </optgroup>
                                );
                            })}
                        </select>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setApproveTarget(null)}
                                className="rounded-md border border-ink/15 bg-white px-4 py-2 text-[13px] text-ink transition-colors hover:bg-sand"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApproveConfirm}
                                disabled={!selectedSectionId || approving}
                                className="rounded-md bg-mint px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-mint/90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {approving ? "Approving…" : "Approve & Continue"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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