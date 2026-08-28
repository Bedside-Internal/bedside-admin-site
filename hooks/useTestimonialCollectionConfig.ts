"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
    getTestimonialCollectionConfig,
    updateTestimonialCollectionConfig,
} from "@/lib/api/testimonialConfig";
import type { TestimonialCollectionConfig, UpdateTestimonialCollectionConfigInput } from "@/types/marketing";

export function useTestimonialCollectionConfig() {
    const { getToken } = useAuth();
    const [config, setConfig] = useState<TestimonialCollectionConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            setConfig(await getTestimonialCollectionConfig(token));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load config");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    const update = useCallback(
        async (input: UpdateTestimonialCollectionConfigInput) => {
            setSaving(true);
            setError(null);
            try {
                const token = await getToken();
                setConfig(await updateTestimonialCollectionConfig(token, input));
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to update config");
            } finally {
                setSaving(false);
            }
        },
        [getToken],
    );

    return { config, loading, saving, error, clearError: () => setError(null), update };
}