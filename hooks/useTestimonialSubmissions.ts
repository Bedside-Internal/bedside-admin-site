"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
    listTestimonialSubmissions,
    approveTestimonialSubmission,
    rejectTestimonialSubmission,
} from "@/lib/api/testimonialSubmissions";
import type {
    TestimonialSubmissionAdmin,
    ApproveTestimonialSubmissionInput,
    RejectTestimonialSubmissionInput,
} from "@/types/marketing";

export function useTestimonialSubmissions() {
    const { getToken } = useAuth();
    const [items, setItems] = useState<TestimonialSubmissionAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Tracks which row has an approve/reject in flight, so only that row's
    // buttons show a busy state rather than freezing the whole table.
    const [pendingActionId, setPendingActionId] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            setItems(await listTestimonialSubmissions(token));
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
        async (id: string, input?: ApproveTestimonialSubmissionInput) => {
            setPendingActionId(id);
            try {
                const token = await getToken();
                await approveTestimonialSubmission(token, id, input);
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
        async (id: string, input?: RejectTestimonialSubmissionInput) => {
            setPendingActionId(id);
            try {
                const token = await getToken();
                await rejectTestimonialSubmission(token, id, input);
                // Rejected submissions are hard-deleted server-side — same
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