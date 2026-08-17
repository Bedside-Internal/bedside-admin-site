"use client";

import { useState, useEffect } from "react";
import type {
    AdminTestimonial,
    CreateTestimonialInput,
    TestimonialAudience,
    TestimonialAvatarShape,
    TestimonialAccent,
} from "@/types/marketing";

const accents: { value: TestimonialAccent; color: string }[] = [
    { value: "mint", color: "bg-mint" },
    { value: "coral", color: "bg-coral" },
    { value: "amber", color: "bg-amber" },
    { value: "violet", color: "bg-violet" },
];

interface TestimonialFormModalProps {
    open: boolean;
    initial: AdminTestimonial | null;
    onClose: () => void;
    onSubmit: (input: CreateTestimonialInput) => Promise<void>;
}

export default function TestimonialFormModal({
    open,
    initial,
    onClose,
    onSubmit,
}: TestimonialFormModalProps) {
    const [name, setName] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [quote, setQuote] = useState("");
    const [audience, setAudience] = useState<TestimonialAudience>("applicant");
    const [avatarLabel, setAvatarLabel] = useState("");
    const [avatarShape, setAvatarShape] =
        useState<TestimonialAvatarShape>("circle");
    const [accent, setAccent] = useState<TestimonialAccent>("mint");
    const [enabled, setEnabled] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            if (initial) {
                setName(initial.name);
                setSubtitle(initial.subtitle);
                setQuote(initial.quote);
                setAudience(initial.audience);
                setAvatarLabel(initial.avatarLabel);
                setAvatarShape(initial.avatarShape);
                setAccent(initial.accent);
                setEnabled(initial.enabled);
            } else {
                setName("");
                setSubtitle("");
                setQuote("");
                setAudience("applicant");
                setAvatarLabel("");
                setAvatarShape("circle");
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
        if (!name.trim() || !quote.trim()) return;
        setSubmitting(true);
        try {
            await onSubmit({
                name: name.trim(),
                subtitle: subtitle.trim(),
                quote: quote.trim(),
                audience,
                avatarLabel: avatarLabel.trim(),
                avatarShape,
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
                    {isEdit ? "Edit Testimonial" : "Add Testimonial"}
                </h3>

                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="mb-1.5 block text-[13px] font-medium text-ink">
                            Name <span className="text-coral">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-dm text-ink outline-none transition-colors focus:border-mint"
                        />
                    </div>

                    {/* Subtitle */}
                    <div>
                        <label className="mb-1.5 block text-[13px] font-medium text-ink">
                            Subtitle
                        </label>
                        <input
                            type="text"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-dm text-ink outline-none transition-colors focus:border-mint"
                        />
                    </div>

                    {/* Quote */}
                    <div>
                        <label className="mb-1.5 block text-[13px] font-medium text-ink">
                            Quote <span className="text-coral">*</span>
                        </label>
                        <textarea
                            rows={3}
                            value={quote}
                            onChange={(e) => setQuote(e.target.value)}
                            className="w-full resize-none rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-dm text-ink outline-none transition-colors focus:border-mint"
                        />
                    </div>

                    {/* Audience toggle */}
                    <div>
                        <label className="mb-1.5 block text-[13px] font-medium text-ink">
                            Audience
                        </label>
                        <div className="flex gap-2">
                            {(["applicant", "partner"] as TestimonialAudience[]).map(
                                (opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setAudience(opt)}
                                        className={`rounded-md px-4 py-1.5 text-[13px] font-medium capitalize transition-colors ${audience === opt
                                                ? "bg-mint text-white"
                                                : "border border-ink/15 bg-white text-ink hover:bg-sand"
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Avatar initials */}
                    <div>
                        <label className="mb-1.5 block text-[13px] font-medium text-ink">
                            Avatar initials
                        </label>
                        <input
                            type="text"
                            value={avatarLabel}
                            onChange={(e) => setAvatarLabel(e.target.value)}
                            placeholder="e.g. PN"
                            className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-dm text-ink outline-none transition-colors focus:border-mint"
                        />
                    </div>

                    {/* Avatar shape toggle */}
                    <div>
                        <label className="mb-1.5 block text-[13px] font-medium text-ink">
                            Avatar shape
                        </label>
                        <div className="flex gap-2">
                            {(
                                ["circle", "square"] as TestimonialAvatarShape[]
                            ).map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setAvatarShape(opt)}
                                    className={`rounded-md px-4 py-1.5 text-[13px] font-medium capitalize transition-colors ${avatarShape === opt
                                            ? "bg-mint text-white"
                                            : "border border-ink/15 bg-white text-ink hover:bg-sand"
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Accent color swatches */}
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
                                    className={`h-7 w-7 rounded-full transition-transform ${color
                                        } ${accent === value
                                            ? "ring-2 ring-offset-2 ring-ink/30"
                                            : "opacity-60 hover:opacity-100"
                                        }`}
                                    title={value}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Enabled checkbox */}
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
                        disabled={submitting || !name.trim() || !quote.trim()}
                        className="rounded-md bg-mint px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-mint-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? "Saving…" : isEdit ? "Save" : "Add"}
                    </button>
                </div>
            </div>
        </div>
    );
}