import { handleResponse } from "@/lib/api/admin";
import type { AdminFaqEntry, CreateFaqEntryInput } from "@/types/marketing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function listFaqEntries(token: string | null): Promise<AdminFaqEntry[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/faq`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        cache: "no-store",
    });
    return handleResponse<AdminFaqEntry[]>(res);
}

export async function createFaqEntry(
    token: string | null,
    input: CreateFaqEntryInput
): Promise<AdminFaqEntry> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/faq`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(input),
    });
    return handleResponse<AdminFaqEntry>(res);
}

export async function updateFaqEntry(
    token: string | null,
    id: string,
    input: Partial<CreateFaqEntryInput>
): Promise<AdminFaqEntry> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/faq/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(input),
    });
    return handleResponse<AdminFaqEntry>(res);
}

export async function deleteFaqEntry(token: string | null, id: string): Promise<{ deleted: boolean }> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/faq/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ deleted: boolean }>(res);
}

export async function reorderFaqEntries(
    token: string | null,
    items: { id: string; sortOrder: number }[]
): Promise<AdminFaqEntry[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/faq/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items }),
    });
    return handleResponse<AdminFaqEntry[]>(res);
}