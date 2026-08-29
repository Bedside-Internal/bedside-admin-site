"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
    listSocialLinks,
    createSocialLink,
    updateSocialLink,
    deleteSocialLink,
    reorderSocialLinks,
} from "@/lib/api/socialLinks";
import type { AdminSocialLink, CreateSocialLinkInput } from "@/types/marketing";

export function useSocialLinks() {
    const { getToken } = useAuth();
    const [items, setItems] = useState<AdminSocialLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const all = await listSocialLinks(token);
            setItems(all.sort((a, b) => a.sortOrder - b.sortOrder));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    const add = useCallback(
        async (input: CreateSocialLinkInput) => {
            try {
                const token = await getToken();
                await createSocialLink(token, input);
                await refetch();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to add link");
            }
        },
        [getToken, refetch],
    );

    const update = useCallback(
        async (id: string, input: Partial<CreateSocialLinkInput>) => {
            try {
                const token = await getToken();
                await updateSocialLink(token, id, input);
                await refetch();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to update link");
            }
        },
        [getToken, refetch],
    );

    const remove = useCallback(
        async (id: string) => {
            try {
                const token = await getToken();
                await deleteSocialLink(token, id);
                await refetch();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to delete link");
            }
        },
        [getToken, refetch],
    );

    const move = useCallback(
        async (id: string, direction: "up" | "down") => {
            const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
            const idx = sorted.findIndex((i) => i.id === id);
            const swapWith = direction === "up" ? idx - 1 : idx + 1;
            if (idx === -1 || swapWith < 0 || swapWith >= sorted.length) return;

            const a = sorted[idx];
            const b = sorted[swapWith];
            const reordered = [...sorted];
            [reordered[idx], reordered[swapWith]] = [reordered[swapWith], reordered[idx]];
            setItems(reordered); // optimistic

            try {
                const token = await getToken();
                await reorderSocialLinks(token, [
                    { id: a.id, sortOrder: b.sortOrder },
                    { id: b.id, sortOrder: a.sortOrder },
                ]);
                await refetch();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to reorder");
                await refetch();
            }
        },
        [items, getToken, refetch],
    );

    const clearError = useCallback(() => setError(null), []);

    return { items, loading, error, clearError, refetch, add, update, remove, move };
}