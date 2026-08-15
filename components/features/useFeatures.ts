"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  listFeatures,
  upsertFeature,
  deleteFeature,
  killFeature,
  restoreFeature,
  reorderFeatures,
} from "@/lib/api/admin";
import type { AdminFeature, UpsertFeatureInput, FeatureType } from "@/types/admin";

export function useFeatures() {
  const { getToken } = useAuth();
  const [tracks, setTracks] = useState<AdminFeature[]>([]);
  const [formats, setFormats] = useState<AdminFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const all = await listFeatures(token);
      setTracks(
        all.filter((f) => f.type === "track").sort((a, b) => a.order - b.order),
      );
      setFormats(
        all.filter((f) => f.type === "format").sort((a, b) => a.order - b.order),
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load features",
      );
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const upsert = useCallback(
    async (key: string, data: UpsertFeatureInput): Promise<AdminFeature> => {
      const token = await getToken();
      const result = await upsertFeature(token, key, data);
      await refetch();
      return result;
    },
    [getToken, refetch],
  );

  const remove = useCallback(
    async (key: string): Promise<void> => {
      const token = await getToken();
      await deleteFeature(token, key);
      await refetch();
    },
    [getToken, refetch],
  );

  const kill = useCallback(
    async (key: string, reason: string): Promise<AdminFeature> => {
      const token = await getToken();
      const result = await killFeature(token, key, reason);
      await refetch();
      return result;
    },
    [getToken, refetch],
  );

  const restore = useCallback(
    async (key: string): Promise<AdminFeature> => {
      const token = await getToken();
      const result = await restoreFeature(token, key);
      await refetch();
      return result;
    },
    [getToken, refetch],
  );

  const reorder = useCallback(
    async (type: FeatureType, reorderedFeatures: AdminFeature[]) => {
      const prevTracks = [...tracks];
      const prevFormats = [...formats];

      // Optimistic update
      if (type === "track") {
        setTracks(reorderedFeatures);
      } else {
        setFormats(reorderedFeatures);
      }

      const items = reorderedFeatures.map((f, i) => ({
        key: f._id,
        order: i,
      }));

      try {
        const token = await getToken();
        const result = await reorderFeatures(token, items);
        if (type === "track") {
          setTracks(result.sort((a, b) => a.order - b.order));
        } else {
          setFormats(result.sort((a, b) => a.order - b.order));
        }
      } catch (err) {
        setTracks(prevTracks);
        setFormats(prevFormats);
        setError(err instanceof Error ? err.message : "Reorder failed");
        throw err;
      }
    },
    [getToken, tracks, formats],
  );

  const toggleEnabled = useCallback(
    async (feature: AdminFeature) => {
      const newEnabled = !feature.enabled;

      // Optimistic toggle
      if (feature.type === "track") {
        setTracks((prev) =>
          prev.map((f) =>
            f._id === feature._id ? { ...f, enabled: newEnabled } : f,
          ),
        );
      } else {
        setFormats((prev) =>
          prev.map((f) =>
            f._id === feature._id ? { ...f, enabled: newEnabled } : f,
          ),
        );
      }

      try {
        const token = await getToken();
        await upsertFeature(token, feature._id, {
          type: feature.type,
          parent_track: feature.parent_track,
          order: feature.order,
          icon: feature.icon,
          title: feature.title,
          subtitle: feature.subtitle,
          href: feature.href,
          enabled: newEnabled,
        });
        await refetch();
      } catch (err) {
        // Revert
        if (feature.type === "track") {
          setTracks((prev) =>
            prev.map((f) =>
              f._id === feature._id
                ? { ...f, enabled: feature.enabled }
                : f,
            ),
          );
        } else {
          setFormats((prev) =>
            prev.map((f) =>
              f._id === feature._id
                ? { ...f, enabled: feature.enabled }
                : f,
            ),
          );
        }
        setError(
          err instanceof Error
            ? err.message
            : "Failed to update availability",
        );
      }
    },
    [getToken, refetch],
  );

  return {
    tracks,
    formats,
    loading,
    error,
    clearError: () => setError(null),
    upsert,
    kill,
    restore,
    reorder,
    toggleEnabled,
  };
}