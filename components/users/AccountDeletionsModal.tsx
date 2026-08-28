"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAccountDeletions } from "@/hooks/useAccountDeletions";

interface AccountDeletionsModalProps {
    onClose: () => void;
}

function daysUntil(iso: string): number {
    return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function AccountDeletionsModal({ onClose }: AccountDeletionsModalProps) {
    const { items, loading, error, clearError, pendingActionId, restore } = useAccountDeletions();
    const [restoringId, setRestoringId] = useState<string | null>(null);
    const [newClerkId, setNewClerkId] = useState("");

    const handleRestoreConfirm = async () => {
        if (!restoringId || !newClerkId.trim()) return;
        await restore(restoringId, newClerkId.trim());
        setRestoringId(null);
        setNewClerkId("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
            <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-hard">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-poppins text-lg font-bold text-ink">
                        Pending account deletions
                    </h2>
                    <button onClick={onClose} className="text-ink/40 hover:text-ink/70">
                        <X size={20} />
                    </button>
                </div>
                <p className="mb-4 text-[13px] text-ink/50">
                    Restoring re-links this person&apos;s existing data to a new Clerk
                    account and cancels the scheduled purge. Get the new Clerk user id
                    from their fresh signup before restoring.
                </p>

                {error && (
                    <div className="mb-4 flex items-center justify-between rounded-md bg-coral/10 px-3 py-2 text-[13px] text-coral">
                        <span>{error}</span>
                        <button onClick={clearError} className="text-coral/60 hover:text-coral">×</button>
                    </div>
                )}

                {loading ? (
                    <div className="py-10 text-center text-sm text-ink/40">Loading…</div>
                ) : items.length === 0 ? (
                    <div className="py-10 text-center text-[13px] text-ink/30">
                        No pending deletions right now.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((item) => {
                            const daysLeft = daysUntil(item.scheduledPurgeAt);
                            const busy = pendingActionId === item.id;
                            return (
                                <div key={item.id} className="rounded-lg border border-ink/10 p-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-semibold text-ink">
                                                {item.firstName ?? "Unknown"} — {item.email ?? "no email on file"}
                                            </div>
                                            <div className="text-[12px] text-ink/40">
                                                Old Clerk id: <span className="font-mono">{item.clerkId}</span>
                                            </div>
                                            <div className={`text-[12px] ${daysLeft <= 3 ? "text-coral" : "text-ink/40"}`}>
                                                {daysLeft > 0 ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} until purge` : "Purge overdue"}
                                            </div>
                                        </div>
                                        {restoringId !== item.id && (
                                            <button
                                                onClick={() => setRestoringId(item.id)}
                                                className="rounded-md bg-mint px-3 py-1.5 text-[13px] font-medium text-white hover:bg-mint-hover"
                                            >
                                                Restore
                                            </button>
                                        )}
                                    </div>

                                    {restoringId === item.id && (
                                        <div className="mt-3 flex items-center gap-2 border-t border-ink/10 pt-3">
                                            <input
                                                type="text"
                                                value={newClerkId}
                                                onChange={(e) => setNewClerkId(e.target.value)}
                                                placeholder="New Clerk user id (from fresh signup)"
                                                className="flex-1 rounded-md border border-ink/15 bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-mint"
                                            />
                                            <button
                                                onClick={handleRestoreConfirm}
                                                disabled={busy || !newClerkId.trim()}
                                                className="rounded-md bg-mint px-3 py-2 text-[13px] font-medium text-white hover:bg-mint-hover disabled:opacity-50"
                                            >
                                                {busy ? "Restoring…" : "Confirm"}
                                            </button>
                                            <button
                                                onClick={() => { setRestoringId(null); setNewClerkId(""); }}
                                                className="rounded-md border border-ink/15 px-3 py-2 text-[13px] text-ink hover:bg-sand"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}