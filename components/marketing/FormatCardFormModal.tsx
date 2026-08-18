"use client";

import { useState, useEffect } from "react";
import type { AdminFormatCard, CreateFormatCardInput, FormatCardAccent } from "@/types/marketing";

const accents: { value: FormatCardAccent; color: string }[] = [
    { value: "mint", color: "bg-mint" },
    { value: "coral", color: "bg-coral" },
    { value: "amber", color: "bg-amber" },
    { value: "violet", color: "bg-violet" },
];

interface FormatCardFormModalProps {
    open: boolean;
    initial: AdminFormatCard | null;
    onClose: () => void;
    onSubmit: (input: CreateFormatCardInput) => Promise<void>;
}

export default function FormatCardFormModal({
    open,
    initial,
    onClose,
    onSubmit,
}: FormatCardFormModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [accent, setAccent] = useState<FormatCardAccent>("mint");
    const [enabled, setEnabled] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            if (initial) {
                setTitle(initial.title);
                setDescription(initial.description);
                setAccent(initial.accent);
                setEnabled(initial.enabled);
            } else {
                setTitle("");
                setDescription("");
                setAccent("mint");
                setEnabled(true);
            }
        }
    }, [open, initial]);

    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    if (!open) return null;

    const isEdit = initial !== null;

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) return;
        setSubmitting(true);
        try {
            await onSubmit({
                title: title.trim(),
                description: description.trim(),
                accent,
                enabled,
            });
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="w-[90%] max-w-[480px] rounded-xl bg-white p-7 shadow-xl">
                <h3 className="mb-5 text-lg font-semibold text-ink">
                    {isEdit ? "Edit Format Card" : "Add Format Card"}
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-[13px] font-medium text-ink">
                            Title <span className="text-coral">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-dm text-ink outline-none transition-colors focus:border-mint"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-[13px] font-medium text-ink">
                            Description <span className="text-coral">*</span>
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full resize-none rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-dm text-ink outline-none transition-colors focus:border-mint"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-[13px] font-medium text-ink">
                            Accent color
                        </label>
                        <div className="flex gap-3">
                            {accents.map(({ value, color }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setAccent(value)}
                                    className={`h-7 w-7 rounded-full transition-transform ${color} ${accent === value
                                            ? "ring-2 ring-offset-2 ring-ink/30"
                                            : "opacity-60 hover:opacity-100"
                                        }`}
                                    title={value}
                                />
                            ))}
                        </div>
                    </div>

                    <label className="flex items-center gap-2.5 text-[13px] font-medium text-ink">
                        <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                            className="h-4 w-4 rounded border-ink/15 accent-mint"
                        />
                        Visible on homepage
                    </label>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-md border border-ink/15 bg-white px-4 py-2 text-[13px] font-dm text-ink transition-colors hover:bg-sand"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !title.trim() || !description.trim()}
                        className="rounded-md bg-mint px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-mint-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? "Saving…" : isEdit ? "Save" : "Add"}
                    </button>
                </div>
            </div>
        </div>
    );
}