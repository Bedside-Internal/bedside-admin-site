"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
    listTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    reorderTestimonials,
} from "@/lib/api/testimonials";
import type {
    AdminTestimonial,
    CreateTestimonialInput,
} from "@/types/marketing";

export function useTestimonials() {
    const { getToken } = useAuth();
    const [items, setItems] = useState<AdminTestimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const all = await listTestimonials(token);
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
        async (input: CreateTestimonialInput) => {
            const token = await getToken();
            await createTestimonial(token, input);
            await refetch();
        },
        [getToken, refetch]
    );

    const update = useCallback(
        async (id: string, input: Partial<CreateTestimonialInput>) => {
            const token = await getToken();
            await updateTestimonial(token, id, input);
            await refetch();
        },
        [getToken, refetch]
    );

    const remove = useCallback(
        async (id: string) => {
            const token = await getToken();
            await deleteTestimonial(token, id);
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
                await reorderTestimonials(token, [
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

    return {
        items,
        loading,
        error,
        clearError: () => setError(null),
        add,
        update,
        remove,
        move,
    };
}