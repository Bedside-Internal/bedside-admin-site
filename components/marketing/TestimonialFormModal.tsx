"use client";

import { useState, useEffect } from "react";
import type {
    AdminTestimonial,
    CreateTestimonialInput,
    TestimonialAudience,
    TestimonialAvatarShape,
    TestimonialAccent,
    TestimonialAvatarImage,
} from "@/types/marketing";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { FieldError, FormErrorBanner, inputBorder } from "@/components/forms/FormErrors";

// API field name -> label shown on screen (used to name problems in the banner)
const FIELD_LABELS = {
    name: "Name",
    subtitle: "Subtitle",
    quote: "Quote",
    audience: "Audience",
    avatarLabel: "Avatar initials",
    avatarImage: "Avatar photo",
    avatarShape: "Avatar shape",
    accent: "Accent color",
};

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
    onUploadPhoto: (file: File) => Promise<TestimonialAvatarImage>;
}

export default function TestimonialFormModal({
    open,
    initial,
    onClose,
    onSubmit,
    onUploadPhoto,
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
    const form = useFormSubmit(FIELD_LABELS);
    const { clear: clearFormError } = form;

    const [avatarImage, setAvatarImage] = useState<TestimonialAvatarImage | undefined>(undefined);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [readingPhoto, setReadingPhoto] = useState(false);
    const [photoError, setPhotoError] = useState<string | null>(null);

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
                setAvatarImage(initial.avatarImage);
                setAvatarPreview(
                    initial.avatarImage
                        ? `data:${initial.avatarImage.contentType};base64,${initial.avatarImage.data}`
                        : null,
                );
            } else {
                setName("");
                setSubtitle("");
                setQuote("");
                setAudience("applicant");
                setAvatarLabel("");
                setAvatarShape("circle");
                setAccent("mint");
                setEnabled(true);
                setAvatarImage(undefined);
                setAvatarPreview(null);
            }

            setPhotoError(null);
            clearFormError();
        }
    }, [open, initial, clearFormError]);

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
        // Same rules the server enforces, checked up front so the message
        // appears instantly, next to the field.
        const missing = form.check({
            name: name.trim() ? "" : "Name is required",
            subtitle: subtitle.trim() ? "" : "Subtitle is required (e.g. \"Medical school applicant\")",
            quote: quote.trim() ? "" : "Quote is required",
            avatarLabel: avatarLabel.trim() ? "" : "Initials are required (1–4 letters)",
        });
        if (missing) return;

        const ok = await form.run(() =>
            onSubmit({
                name: name.trim(),
                subtitle: subtitle.trim(),
                quote: quote.trim(),
                audience,
                avatarLabel: avatarLabel.trim(),
                avatarShape,
                accent,
                enabled,
                ...(avatarImage ? { avatarImage } : {}),
            }),
        );
        if (ok) onClose();
    };

    const handlePhotoChange = async (file: File | null) => {
        if (!file) return;
        setPhotoError(null);

        if (!ACCEPTED_TYPES.includes(file.type)) {
            setPhotoError("Please use a JPEG, PNG, or WebP image.");
            return;
        }
        if (file.size > MAX_PHOTO_BYTES) {
            setPhotoError("Image must be under 5 MB.");
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setAvatarPreview(objectUrl); // instant local preview, no network round trip

        setReadingPhoto(true);
        try {
            const uploaded = await onUploadPhoto(file); // hits the resize endpoint
            setAvatarImage(uploaded);
        } catch (err) {
            setPhotoError(err instanceof Error ? err.message : "Couldn't upload that photo — try again.");
            setAvatarPreview(null);
            URL.revokeObjectURL(objectUrl);
        } finally {
            setReadingPhoto(false);
        }
    };

    const handleRemovePhoto = () => {
        if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
        setAvatarImage(undefined);
        setAvatarPreview(null);
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="flex max-h-[85vh] w-[90%] max-w-[480px] flex-col overflow-hidden rounded-xl bg-white shadow-xl">
                <div className="overflow-y-auto p-7">               
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
                                onChange={(e) => { setName(e.target.value); form.clearField("name"); }}
                                className={`w-full rounded-md border bg-white px-3 py-2 text-sm font-dm text-ink outline-none transition-colors ${inputBorder(!!form.fieldError("name"))}`}
                            />
                            <FieldError message={form.fieldError("name")} />
                        </div>

                        {/* Subtitle */}
                        <div>
                            <label className="mb-1.5 block text-[13px] font-medium text-ink">
                                Subtitle <span className="text-coral">*</span>
                            </label>
                            <input
                                type="text"
                                value={subtitle}
                                onChange={(e) => { setSubtitle(e.target.value); form.clearField("subtitle"); }}
                                className={`w-full rounded-md border bg-white px-3 py-2 text-sm font-dm text-ink outline-none transition-colors ${inputBorder(!!form.fieldError("subtitle"))}`}
                            />
                            <FieldError message={form.fieldError("subtitle")} />
                        </div>

                        {/* Quote */}
                        <div>
                            <label className="mb-1.5 block text-[13px] font-medium text-ink">
                                Quote <span className="text-coral">*</span>
                            </label>
                            <textarea
                                rows={3}
                                value={quote}
                                onChange={(e) => { setQuote(e.target.value); form.clearField("quote"); }}
                                className={`w-full resize-none rounded-md border bg-white px-3 py-2 text-sm font-dm text-ink outline-none transition-colors ${inputBorder(!!form.fieldError("quote"))}`}
                            />
                            <FieldError message={form.fieldError("quote")} />
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
                                Avatar initials <span className="text-coral">*</span>
                            </label>
                            <input
                                type="text"
                                value={avatarLabel}
                                onChange={(e) => { setAvatarLabel(e.target.value); form.clearField("avatarLabel"); }}
                                placeholder="e.g. PN"
                                maxLength={4}
                                className={`w-full rounded-md border bg-white px-3 py-2 text-sm font-dm text-ink outline-none transition-colors ${inputBorder(!!form.fieldError("avatarLabel"))}`}
                            />
                            <FieldError message={form.fieldError("avatarLabel")} />
                        </div>

                        {/* Avatar Photo */}
                        <div>
                            <label className="mb-1.5 block text-[13px] font-medium text-ink">
                                Avatar photo <span className="text-ink/30">(optional — falls back to initials)</span>
                            </label>
                            <div className="flex items-center gap-3">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar preview"
                                        className={`h-14 w-14 object-cover ${avatarShape === "circle" ? "rounded-full" : "rounded-md"}`}
                                    />
                                ) : (
                                    <div
                                        className={`flex h-14 w-14 items-center justify-center bg-sand text-[13px] font-semibold text-ink/40 ${avatarShape === "circle" ? "rounded-full" : "rounded-md"}`}
                                    >
                                        {avatarLabel || "—"}
                                    </div>
                                )}
                                <div className="flex flex-col gap-1.5">
                                    <label className="inline-flex w-fit cursor-pointer items-center rounded-md border border-ink/15 bg-white px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:bg-sand">
                                        {readingPhoto ? "Reading…" : avatarPreview ? "Replace" : "Upload photo"}
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            className="hidden"
                                            disabled={readingPhoto}
                                            onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
                                        />
                                    </label>
                                    {avatarPreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            className="text-left text-[12px] font-medium text-coral hover:underline"
                                        >
                                            Remove photo
                                        </button>
                                    )}
                                </div>
                            </div>
                            {photoError && <p className="mt-1.5 text-[12px] text-coral">{photoError}</p>}
                            <FieldError message={form.fieldError("avatarImage")} />
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

                    <FormErrorBanner message={form.bannerMessage} />

                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="rounded-md border border-ink/15 bg-white px-4 py-2 text-[13px] font-dm text-ink transition-colors hover:bg-sand"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={form.submitting || readingPhoto}
                            className="rounded-md bg-mint px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-mint-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {form.submitting ? "Saving…" : isEdit ? "Save" : "Add"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}