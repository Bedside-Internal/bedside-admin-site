import type {
    Format,
    Dimension,
    Section,
    QuestionListItem,
    Question,
    CreateQuestionInput,
} from "@/types/content";
import { handleResponse } from "@/lib/api/admin";

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/content`;

function headers(token: string, json = true): HeadersInit {
    const h: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (json) h["Content-Type"] = "application/json";
    return h;
}

/* Formats */

export function getFormats(token: string, includeKilled = false) {
    return fetch(`${BASE}/formats?includeKilled=${includeKilled}`, {
        headers: headers(token),
    }).then((r) => handleResponse<Format[]>(r));
}

export function createFormat(
    token: string,
    data: {
        trackId?: string;
        slug: string;
        title: string;
        subtitle?: string;
        iconKey?: string;
    },
) {
    return fetch(`${BASE}/formats`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify(data),
    }).then((r) => handleResponse<Format>(r));
}

export function patchFormat(
    token: string,
    id: string,
    data: { slug?: string; title?: string; subtitle?: string; iconKey?: string },
) {
    return fetch(`${BASE}/formats/${id}`, {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify(data),
    }).then((r) => handleResponse<Format>(r));
}

export function killFormat(token: string, id: string, reason: string) {
    return fetch(`${BASE}/formats/${id}/kill`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify({ reason }),
    }).then((r) => handleResponse<Format>(r));
}

export function restoreFormat(token: string, id: string) {
    return fetch(`${BASE}/formats/${id}/restore`, {
        method: "POST",
        headers: headers(token),
    }).then((r) => handleResponse<Format>(r));
}

/* Dimensions */

export function getDimensions(
    token: string,
    formatId?: string,
    includeKilled = false,
) {
    const p = new URLSearchParams({ includeKilled: String(includeKilled) });
    if (formatId) p.set("formatId", formatId);
    return fetch(`${BASE}/dimensions?${p}`, {
        headers: headers(token),
    }).then((r) => handleResponse<Dimension[]>(r));
}

export function createDimension(
    token: string,
    data: {
        formatId: string;
        label: string;
        slug: string;
        subtitle?: string;
        iconKey?: string;
        sortOrder?: number;
    },
) {
    return fetch(`${BASE}/dimensions`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify(data),
    }).then((r) => handleResponse<Dimension>(r));
}

export function patchDimension(
    token: string,
    id: string,
    data: {
        label?: string;
        slug?: string;
        subtitle?: string;
        iconKey?: string;
        sortOrder?: number;
    },
) {
    return fetch(`${BASE}/dimensions/${id}`, {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify(data),
    }).then((r) => handleResponse<Dimension>(r));
}

export function killDimension(token: string, id: string, reason: string) {
    return fetch(`${BASE}/dimensions/${id}/kill`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify({ reason }),
    }).then((r) => handleResponse<Dimension>(r));
}

export function restoreDimension(token: string, id: string) {
    return fetch(`${BASE}/dimensions/${id}/restore`, {
        method: "POST",
        headers: headers(token),
    }).then((r) => handleResponse<Dimension>(r));
}

/* Sections */

export function getSections(
    token: string,
    formatId?: string,
    includeKilled = false,
) {
    const p = new URLSearchParams({ includeKilled: String(includeKilled) });
    if (formatId) p.set("formatId", formatId);
    return fetch(`${BASE}/sections?${p}`, {
        headers: headers(token),
    }).then((r) => handleResponse<Section[]>(r));
}

export function createSection(
    token: string,
    data: {
        formatId: string;
        dimensionId?: string;
        title: string;
        slug: string;
        subtitle?: string;
        iconKey?: string;
        sortOrder?: number;
    },
) {
    return fetch(`${BASE}/sections`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify(data),
    }).then((r) => handleResponse<Section>(r));
}

export function patchSection(
    token: string,
    id: string,
    data: {
        dimensionId?: string;
        title?: string;
        slug?: string;
        subtitle?: string;
        iconKey?: string;
        sortOrder?: number;
    },
) {
    return fetch(`${BASE}/sections/${id}`, {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify(data),
    }).then((r) => handleResponse<Section>(r));
}

export function killSection(token: string, id: string, reason: string) {
    return fetch(`${BASE}/sections/${id}/kill`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify({ reason }),
    }).then((r) => handleResponse<Section>(r));
}

export function restoreSection(token: string, id: string) {
    return fetch(`${BASE}/sections/${id}/restore`, {
        method: "POST",
        headers: headers(token),
    }).then((r) => handleResponse<Section>(r));
}

/* Questions */

export function getQuestions(
    token: string,
    filters?: {
        formatSlug?: string;
        sectionSlug?: string;
        difficulty?: string;
        isActive?: boolean;
    },
) {
    const p = new URLSearchParams();
    if (filters?.formatSlug) p.set("formatSlug", filters.formatSlug);
    if (filters?.sectionSlug) p.set("sectionSlug", filters.sectionSlug);
    if (filters?.difficulty) p.set("difficulty", filters.difficulty);
    if (filters?.isActive !== undefined) p.set("isActive", String(filters.isActive));
    const qs = p.toString();
    return fetch(`${BASE}/questions${qs ? `?${qs}` : ""}`, {
        headers: headers(token),
    }).then((r) => handleResponse<QuestionListItem[]>(r));
}

export function getQuestion(token: string, id: string) {
    return fetch(`${BASE}/questions/${id}`, {
        headers: headers(token),
    }).then((r) => handleResponse<Question>(r));
}

export function createQuestion(token: string, data: CreateQuestionInput) {
    return fetch(`${BASE}/questions`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify(data),
    }).then((r) => handleResponse<Question>(r));
}

export function patchQuestion(
    token: string,
    id: string,
    data: Partial<
        Omit<CreateQuestionInput, "sectionId" | "source" | "aiModel">
    >,
) {
    return fetch(`${BASE}/questions/${id}`, {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify(data),
    }).then((r) => handleResponse<Question>(r));
}