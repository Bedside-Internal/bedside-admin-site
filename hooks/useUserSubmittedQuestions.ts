"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
    listUserSubmittedQuestions,
    approveUserSubmittedQuestion,
    rejectUserSubmittedQuestion,
} from "@/lib/api/userQuestions";
import type {
    UserSubmittedQuestionAdmin,
    ApproveUserQuestionInput,
    RejectUserQuestionInput,
} from "@/types/marketing";

export function useUserSubmittedQuestions() {
    const { getToken } = useAuth();
    const [items, setItems] = useState<UserSubmittedQuestionAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pendingActionId, setPendingActionId] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            setItems(await listUserSubmittedQuestions(token));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load submissions");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    const approve = useCallback(
        async (id: string, input?: ApproveUserQuestionInput) => {
            setPendingActionId(id);
            try {
                const token = await getToken();
                await approveUserSubmittedQuestion(token, id, input);
                // Approved rows leave the pending queue — drop it locally
                // instead of a full refetch, keeps the table from flashing.
                setItems((prev) => prev.filter((item) => item.id !== id));
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to approve submission");
            } finally {
                setPendingActionId(null);
            }
        },
        [getToken],
    );

    const reject = useCallback(
        async (id: string, input?: RejectUserQuestionInput) => {
            setPendingActionId(id);
            try {
                const token = await getToken();
                await rejectUserSubmittedQuestion(token, id, input);
                // Rejected submissions are soft-deleted server-side — same
                // local removal as approve, nothing left to refetch anyway.
                setItems((prev) => prev.filter((item) => item.id !== id));
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to reject submission");
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
        approve,
        reject,
        refetch,
    };
}