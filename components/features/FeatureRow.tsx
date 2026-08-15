"use client";

import { useState } from "react";
import { GripVertical } from "lucide-react";
import { resolveIcon } from "@/lib/iconRegistry";
import { IconPicker } from "./IconPicker";
import type { AdminFeature, UpsertFeatureInput, FeatureType } from "@/types/admin";

interface FeatureRowProps {
  feature: AdminFeature;
  type: FeatureType;
  tracks: AdminFeature[];
  canWrite: boolean;
  dragHandleProps?: Record<string, unknown>;
  onToggleEnabled: (feature: AdminFeature) => Promise<void>;
  onSave: (key: string, data: UpsertFeatureInput) => Promise<AdminFeature>;
  onKill: (key: string, reason: string) => Promise<AdminFeature>;
  onRestore: (key: string) => Promise<AdminFeature>;
}

export function FeatureRow({
  feature,
  type,
  tracks,
  canWrite,
  dragHandleProps,
  onToggleEnabled,
  onSave,
  onKill,
  onRestore,
}: FeatureRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editHref, setEditHref] = useState("");
  const [editParentTrack, setEditParentTrack] = useState("");
  const [saving, setSaving] = useState(false);
  const [showKillModal, setShowKillModal] = useState(false);
  const [killReason, setKillReason] = useState("");
  const [killError, setKillError] = useState("");

  const Icon = resolveIcon(feature.icon);
  const isTrack = type === "track";
  const parentTrackTitle =
    feature.parent_track &&
    tracks.find((t) => t._id === feature.parent_track)?.title;

  const handleStartEdit = () => {
    setEditTitle(feature.title);
    setEditSubtitle(feature.subtitle);
    setEditIcon(feature.icon);
    setEditHref(feature.href || "");
    setEditParentTrack(feature.parent_track || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => setIsEditing(false);

  const handleSave = async () => {
    if (!editTitle.trim()) return;
    setSaving(true);
    try {
      const data: UpsertFeatureInput = {
        type: feature.type,
        title: editTitle.trim(),
        subtitle: editSubtitle.trim() || undefined,
        icon: editIcon || undefined,
        enabled: feature.enabled,
        order: feature.order,
      };
      if (isTrack) {
        data.href = editHref.trim() || null;
      } else {
        data.parent_track = editParentTrack || null;
      }
      await onSave(feature._id, data);
      setIsEditing(false);
    } catch {
      // Error handled by parent
    } finally {
      setSaving(false);
    }
  };

  const handleKill = async () => {
    if (!killReason.trim()) {
      setKillError("Reason is required");
      return;
    }
    try {
      await onKill(feature._id, killReason.trim());
      setShowKillModal(false);
      setKillReason("");
      setKillError("");
    } catch {
      // Error handled by parent
    }
  };

  const handleRestore = async () => {
    try {
      await onRestore(feature._id);
    } catch {
      // Error handled by parent
    }
  };

  const handleCheckboxClick = () => {
    if (feature.killed || !canWrite) return;
    onToggleEnabled(feature);
  };

  return (
    <>
      <div
        className={`flex items-center border-b border-ink/10 ${
          feature.killed ? "bg-coral/[0.03] opacity-70" : ""
        }`}
      >
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="cursor-grab px-2 py-2.5 text-ink/25"
        >
          <GripVertical size={16} />
        </div>

        {/* Icon + Key */}
        <div className="flex w-52 flex-shrink-0 items-center gap-2 px-3 py-2.5">
          {isEditing ? (
            <IconPicker value={editIcon} onChange={setEditIcon} />
          ) : (
            <>
              <Icon size={15} className="flex-shrink-0 text-mint" />
              <span className="truncate font-mono text-[13px] text-ink/50">
                {feature._id}
              </span>
            </>
          )}
        </div>

        {/* Track column (formats only) */}
        {!isTrack && (
          <div className="w-44 flex-shrink-0 px-3 py-2.5 text-[13px] text-ink/50">
            {isEditing ? (
              <select
                value={editParentTrack}
                onChange={(e) => setEditParentTrack(e.target.value)}
                className="w-full cursor-pointer rounded-md border border-ink/15 bg-white px-2 py-1 text-[13px] font-dm text-ink outline-none focus:border-mint"
              >
                <option value="">— select track —</option>
                {tracks.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title}
                  </option>
                ))}
              </select>
            ) : (
              <span className="truncate">
                {parentTrackTitle || feature.parent_track || "—"}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <div className="flex min-w-[100px] flex-1 items-center px-3 py-2.5">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancelEdit();
              }}
              autoFocus
              className="w-full rounded-md border border-ink/15 bg-white px-3 py-1.5 text-sm font-dm text-ink outline-none transition-colors focus:border-mint"
            />
          ) : (
            <span className="flex items-center gap-2">
              {feature.title}
              {feature.killed && (
                <span className="flex-shrink-0 rounded bg-coral px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider text-white">
                  KILLED
                </span>
              )}
            </span>
          )}
        </div>

        {/* Description */}
        <div className="flex min-w-[100px] flex-1 items-center px-3 py-2.5">
          {isEditing ? (
            <input
              type="text"
              value={editSubtitle}
              onChange={(e) => setEditSubtitle(e.target.value)}
              placeholder="Description…"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancelEdit();
              }}
              className="w-full rounded-md border border-ink/15 bg-white px-3 py-1.5 text-sm font-dm text-ink outline-none transition-colors focus:border-mint"
            />
          ) : (
            <span
              className={`truncate text-[13px] ${
                feature.subtitle ? "text-ink/50" : "text-ink/30"
              }`}
            >
              {feature.subtitle || "—"}
            </span>
          )}
        </div>

        {/* Href (tracks only) */}
        {isTrack && (
          <div className="w-40 flex-shrink-0 px-3 py-2.5">
            {isEditing ? (
              <input
                type="text"
                value={editHref}
                onChange={(e) => setEditHref(e.target.value)}
                placeholder="/onboarding/…"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") handleCancelEdit();
                }}
                className="w-full rounded-md border border-ink/15 bg-white px-3 py-1.5 font-mono text-xs text-ink outline-none transition-colors focus:border-mint"
              />
            ) : (
              <span
                className={`truncate font-mono text-xs ${
                  feature.href ? "text-ink/50" : "text-ink/30"
                }`}
              >
                {feature.href || "—"}
              </span>
            )}
          </div>
        )}

        {/* Available checkbox */}
        <div className="flex w-28 flex-shrink-0 items-center justify-center px-3 py-2.5">
          <input
            type="checkbox"
            checked={feature.enabled}
            onChange={handleCheckboxClick}
            disabled={feature.killed || !canWrite}
            className={`h-4 w-4 accent-mint ${
              feature.killed || !canWrite
                ? "cursor-not-allowed opacity-40"
                : "cursor-pointer"
            }`}
          />
        </div>

        {/* Actions */}
        <div className="flex w-40 flex-shrink-0 items-center justify-end gap-3 px-4 py-2.5">
          {isEditing ? (
            <>
              <ActionLink
                onClick={handleSave}
                disabled={saving || !editTitle.trim()}
              >
                {saving ? "Saving…" : "Save"}
              </ActionLink>
              <ActionLink onClick={handleCancelEdit}>Cancel</ActionLink>
            </>
          ) : (
            <>
              {canWrite && <ActionLink onClick={handleStartEdit}>Edit</ActionLink>}
              {canWrite &&
                (feature.killed ? (
                  <button
                    onClick={handleRestore}
                    className="rounded bg-mint px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-mint-hover"
                  >
                    Restore
                  </button>
                ) : (
                  <button
                    onClick={() => setShowKillModal(true)}
                    className="rounded bg-coral px-2.5 py-1 text-xs font-medium text-white transition-colors hover:brightness-110"
                  >
                    Kill
                  </button>
                ))}
            </>
          )}
        </div>
      </div>

      {/* Kill confirm modal */}
      {showKillModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowKillModal(false);
              setKillReason("");
              setKillError("");
            }
          }}
        >
          <div className="w-[90%] max-w-[400px] rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-1 text-base font-semibold text-ink">
              Kill &ldquo;{feature.title}&rdquo;?
            </h3>
            <p className="mb-4 text-[13px] text-ink/50">
              This will immediately hide the feature for all users. You can
              restore it later.
            </p>
            <label className="mb-1.5 block text-[13px] font-medium text-ink">
              Reason <span className="text-coral">*</span>
            </label>
            <input
              type="text"
              value={killReason}
              onChange={(e) => {
                setKillReason(e.target.value);
                setKillError("");
              }}
              placeholder="e.g. Breaking bug in production"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleKill();
                if (e.key === "Escape") {
                  setShowKillModal(false);
                  setKillReason("");
                  setKillError("");
                }
              }}
              className={`mb-2 w-full rounded-md border bg-white px-3 py-2 text-sm font-dm text-ink outline-none transition-colors focus:border-mint ${
                killError ? "border-coral" : "border-ink/15"
              }`}
            />
            {killError && (
              <p className="mb-3 text-xs text-coral">{killError}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowKillModal(false);
                  setKillReason("");
                  setKillError("");
                }}
                className="rounded-md border border-ink/15 bg-white px-4 py-2 text-[13px] font-dm text-ink transition-colors hover:bg-sand"
              >
                Cancel
              </button>
              <button
                onClick={handleKill}
                className="rounded-md bg-coral px-4 py-2 text-[13px] font-medium text-white transition-colors hover:brightness-110"
              >
                Kill Feature
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ActionLink({
  children,
  onClick,
  variant = "mint",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "mint" | "coral";
  disabled?: boolean;
}) {
  return (
    <span
      onClick={disabled ? undefined : onClick}
      className={`whitespace-nowrap text-[13px] font-medium select-none transition-colors ${
        disabled
          ? "cursor-default text-ink/30"
          : variant === "coral"
            ? "cursor-pointer text-coral hover:brightness-110"
            : "cursor-pointer text-mint hover:text-mint-hover"
      }`}
    >
      {children}
    </span>
  );
}