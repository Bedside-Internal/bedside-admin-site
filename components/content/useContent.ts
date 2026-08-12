"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import type {
    Format,
    Dimension,
    Section,
    QuestionListItem,
    CreateQuestionInput,
} from "@/types/content";
import * as api from "@/lib/api/content";

interface ContentState {
    formats: Format[];
    dimensions: Dimension[];
    sections: Section[];
    questions: QuestionListItem[];
    loading: boolean;
    error: string | null;
}

export function useContent() {
    const { getToken } = useAuth();
    const [state, setState] = useState<ContentState>({
        formats: [],
        dimensions: [],
        sections: [],
        questions: [],
        loading: true,
        error: null,
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

    /* ── Fetch reference data (formats, dimensions, sections) ── */

    const fetchAll = useCallback(async () => {
        setState((s) => ({ ...s, loading: true, error: null }));
        try {
            const token = await tk();
            const [formats, dimensions, sections] = await Promise.all([
                api.getFormats(token, true),
                api.getDimensions(token, undefined, true),
                api.getSections(token, undefined, true),
            ]);
            setState((s) => ({
                ...s,
                formats,
                dimensions,
                sections,
                loading: false,
            }));
        } catch (err: any) {
            setState((s) => ({
                ...s,
                loading: false,
                error: err?.message || "Failed to load content",
            }));
        }
    }, [tk]);

    /* ── Fetch questions (called on mount + filter change) ── */

    const fetchQuestions = useCallback(
        async (filters?: {
            formatSlug?: string;
            sectionSlug?: string;
            difficulty?: string;
            isActive?: boolean;
        }) => {
            try {
                const token = await tk();
                const questions = await api.getQuestions(token, filters);
                setState((s) => ({ ...s, questions }));
            } catch (err: any) {
                setState((s) => ({
                    ...s,
                    error: err?.message || "Failed to load questions",
                }));
            }
        },
        [tk],
    );

    /* Formats CRUD  */

    const upsertFormat = useCallback(
        async (data: {
            id?: string;
            slug: string;
            title: string;
            subtitle?: string;
            iconKey?: string;
            trackId?: string;
        }) => {
            try {
                const token = await tk();
                const result = data.id
                    ? await api.patchFormat(token, data.id, data)
                    : await api.createFormat(token, data);
                setState((s) => {
                    const idx = s.formats.findIndex((f) => f.id === result.id);
                    const next =
                        idx >= 0
                            ? s.formats.map((f) => (f.id === result.id ? result : f))
                            : [...s.formats, result];
                    return { ...s, formats: next };
                });
                return result;
            } catch (err: any) {
                setState((s) => ({
                    ...s,
                    error: err?.message || "Failed to save format",
                }));
                throw err;
            }
        },
        [tk],
    );

    const killFormat = useCallback(
        async (id: string, reason: string) => {
            try {
                const token = await tk();
                const result = await api.killFormat(token, id, reason);
                setState((s) => ({
                    ...s,
                    formats: s.formats.map((f) => (f.id === id ? result : f)),
                }));
            } catch (err: any) {
                setState((s) => ({
                    ...s,
                    error: err?.message || "Failed to delete format",
                }));
                throw err;
            }
        },
        [tk],
    );

    const restoreFormat = useCallback(
        async (id: string) => {
            try {
                const token = await tk();
                const result = await api.restoreFormat(token, id);
                setState((s) => ({
                    ...s,
                    formats: s.formats.map((f) => (f.id === id ? result : f)),
                }));
            } catch (err: any) {
                setState((s) => ({
                    ...s,
                    error: err?.message || "Failed to restore format",
                }));
                throw err;
            }
        },
        [tk],
    );

    /* Dimensions CRUD */

    const upsertDimension = useCallback(
        async (data: {
            id?: string;
            formatId: string;
            label: string;
            slug: string;
            subtitle?: string;
            iconKey?: string;
            sortOrder?: number;
        }) => {
            try {
                const token = await tk();
                const result = data.id
                    ? await api.patchDimension(token, data.id, data)
                    : await api.createDimension(token, data);
                setState((s) => {
                    const idx = s.dimensions.findIndex((d) => d.id === result.id);
                    const next =
                        idx >= 0
                            ? s.dimensions.map((d) => (d.id === result.id ? result : d))
                            : [...s.dimensions, result];
                    return { ...s, dimensions: next };
                });
                return result;
            } catch (err: any) {
                setState((s) => ({
                    ...s,
                    error: err?.message || "Failed to save dimension",
                }));
                throw err;
            }
        },
        [tk],
    );

    const killDimension = useCallback(
        async (id: string, reason: string) => {
            try {
                const token = await tk();
                const result = await api.killDimension(token, id, reason);
                setState((s) => ({
                    ...s,
                    dimensions: s.dimensions.map((d) =>
                        d.id === id ? result : d,
                    ),
                }));
            } catch (err: any) {
                setState((s) => ({
                    ...s,
                    error: err?.message || "Failed to delete dimension",
                }));
                throw err;
            }
        },
        [tk],
    );

    const restoreDimension = useCallback(
        async (id: string) => {
            try {
                const token = await tk();
                const result = await api.restoreDimension(token, id);
                setState((s) => ({
                    ...s,
                    dimensions: s.dimensions.map((d) =>
                        d.id === id ? result : d,
                    ),
                }));
            } catch (err: any) {
                setState((s) => ({
                    ...s,
                    error: err?.message || "Failed to restore dimension",
                }));
                throw err;
            }
        },
        [tk],
    );

    /* Sections CRUD */

    const upsertSection = useCallback(
        async (data: {
            id?: string;
            formatId: string;
            dimensionId?: string;
            title: string;
            slug: string;
            subtitle?: string;
            iconKey?: string;
            sortOrder?: number;
        }) => {
            try {
                const token = await tk();
                const result = data.id
                    ? await api.patchSection(token, data.id, data)
                    : await api.createSection(token, data);
                setState((s) => {
                    const idx = s.sections.findIndex((sec) => sec.id === result.id);
                    const next =
                        idx >= 0
                            ? s.sections.map((sec) =>
                                sec.id === result.id ? result : sec,
                            )
                            : [...s.sections, result];
                    return { ...s, sections: next };
                });
                return result;
            } catch (err: any) {
                setState((s) => ({
                    ...s,
                    error: err?.message || "Failed to save section",
                }));
                throw err;
            }
        },
        [tk],
    );

    const killSection = useCallback(
        async (id: string, reason: string) => {
            try {
                const token = await tk();
                const result = await api.killSection(token, id, reason);
                setState((s) => ({
                    ...s,
                    sections: s.sections.map((sec) =>
                        sec.id === id ? result : sec,
                    ),
                }));
            } catch (err: any) {
                setState((s) => ({
                    ...s,
                    error: err?.message || "Failed to delete section",
                }));
                throw err;
            }
        },
        [tk],
    );

    const restoreSection = useCallback(
        async (id: string) => {
            try {
                const token = await tk();
                const result = await api.restoreSection(token, id);
                setState((s) => ({
                    ...s,
                    sections: s.sections.map((sec) =>
                        sec.id === id ? result : sec,
                    ),
                }));
            } catch (err: any) {
                setState((s) => ({
                    ...s,
                    error: err?.message || "Failed to restore section",
                }));
                throw err;
            }
        },
        [tk],
    );

    /* Questions */

    const toggleQuestionActive = useCallback(
        async (id: string, isActive: boolean) => {
            try {
                const token = await tk();
                await api.patchQuestion(token, id, { isActive });
                setState((s) => ({
                    ...s,
                    questions: s.questions.map((q) =>
                        q.id === id ? { ...q, isActive } : q,
                    ),
                }));
            } catch (err: any) {
                setState((s) => ({
                    ...s,
                    error: err?.message || "Failed to update question",
                }));
            }
        },
        [tk],
    );

    const createQuestion = useCallback(
        async (data: CreateQuestionInput) => {
            try {
                const token = await tk();
                const result = await api.createQuestion(token, data);
                setState((s) => ({
                    ...s,
                    questions: [
                        ...s.questions,
                        {
                            id: result.id,
                            formatTitle: result.formatTitle,
                            sectionTitle: result.sectionTitle,
                            difficulty: result.difficulty,
                            isActive: result.isActive,
                            hasScenario: !!result.scenarioText,
                            rubricDimensionCount: result.scoringRubric.dimensions.length,
                        },
                    ],
                }));
                return result;
            } catch (err: any) {
                // 422 is shown inline by the form — skip global banner
                if (err?.status !== 422) {
                    setState((s) => ({
                        ...s,
                        error: err?.message || "Failed to create question",
                    }));
                }
                throw err;
            }
        },
        [tk],
    );

    /* Derived helpers */

    const getDimensionsForFormat = useCallback(
        (formatId: string) =>
            state.dimensions.filter((d) => d.formatId === formatId && !d.killed),
        [state.dimensions],
    );

    const getSectionsForFormat = useCallback(
        (formatId: string) =>
            state.sections.filter((s) => s.formatId === formatId && !s.killed),
        [state.sections],
    );

    return {
        ...state,
        dismissError,
        fetchAll,
        fetchQuestions,
        upsertFormat,
        killFormat,
        restoreFormat,
        upsertDimension,
        killDimension,
        restoreDimension,
        upsertSection,
        killSection,
        restoreSection,
        toggleQuestionActive,
        createQuestion,
        getDimensionsForFormat,
        getSectionsForFormat,
    };
}