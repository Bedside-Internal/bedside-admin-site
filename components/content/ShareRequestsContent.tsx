"use client";

import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import type { ShareRequest } from "@/lib/api/userQuestions";

interface ShareRequestsContentProps {
    items: ShareRequest[];
    loading: boolean;
    error: string | null;
    clearError: () => void;
    pendingActionId: string | null;
    approve: (id: string) => Promise<void>;
    reject: (id: string) => Promise<void>;
}

export default function ShareRequestsContent({
    items,
    loading,
    error,
    clearError,
    pendingActionId,
    approve,
    reject,
}: ShareRequestsContentProps) {
    const { can } = useAdminPermissions();
    const canWrite = can("content", "write");

    return (
        <>
            {error && (
                <div className="mb-4 flex items-center justify-between rounded-md bg-coral/10 px-4 py-2.5 text-[13px] text-coral">
                    <span>{error}</span>
                    <button onClick={clearError} className="text-coral/60 hover:text-coral">
                        ×
                    </button>
                </div>
            )}

            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-mint">
                Pending share requests
            </div>
            <p className="mb-6 text-[13px] text-ink/40">
                Users are asking to make their own generated questions public. Approving makes it visible to everyone; rejecting sends it back to private.
            </p>

            <div className="rounded-lg border border-ink/10 bg-white">
                <div className="flex items-center border-b-2 border-ink/10">
                    <div className="w-[220px] flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Section
                    </div>
                    <div className="w-[120px] flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Difficulty
                    </div>
                    <div className="min-w-[140px] flex-1 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Requested
                    </div>
                    <div className="w-[180px] flex-shrink-0 px-3 py-2" />
                </div>

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
                        No pending share requests.
                    </div>
                ) : (
                    items.map((item, i) => {
                        const busy = pendingActionId === item.id;
                        return (
                            <div
                                key={item.id}
                                className={`flex items-center border-b border-ink/10 px-3 py-4 last:border-b-0 ${i % 2 === 1 ? "bg-ink/[0.02]" : ""}`}
                            >
                                <div className="w-[220px] flex-shrink-0 px-3 text-[14px] font-medium text-ink">
                                    {item.sectionTitle}
                                </div>
                                <div className="w-[120px] flex-shrink-0 px-3 text-[13px] capitalize text-ink/60">
                                    {item.difficulty}
                                </div>
                                <div className="min-w-[140px] flex-1 px-3 text-[13px] text-ink/40">
                                    {new Date(item.updatedAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </div>
                                <div className="flex w-[180px] flex-shrink-0 items-center justify-end gap-3 px-3">
                                    {canWrite ? (
                                        <>
                                            <button
                                                onClick={() => approve(item.id)}
                                                disabled={busy}
                                                className="rounded-md border border-mint/40 bg-white px-3.5 py-1.5 text-[13px] font-bold text-mint transition-colors hover:bg-mint/10 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {busy ? "…" : "Approve"}
                                            </button>
                                            <button
                                                onClick={() => reject(item.id)}
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
        </>
    );
}