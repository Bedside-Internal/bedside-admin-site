"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useFormatCards } from "@/hooks/useFormatCards";
import type { AdminFormatCard, CreateFormatCardInput } from "@/types/marketing";
import FormatCardRow from "./FormatCardRow";
import FormatCardFormModal from "./FormatCardFormModal";

export default function FormatsContent() {
    const { can } = useAdminPermissions();
    const { items, loading, error, clearError, add, update, remove, move } = useFormatCards();

    const canWrite = can("marketing", "write");
    const canDelete = can("marketing", "delete");

    const [formOpen, setFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<AdminFormatCard | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AdminFormatCard | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleAdd = () => {
        setEditingItem(null);
        setFormOpen(true);
    };

    const handleEdit = (item: AdminFormatCard) => {
        setEditingItem(item);
        setFormOpen(true);
    };

    const handleFormSubmit = async (input: CreateFormatCardInput) => {
        if (editingItem) {
            await update(editingItem.id, input);
        } else {
            await add(input);
        }
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

    return (
        <>
            {error && (
                <div className="mb-4 flex items-center justify-between rounded-md bg-coral/10 px-4 py-2.5 text-[13px] text-coral">
                    <span>{error}</span>
                    <button onClick={clearError} className="text-coral/60 hover:text-coral">×</button>
                </div>
            )}

            <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-mint">
                    Homepage format cards
                </span>
                <span className="text-[13px] text-ink/40">
                    {items.length} card{items.length !== 1 ? "s" : ""}
                </span>
            </div>

            <div className="rounded-lg border border-ink/10 bg-white">
                <div className="flex items-center border-b-2 border-ink/10">
                    <div className="w-[60px] flex-shrink-0 px-2 py-2" />
                    <div className="w-[80px] flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Color
                    </div>
                    <div className="w-[160px] flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Title
                    </div>
                    <div className="min-w-[220px] flex-1 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Description
                    </div>
                    <div className="w-[100px] flex-shrink-0 px-3 py-2 text-right text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Actions
                    </div>
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
                    <div className="px-3 py-8 text-center text-[13px] text-ink/30">
                        No format cards yet — add one to feature it on the homepage.
                    </div>
                ) : (
                    items.map((item, idx) => (
                        <FormatCardRow
                            key={item.id}
                            item={item}
                            isFirst={idx === 0}
                            isLast={idx === items.length - 1}
                            canWrite={canWrite}
                            canDelete={canDelete}
                            onMove={move}
                            onEdit={handleEdit}
                            onDelete={(item) => setDeleteTarget(item)}
                        />
                    ))
                )}
            </div>

            {canWrite && (
                <button
                    onClick={handleAdd}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-ink/15 px-4 py-1.5 text-[13px] font-medium text-ink transition-colors hover:bg-sand/60"
                >
                    <Plus size={15} />
                    Add format card
                </button>
            )}

            <FormatCardFormModal
                open={formOpen}
                initial={editingItem}
                onClose={() => {
                    setFormOpen(false);
                    setEditingItem(null);
                }}
                onSubmit={handleFormSubmit}
            />

            {deleteTarget && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setDeleteTarget(null);
                    }}
                >
                    <div className="w-[90%] max-w-[400px] rounded-xl bg-white p-7 shadow-xl">
                        <h3 className="mb-1 text-base font-semibold text-ink">
                            Delete &ldquo;{deleteTarget.title}&rdquo;?
                        </h3>
                        <p className="mb-5 text-[13px] text-ink/50">
                            This will permanently remove this format card from the homepage.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="rounded-md border border-ink/15 bg-white px-4 py-2 text-[13px] font-dm text-ink transition-colors hover:bg-sand"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                                className="rounded-md bg-coral px-4 py-2 text-[13px] font-medium text-white transition-colors hover:brightness-110 disabled:opacity-50"
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