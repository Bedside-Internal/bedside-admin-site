"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
    listShareRequests,
    approveShareRequest,
    rejectShareRequest,
    type ShareRequest,
} from "@/lib/api/userQuestions";

export function useShareRequests() {
    const { getToken } = useAuth();
    const [items, setItems] = useState<ShareRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pendingActionId, setPendingActionId] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            setItems(await listShareRequests(token));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load share requests");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    const approve = useCallback(
        async (id: string) => {
            setPendingActionId(id);
            try {
                const token = await getToken();
                await approveShareRequest(token, id);
                setItems((prev) => prev.filter((item) => item.id !== id));
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to approve share request");
            } finally {
                setPendingActionId(null);
            }
        },
        [getToken],
    );

    const reject = useCallback(
        async (id: string) => {
            setPendingActionId(id);
            try {
                const token = await getToken();
                await rejectShareRequest(token, id);
                setItems((prev) => prev.filter((item) => item.id !== id));
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to reject share request");
            } finally {
                setPendingActionId(null);
            }
        },
        [getToken],
    );

    return { items, loading, error, clearError: () => setError(null), pendingActionId, approve, reject, refetch };
}