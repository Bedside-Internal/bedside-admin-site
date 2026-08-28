"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { listReferrals, voidReferral } from "@/lib/api/referrals";
import type { AdminReferral, VoidReferralInput } from "@/types/marketing";

export function useReferrals() {
    const { getToken } = useAuth();
    const [items, setItems] = useState<AdminReferral[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Tracks which row has a void in flight, so only that row's button
    // shows a busy state rather than freezing the whole table.
    const [pendingActionId, setPendingActionId] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            setItems(await listReferrals(token));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load referrals");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    const voidOne = useCallback(
        async (id: string, input?: VoidReferralInput) => {
            setPendingActionId(id);
            try {
                const token = await getToken();
                await voidReferral(token, id, input);
                // Reflect the void locally instead of a full refetch —
                // keeps the table from flashing, matches useTestimonialSubmissions.
                setItems((prev) =>
                    prev.map((r) =>
                        r.id === id ? { ...r, voidedAt: new Date().toISOString(), voidedReason: input?.reason ?? null } : r,
                    ),
                );
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to void referral");
            } finally {
                setPendingActionId(null);
            }
        },
        [getToken],
    );

    return {
        items,
        loading,
        error,
        clearError: () => setError(null),
        pendingActionId,
        voidOne,
    };
}