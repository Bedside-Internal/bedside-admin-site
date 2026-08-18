"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import * as api from "@/lib/api/pricing";
import type { AdminPricingTier, CreatePricingTierInput, CreateFeatureInput, CreateBillingCycleInput } from "@/types/marketing";

export function usePricingTiers() {
    const { getToken } = useAuth();
    const [items, setItems] = useState<AdminPricingTier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const all = await api.listPricingTiers(token);
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

    const replaceTier = (updated: AdminPricingTier) =>
        setItems((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

    const add = useCallback(
        async (input: CreatePricingTierInput) => {
            const token = await getToken();
            await api.createPricingTier(token, input);
            await refetch();
        },
        [getToken, refetch]
    );

    const update = useCallback(
        async (id: string, input: Partial<CreatePricingTierInput>) => {
            const token = await getToken();
            replaceTier(await api.updatePricingTier(token, id, input));
        },
        [getToken]
    );

    const remove = useCallback(
        async (id: string) => {
            const token = await getToken();
            await api.deletePricingTier(token, id);
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
                await api.reorderPricingTiers(token, [
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

    const addFeature = useCallback(
        async (id: string, input: CreateFeatureInput) => {
            const token = await getToken();
            replaceTier(await api.addFeature(token, id, input));
        },
        [getToken]
    );

    const updateFeature = useCallback(
        async (id: string, featureId: string, input: Partial<CreateFeatureInput>) => {
            const token = await getToken();
            replaceTier(await api.updateFeature(token, id, featureId, input));
        },
        [getToken]
    );

    const removeFeature = useCallback(
        async (id: string, featureId: string) => {
            const token = await getToken();
            replaceTier(await api.deleteFeature(token, id, featureId));
        },
        [getToken]
    );

    const addBillingCycle = useCallback(
        async (id: string, input: CreateBillingCycleInput) => {
            const token = await getToken();
            replaceTier(await api.addBillingCycle(token, id, input));
        },
        [getToken]
    );

    const updateBillingCycle = useCallback(
        async (id: string, cycleId: string, input: Partial<CreateBillingCycleInput>) => {
            const token = await getToken();
            replaceTier(await api.updateBillingCycle(token, id, cycleId, input));
        },
        [getToken]
    );

    const removeBillingCycle = useCallback(
        async (id: string, cycleId: string) => {
            const token = await getToken();
            replaceTier(await api.deleteBillingCycle(token, id, cycleId));
        },
        [getToken]
    );

    return {
        items, loading, error, clearError: () => setError(null),
        add, update, remove, move,
        addFeature, updateFeature, removeFeature,
        addBillingCycle, updateBillingCycle, removeBillingCycle,
    };
}