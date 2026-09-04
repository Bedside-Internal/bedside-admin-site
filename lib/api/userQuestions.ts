import { handleResponse } from "@/lib/api/admin";
import type {
    UserSubmittedQuestionAdmin,
    ApproveUserQuestionInput,
    RejectUserQuestionInput,
} from "@/types/marketing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function listUserSubmittedQuestions(
    token: string | null,
): Promise<UserSubmittedQuestionAdmin[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/content/submitted-questions`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });
    return handleResponse<UserSubmittedQuestionAdmin[]>(res);
}

export async function approveUserSubmittedQuestion(
    token: string | null,
    id: string,
    input: ApproveUserQuestionInput = {},
): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE_URL}/api/admin/content/submitted-questions/${id}/approve`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        body: JSON.stringify(input),
    });
    return handleResponse<{ id: string }>(res);
}

export async function rejectUserSubmittedQuestion(
    token: string | null,
    id: string,
    input: RejectUserQuestionInput = {},
): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE_URL}/api/admin/content/submitted-questions/${id}/reject`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        body: JSON.stringify(input),
    });
    return handleResponse<{ id: string }>(res);
}

export interface ShareRequest {
    id: string;
    sectionId: string;
    sectionTitle: string;
    difficulty: "easy" | "medium" | "hard";
    ownerUserId: string | null;
    updatedAt: string;
}

export async function listShareRequests(token: string | null): Promise<ShareRequest[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/content/share-requests`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });
    return handleResponse<ShareRequest[]>(res);
}

export async function approveShareRequest(
    token: string | null,
    id: string,
): Promise<{ id: string; scope: string }> {
    const res = await fetch(`${API_BASE_URL}/api/admin/content/share-requests/${id}/approve`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });
    return handleResponse<{ id: string; scope: string }>(res);
}

export async function rejectShareRequest(
    token: string | null,
    id: string,
): Promise<{ id: string; scope: string }> {
    const res = await fetch(`${API_BASE_URL}/api/admin/content/share-requests/${id}/reject`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });
    return handleResponse<{ id: string; scope: string }>(res);
}