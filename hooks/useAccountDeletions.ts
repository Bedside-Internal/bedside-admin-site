"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { listAccountDeletions, restoreAccountDeletion } from "@/lib/api/accountDeletions";
import type { AccountDeletion } from "@/types/user";

export function useAccountDeletions() {
    const { getToken } = useAuth();
    const [items, setItems] = useState<AccountDeletion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pendingActionId, setPendingActionId] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            setItems(await listAccountDeletions(token, "pending"));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load account deletions");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    const restore = useCallback(
        async (id: string, newClerkId: string) => {
            setPendingActionId(id);
            setError(null);
            try {
                const token = await getToken();
                await restoreAccountDeletion(token, id, { newClerkId });
                // Restored rows leave the pending list — drop locally, same
                // pattern as useTestimonialSubmissions' approve/reject.
                setItems((prev) => prev.filter((item) => item.id !== id));
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to restore account");
            } finally {
                setPendingActionId(null);
            }
        },
        [getToken],
    );

    return { items, loading, error, clearError: () => setError(null), pendingActionId, restore, refetch };
}