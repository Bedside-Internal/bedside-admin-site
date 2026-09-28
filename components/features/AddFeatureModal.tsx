"use client";

import { useState, useEffect, useRef } from "react";
import { IconPicker } from "./IconPicker";
import type { FeatureType, AdminFeature } from "@/types/admin";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { FieldError, FormErrorBanner, inputBorder } from "@/components/forms/FormErrors";

const FIELD_LABELS = {
  title: "Title",
  subtitle: "Description",
  href: "Href",
  parent_track: "Parent Track",
  icon: "Icon",
};

interface AddFeatureModalProps {
  open: boolean;
  type: FeatureType;
  tracks: AdminFeature[];
  onClose: () => void;
  onSubmit: (data: {
    key: string;
    type: FeatureType;
    title: string;
    subtitle: string;
    icon: string;
    href: string | null;
    parent_track: string | null;
    enabled: boolean;
  }) => Promise<void>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateUniqueKey(title: string, existingKeys: string[]): string {
  let slug = slugify(title);
  if (!slug) slug = "untitled";
  if (!existingKeys.includes(slug)) return slug;
  let counter = 2;
  while (existingKeys.includes(`${slug}-${counter}`)) counter++;
  return `${slug}-${counter}`;
}

export function AddFeatureModal({
  open,
  type,
  tracks,
  onClose,
  onSubmit,
}: AddFeatureModalProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [icon, setIcon] = useState("help-circle");
  const [href, setHref] = useState("");
  const [parentTrack, setParentTrack] = useState("");
  const form = useFormSubmit(FIELD_LABELS);
  const { clear: clearFormError } = form;
  const titleRef = useRef<HTMLInputElement>(null);

  const isTrack = type === "track";
  const label = isTrack ? "Track" : "Format";
  const canSubmit = !form.submitting;

  useEffect(() => {
    if (open) {
      setTitle("");
      setSubtitle("");
      setIcon("help-circle");
      setHref("");
      setParentTrack(tracks.length === 1 ? tracks[0]._id : "");
      clearFormError();
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [open, tracks, clearFormError]);

  useEffect(() => {
    if (!open) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const missing = form.check({
      title: title.trim() ? "" : `${label} title is required`,
      parent_track: isTrack || parentTrack ? "" : "Choose which track this format belongs to",
    });
    if (missing) return;

    const existingKeys = tracks.map((f) => f._id);
    const key = generateUniqueKey(title.trim(), existingKeys);

    const ok = await form.run(() =>
      onSubmit({
        key,
        type,
        title: title.trim(),
        subtitle: subtitle.trim(),
        icon,
        href: isTrack ? href.trim() || null : null,
        parent_track: !isTrack ? parentTrack || null : null,
        enabled: false,
      }),
    );
    if (ok) onClose();
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
          Add {label}
        </h3>

        <div className="space-y-3.5">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink">
              Title <span className="text-coral">*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); form.clearField("title"); }}
              placeholder={`e.g. New ${label}`}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              className={`w-full rounded-md border bg-white px-3 py-2 text-sm font-dm text-ink outline-none transition-colors ${inputBorder(!!form.fieldError("title"))}`}
            />
            <FieldError message={form.fieldError("title")} />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink">
              Description
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => { setSubtitle(e.target.value); form.clearField("subtitle"); }}
              placeholder="Brief description…"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              className={`w-full rounded-md border bg-white px-3 py-2 text-sm font-dm text-ink outline-none transition-colors ${inputBorder(!!form.fieldError("subtitle"))}`}
            />
            <FieldError message={form.fieldError("subtitle")} />
          </div>

          {isTrack && (
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-ink">
                Href
              </label>
              <input
                type="text"
                value={href}
                onChange={(e) => { setHref(e.target.value); form.clearField("href"); }}
                placeholder="/onboarding/…"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                className={`w-full rounded-md border bg-white px-3 py-2 font-mono text-[13px] text-ink outline-none transition-colors ${inputBorder(!!form.fieldError("href"))}`}
              />
              <FieldError message={form.fieldError("href")} />
            </div>
          )}

          {!isTrack && (
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-ink">
                Parent Track <span className="text-coral">*</span>
              </label>
              <select
                value={parentTrack}
                onChange={(e) => { setParentTrack(e.target.value); form.clearField("parent_track"); }}
                className={`w-full cursor-pointer rounded-md border bg-white px-3 py-2 text-sm font-dm text-ink outline-none transition-colors ${inputBorder(!!form.fieldError("parent_track"))}`}
              >
                <option value="">— select track —</option>
                {tracks.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title}
                  </option>
                ))}
              </select>
              <FieldError message={form.fieldError("parent_track")} />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink">
              Icon
            </label>
            <IconPicker value={icon} onChange={setIcon} />
            <FieldError message={form.fieldError("icon")} />
          </div>
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
            disabled={!canSubmit}
            className={`rounded-md px-4 py-2 text-[13px] font-medium text-white transition-colors ${
              canSubmit
                ? "bg-mint hover:bg-mint-hover"
                : "cursor-default bg-ink/25"
            }`}
          >
            {form.submitting ? "Adding…" : `Add ${label}`}
          </button>
        </div>
      </div>
    </div>
  );
}