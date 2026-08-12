"use client";

import { useFeatures } from "./useFeatures";
import { FeatureSection } from "./FeatureSection";
import type { UpsertFeatureInput } from "@/types/admin";

interface FeaturesContentProps {
  canWrite: boolean;
  canDelete: boolean;
}

export default function FeaturesContent({
  canWrite,
  canDelete,
}: FeaturesContentProps) {
  const {
    tracks,
    formats,
    loading,
    error,
    clearError,
    upsert,
    remove,
    kill,
    restore,
    reorder,
    toggleEnabled,
  } = useFeatures();

  const handleAdd = async (data: {
    key: string;
    type: "track" | "format";
    title: string;
    subtitle: string;
    icon: string;
    href: string | null;
    parent_track: string | null;
    enabled: boolean;
  }) => {
    const input: UpsertFeatureInput = {
      type: data.type,
      title: data.title,
      subtitle: data.subtitle || undefined,
      icon: data.icon || undefined,
      href: data.href ?? undefined,
      parent_track: data.parent_track ?? undefined,
      enabled: data.enabled,
    };
    await upsert(data.key, input);
  };

  return (
    <div className="space-y-10">
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="ml-4 flex-shrink-0 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      <FeatureSection
        label="Tracks"
        type="track"
        features={tracks}
        tracks={tracks}
        loading={loading}
        canWrite={canWrite}
        canDelete={canDelete}
        onToggleEnabled={toggleEnabled}
        onSave={upsert}
        onDelete={remove}
        onKill={kill}
        onRestore={restore}
        onReorder={reorder}
        onAdd={handleAdd}
      />

      <FeatureSection
        label="Formats"
        type="format"
        features={formats}
        tracks={tracks}
        loading={loading}
        canWrite={canWrite}
        canDelete={canDelete}
        onToggleEnabled={toggleEnabled}
        onSave={upsert}
        onDelete={remove}
        onKill={kill}
        onRestore={restore}
        onReorder={reorder}
        onAdd={handleAdd}
      />
    </div>
  );
}