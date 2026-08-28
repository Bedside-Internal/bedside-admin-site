"use client";

import { useState } from "react";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useReferrals } from "@/hooks/useReferrals";
import type { AdminReferral } from "@/types/marketing";

function formatDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function StatusPill({ referral }: { referral: AdminReferral }) {
    if (referral.voidedAt) {
        return (
            <span className="rounded-full bg-coral/10 px-2.5 py-1 text-[11px] font-semibold text-coral">
                Voided
            </span>
        );
    }
    if (referral.activatedAt) {
        return (
            <span className="rounded-full bg-mint/10 px-2.5 py-1 text-[11px] font-semibold text-mint">
                Activated
            </span>
        );
    }
    return (
        <span className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-semibold text-ink/50">
            Pending activation
        </span>
    );
}

export default function ReferralsContent() {
    const { can } = useAdminPermissions();
    const { items, loading, error, clearError, pendingActionId, voidOne } = useReferrals();
    const canWrite = can("marketing", "write");

    const [voidTarget, setVoidTarget] = useState<AdminReferral | null>(null);
    const [voidReason, setVoidReason] = useState("");

    const handleVoidConfirm = async () => {
        if (!voidTarget) return;
        await voidOne(voidTarget.id, voidReason.trim() ? { reason: voidReason.trim() } : undefined);
        setVoidTarget(null);
        setVoidReason("");
    };

    return (
        <>
            {error && (
                <div className="mb-4 flex items-center justify-between rounded-md bg-coral/10 px-4 py-2.5 text-[13px] text-coral">
                    <span>{error}</span>
                    <button onClick={clearError} className="text-coral/60 hover:text-coral">×</button>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-16 text-ink/30">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-mint border-t-transparent" />
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-lg border border-dashed border-ink/15 bg-white px-6 py-16 text-center">
                    <p className="text-sm text-ink/40">No referrals yet.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
                    <table className="w-full text-left text-[13px]">
                        <thead>
                            <tr className="border-b border-ink/10 bg-sand/40 text-[11px] font-semibold uppercase tracking-wide text-ink/50">
                                <th className="px-4 py-3">Referrer</th>
                                <th className="px-4 py-3">Referred friend</th>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Joined</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((r) => (
                                <tr key={r.id} className="border-b border-ink/5 last:border-0 hover:bg-sand/20">
                                    <td className="px-4 py-3 text-ink">{r.referrerEmail ?? r.referrerUserId}</td>
                                    <td className="px-4 py-3 text-ink">{r.referredEmail ?? r.referredUserId}</td>
                                    <td className="px-4 py-3 font-mono text-ink/60">{r.codeUsed}</td>
                                    <td className="px-4 py-3 text-ink/60">{formatDate(r.createdAt)}</td>
                                    <td className="px-4 py-3">
                                        <StatusPill referral={r} />
                                        {r.voidedReason && (
                                            <p className="mt-1 max-w-[220px] truncate text-[11px] text-ink/40" title={r.voidedReason}>
                                                {r.voidedReason}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {canWrite && !r.voidedAt && (
                                            <button
                                                onClick={() => setVoidTarget(r)}
                                                disabled={pendingActionId === r.id}
                                                className="whitespace-nowrap text-[13px] font-medium text-coral hover:brightness-110 disabled:opacity-50"
                                            >
                                                {pendingActionId === r.id ? "Voiding…" : "Void"}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {voidTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
                    <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
                        <h3 className="mb-1.5 font-poppins text-base font-bold text-ink">Void this referral?</h3>
                        <p className="mb-4 text-[13px] text-ink/50">
                            This stops it from counting toward {voidTarget.referrerEmail ?? "the referrer"}&apos;s unlock
                            progress. The row stays for the audit trail — it&apos;s not deleted, and any tier already
                            granted from it is NOT clawed back.
                        </p>
                        <label className="mb-1.5 block text-[13px] text-ink/60">Reason (optional)</label>
                        <textarea
                            value={voidReason}
                            onChange={(e) => setVoidReason(e.target.value)}
                            rows={3}
                            placeholder="e.g. same email domain as referrer, looks like a throwaway signup"
                            className="mb-5 w-full resize-none rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm font-dm text-ink outline-none focus:border-mint"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => { setVoidTarget(null); setVoidReason(""); }}
                                className="rounded-md border border-ink/15 bg-white px-4 py-2 text-[13px] text-ink hover:bg-sand"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleVoidConfirm}
                                disabled={pendingActionId === voidTarget.id}
                                className="rounded-md bg-coral px-4 py-2 text-[13px] font-medium text-white hover:brightness-110 disabled:opacity-50"
                            >
                                {pendingActionId === voidTarget.id ? "Voiding…" : "Void referral"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}