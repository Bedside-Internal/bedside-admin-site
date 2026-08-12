"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import type { AiModel, AiCredits, AiGenerateQuestionResponse } from "@/types/content";
import * as api from "@/lib/api/ai";

interface AiState {
    models: AiModel[];
    credits: AiCredits | null;
    loading: boolean;
    generating: boolean;
    error: string | null;
    draft: AiGenerateQuestionResponse | null;
}

export function useAiGeneration() {
    const { getToken } = useAuth();
    const [state, setState] = useState<AiState>({
        models: [],
        credits: null,
        loading: false,
        generating: false,
        error: null,
        draft: null,
    });

    const dismissError = useCallback(
        () => setState((s) => ({ ...s, error: null })),
        [],
    );

    const tk = useCallback(async () => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        return token;
    }, [getToken]);

    const fetchModels = useCallback(async () => {
        setState((s) => ({ ...s, loading: true, error: null }));
        try {
            const token = await tk();
            const models = await api.getModels(token);
            setState((s) => ({ ...s, models, loading: false }));
        } catch (err: any) {
            setState((s) => ({
                ...s,
                loading: false,
                error: err?.message || "Failed to load AI models",
            }));
        }
    }, [tk]);

    const fetchCredits = useCallback(async () => {
        try {
            const token = await tk();
            const credits = await api.getCredits(token);
            setState((s) => ({ ...s, credits }));
        } catch {
            // Credits failure is non-critical — suppress
        }
    }, [tk]);

    const generate = useCallback(
        async (data: {
            sectionId: string;
            difficulty: string;
            model: string;
            topic: string;
        }) => {
            setState((s) => ({ ...s, generating: true, error: null, draft: null }));
            try {
                const token = await tk();
                const draft = await api.generateQuestion(token, data);
                setState((s) => ({ ...s, generating: false, draft }));
                return draft;
            } catch (err: any) {
                setState((s) => ({
                    ...s,
                    generating: false,
                    error: err?.message || "Failed to generate question",
                }));
                throw err;
            }
        },
        [tk],
    );

    const clearDraft = useCallback(() => {
        setState((s) => ({ ...s, draft: null }));
    }, []);

    return {
        ...state,
        dismissError,
        fetchModels,
        fetchCredits,
        generate,
        clearDraft,
    };
}