"use client";

import { useState } from "react";
import { Plus, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useSocialLinks } from "@/hooks/useSocialLinks";
import { SocialIcon, PLATFORM_LABELS } from "@/components/layout/SocialIcon";
import type { AdminSocialLink, SocialPlatform } from "@/types/marketing";

const PLATFORMS: SocialPlatform[] = [
    "instagram", "x", "discord", "tiktok", "youtube", "linkedin", "facebook", "mail", "custom",
];

export default function SocialLinksContent() {
    const { can } = useAdminPermissions();
    const { items, loading, error, clearError, add, update, remove, move } = useSocialLinks();

    const canWrite = can("marketing", "write");
    const canDelete = can("marketing", "delete");

    const [newPlatform, setNewPlatform] = useState<SocialPlatform>("instagram");
    const [newUrl, setNewUrl] = useState("");
    const [newLabel, setNewLabel] = useState("");

    const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

    const handleAdd = async () => {
        if (!newUrl.trim()) return;
        await add({
            platform: newPlatform,
            url: newUrl.trim(),
            label: newPlatform === "custom" ? newLabel.trim() : newLabel.trim() || undefined,
            enabled: true,
        });
        setNewUrl("");
        setNewLabel("");
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
                    Social links
                </span>
                <span className="text-[13px] text-ink/40">
                    {items.length} link{items.length !== 1 ? "s" : ""}
                </span>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-14 animate-pulse rounded-lg border border-ink/10 bg-ink/5" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-lg border border-ink/10 bg-white px-3 py-8 text-center text-[13px] text-ink/30">
                    No social links yet — add one to show it in the footer.
                </div>
            ) : (
                <div className="space-y-2">
                    {sorted.map((link, i) => (
                        <SocialLinkRow
                            key={link.id}
                            link={link}
                            canWrite={canWrite}
                            canDelete={canDelete}
                            isFirst={i === 0}
                            isLast={i === sorted.length - 1}
                            onUpdate={(patch) => update(link.id, patch)}
                            onDelete={() => remove(link.id)}
                            onMoveUp={() => move(link.id, "up")}
                            onMoveDown={() => move(link.id, "down")}
                        />
                    ))}
                </div>
            )}

            {canWrite && (
                <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-ink/15 p-3">
                    <select
                        value={newPlatform}
                        onChange={(e) => setNewPlatform(e.target.value as SocialPlatform)}
                        className="rounded-md border border-ink/10 bg-sand/60 px-2 py-1.5 text-sm"
                    >
                        {PLATFORMS.map((p) => (
                            <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder={newPlatform === "mail" ? "mailto:hello@bedside.win" : "https://instagram.com/bedside"}
                        className="min-w-[220px] flex-1 rounded-md border border-ink/10 bg-sand/60 px-2 py-1.5 text-sm placeholder:text-ink/30"
                    />
                    {newPlatform === "custom" && (
                        <input
                            type="text"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            placeholder="Label (required)"
                            className="w-40 rounded-md border border-ink/10 bg-sand/60 px-2 py-1.5 text-sm placeholder:text-ink/30"
                        />
                    )}
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={!newUrl.trim() || (newPlatform === "custom" && !newLabel.trim())}
                        className="flex items-center gap-1 rounded-md bg-mint px-3 py-1.5 text-sm font-semibold text-ink transition hover:bg-mint-hover disabled:opacity-40"
                    >
                        <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                </div>
            )}
        </>
    );
}

function SocialLinkRow({
    link, canWrite, canDelete, isFirst, isLast, onUpdate, onDelete, onMoveUp, onMoveDown,
}: {
    link: AdminSocialLink;
    canWrite: boolean;
    canDelete: boolean;
    isFirst: boolean;
    isLast: boolean;
    onUpdate: (patch: Partial<AdminSocialLink>) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-ink/10 bg-white px-3 py-2.5">
            <div className="flex flex-col">
                <button type="button" onClick={onMoveUp} disabled={isFirst} className="text-ink/30 hover:text-ink disabled:opacity-20">
                    <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={onMoveDown} disabled={isLast} className="text-ink/30 hover:text-ink disabled:opacity-20">
                    <ChevronDown className="h-3.5 w-3.5" />
                </button>
            </div>

            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink/70">
                <SocialIcon platform={link.platform} />
            </div>

            <div className="min-w-[100px] text-sm font-medium text-ink/70">
                {PLATFORM_LABELS[link.platform]}
            </div>

            <input
                type="text"
                defaultValue={link.url}
                disabled={!canWrite}
                onBlur={(e) => e.target.value !== link.url && onUpdate({ url: e.target.value })}
                className="min-w-[160px] flex-1 rounded-md border border-transparent bg-sand/40 px-2 py-1 text-sm focus:border-violet/40 focus:outline-none disabled:opacity-50"
            />

            <label className="flex items-center gap-1.5 text-xs text-ink/60">
                <input
                    type="checkbox"
                    checked={link.enabled}
                    disabled={!canWrite}
                    onChange={(e) => onUpdate({ enabled: e.target.checked })}
                />
                Enabled
            </label>

            {canDelete && (
                <button type="button" onClick={onDelete} className="text-coral/60 hover:text-coral">
                    <Trash2 className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}