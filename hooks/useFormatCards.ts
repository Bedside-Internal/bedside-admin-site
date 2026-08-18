"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
    listFormatCards,
    createFormatCard,
    updateFormatCard,
    deleteFormatCard,
    reorderFormatCards,
} from "@/lib/api/formatCards";
import type { AdminFormatCard, CreateFormatCardInput } from "@/types/marketing";

export function useFormatCards() {
    const { getToken } = useAuth();
    const [items, setItems] = useState<AdminFormatCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const all = await listFormatCards(token);
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
        async (input: CreateFormatCardInput) => {
            const token = await getToken();
            await createFormatCard(token, input);
            await refetch();
        },
        [getToken, refetch]
    );

    const update = useCallback(
        async (id: string, input: Partial<CreateFormatCardInput>) => {
            const token = await getToken();
            await updateFormatCard(token, id, input);
            await refetch();
        },
        [getToken, refetch]
    );

    const remove = useCallback(
        async (id: string) => {
            const token = await getToken();
            await deleteFormatCard(token, id);
            await refetch();
        },
        [getToken, refetch]
    );

    const move = useCallback(
        async (id: string, direction: "up" | "down") => {
            const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
            const idx = sorted.findIndex((i) => i.id === id);
            const swapIdx = direction === "up" ? idx - 1 : idx + 1;
            if (swapIdx < 0 || swapIdx >= sorted.length) return;

            const a = sorted[idx];
            const b = sorted[swapIdx];

            setItems((prev) =>
                prev.map((item) => {
                    if (item.id === a.id) return { ...item, sortOrder: b.sortOrder };
                    if (item.id === b.id) return { ...item, sortOrder: a.sortOrder };
                    return item;
                })
            );

            try {
                const token = await getToken();
                await reorderFormatCards(token, [
                    { id: a.id, sortOrder: b.sortOrder },
                    { id: b.id, sortOrder: a.sortOrder },
                ]);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to reorder");
                refetch();
            }
        },
        [items, getToken, refetch]
    );

    return { items, loading, error, clearError: () => setError(null), add, update, remove, move };
}