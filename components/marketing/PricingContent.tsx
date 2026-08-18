"use client";

import { useState } from "react";
import { Plus, ChevronUp, ChevronDown } from "lucide-react";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { usePricingTiers } from "@/hooks/usePricingTiers";
import type { AdminPricingTier } from "@/types/marketing";
import PricingTierColumn from "./PricingTierColumn";

export default function PricingContent() {
    const { can } = useAdminPermissions();
    const { items, loading, error, clearError, add, update, remove, move, ...nested } = usePricingTiers();

    const canWrite = can("marketing", "write");
    const canDelete = can("marketing", "delete");

    const [creating, setCreating] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<AdminPricingTier | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleCreate = async () => {
        if (!newTitle.trim()) return;
        await add({
            title: newTitle.trim(),
            featured: false,
            price: 0,
            periodLabel: "",
            priceNote: "",
            badge: null,
            buttonLabel: "Get started →",
            defaultCycleMonths: null,
            enabled: true,
        });
        setNewTitle("");
        setCreating(false);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await remove(deleteTarget.id);
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    };

    const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

    return (
        <>
            {error && (
                <div className="mb-4 flex items-center justify-between rounded-md bg-coral/10 px-4 py-2.5 text-[13px] text-coral">
                    <span>{error}</span>
                    <button onClick={clearError} className="text-coral/60 hover:text-coral">×</button>
                </div>
            )}

            {loading ? (
                <div className="h-40 animate-pulse rounded-lg bg-ink/5" />
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {sorted.map((tier, idx) => (
                        <div key={tier.id} className="relative">
                            {canWrite && (
                                <div className="absolute -left-1 top-6 z-10 flex flex-col gap-0.5">
                                    <button
                                        onClick={() => move(tier.id, "up")}
                                        disabled={idx === 0}
                                        className="text-mint transition-colors hover:text-mint-hover disabled:cursor-not-allowed disabled:text-ink/15"
                                    >
                                        <ChevronUp size={14} />
                                    </button>
                                    <button
                                        onClick={() => move(tier.id, "down")}
                                        disabled={idx === sorted.length - 1}
                                        className="text-mint transition-colors hover:text-mint-hover disabled:cursor-not-allowed disabled:text-ink/15"
                                    >
                                        <ChevronDown size={14} />
                                    </button>
                                </div>
                            )}
                            <PricingTierColumn
                                tier={tier}
                                canWrite={canWrite}
                                canDelete={canDelete}
                                onDelete={() => setDeleteTarget(tier)}
                                onUpdate={(input) => update(tier.id, input)}
                                {...nested}
                            />
                        </div>
                    ))}

                    {canWrite && (
                        <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-ink/15 p-6">
                            {creating ? (
                                <div className="w-full space-y-3">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newTitle}
                                        placeholder="Tier name, e.g. Team"
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                                        className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-dm text-ink outline-none focus:border-mint"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => { setCreating(false); setNewTitle(""); }}
                                            className="rounded-md border border-ink/15 bg-white px-3 py-1.5 text-[13px] text-ink hover:bg-sand"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreate}
                                            disabled={!newTitle.trim()}
                                            className="rounded-md bg-mint px-3 py-1.5 text-[13px] font-medium text-white hover:bg-mint-hover disabled:opacity-50"
                                        >
                                            Create
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setCreating(true)}
                                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-mint hover:text-mint-hover"
                                >
                                    <Plus size={15} />
                                    Add pricing tier
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {deleteTarget && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35"
                    onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
                >
                    <div className="w-[90%] max-w-[400px] rounded-xl bg-white p-7 shadow-xl">
                        <h3 className="mb-1 text-base font-semibold text-ink">
                            Delete &ldquo;{deleteTarget.title}&rdquo;?
                        </h3>
                        <p className="mb-5 text-[13px] text-ink/50">
                            This will permanently remove this pricing tier from the homepage.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="rounded-md border border-ink/15 bg-white px-4 py-2 text-[13px] text-ink hover:bg-sand"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                                className="rounded-md bg-coral px-4 py-2 text-[13px] font-medium text-white hover:brightness-110 disabled:opacity-50"
                            >
                                {deleting ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}