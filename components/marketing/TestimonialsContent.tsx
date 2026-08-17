"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useTestimonials } from "@/hooks/useTestimonials";
import type { AdminTestimonial, CreateTestimonialInput } from "@/types/marketing";
import TestimonialRow from "./TestimonialRow";
import TestimonialFormModal from "./TestimonialFormModal";

export default function TestimonialsContent() {
    const { can } = useAdminPermissions();
    const { items, loading, error, clearError, add, update, remove, move } =
        useTestimonials();

    const canWrite = can("marketing", "write");
    const canDelete = can("marketing", "delete");

    const [formOpen, setFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<AdminTestimonial | null>(null);

    const [deleteTarget, setDeleteTarget] = useState<AdminTestimonial | null>(
        null
    );
    const [deleting, setDeleting] = useState(false);

    const handleAdd = () => {
        setEditingItem(null);
        setFormOpen(true);
    };

    const handleEdit = (item: AdminTestimonial) => {
        setEditingItem(item);
        setFormOpen(true);
    };

    const handleFormSubmit = async (input: CreateTestimonialInput) => {
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
            {/* Error banner */}
            {error && (
                <div className="mb-4 flex items-center justify-between rounded-md bg-coral/10 px-4 py-2.5 text-[13px] text-coral">
                    <span>{error}</span>
                    <button
                        onClick={clearError}
                        className="text-coral/60 hover:text-coral"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Header row with count */}
            <div className="mb-3 flex items-center justify-between">
                <span className="text-[13px] text-ink/40">
                    {items.length} testimonial{items.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-ink/10 bg-white">
                {/* Table header */}
                <div className="flex items-center border-b-2 border-ink/10">
                    <div className="w-[30px] flex-shrink-0 px-2 py-2" />
                    <div className="w-[150px] flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Name
                    </div>
                    <div className="w-[160px] flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Subtitle
                    </div>
                    <div className="min-w-[180px] flex-1 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Quote
                    </div>
                    <div className="w-[90px] flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Tag
                    </div>
                    <div className="w-[100px] flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Group
                    </div>
                    <div className="w-[100px] flex-shrink-0 px-3 py-2 text-right text-[11px] font-medium uppercase tracking-wide text-ink/40">
                        Actions
                    </div>
                </div>

                {/* Body */}
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 border-b border-ink/10 px-4 py-4"
                        >
                            <div
                                className="h-3 flex-1 animate-pulse rounded bg-ink/10"
                                style={{ animationDelay: `${i * 150}ms` }}
                            />
                        </div>
                    ))
                ) : items.length === 0 ? (
                    <div className="px-3 py-8 text-center text-[13px] text-ink/30">
                        No testimonials yet — add one to feature it on the homepage.
                    </div>
                ) : (
                    items.map((item, idx) => (
                        <TestimonialRow
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

            {/* Add button */}
            {canWrite && (
                <button
                    onClick={handleAdd}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-mint px-4 py-1.5 text-[13px] font-medium text-mint transition-colors hover:bg-mint/[0.06]"
                >
                    <Plus size={15} />
                    Add testimonial
                </button>
            )}

            {/* Form modal */}
            <TestimonialFormModal
                open={formOpen}
                initial={editingItem}
                onClose={() => {
                    setFormOpen(false);
                    setEditingItem(null);
                }}
                onSubmit={handleFormSubmit}
            />

            {/* Delete confirm modal */}
            {deleteTarget && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setDeleteTarget(null);
                    }}
                >
                    <div className="w-[90%] max-w-[400px] rounded-xl bg-white p-7 shadow-xl">
                        <h3 className="mb-1 text-base font-semibold text-ink">
                            Delete &ldquo;{deleteTarget.name}&rdquo;?
                        </h3>
                        <p className="mb-5 text-[13px] text-ink/50">
                            This will permanently remove this testimonial.
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