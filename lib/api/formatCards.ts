import { handleResponse } from "@/lib/api/admin";
import type { AdminFormatCard, CreateFormatCardInput } from "@/types/marketing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function listFormatCards(token: string | null): Promise<AdminFormatCard[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/formats`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        cache: "no-store",
    });
    return handleResponse<AdminFormatCard[]>(res);
}

export async function createFormatCard(
    token: string | null,
    input: CreateFormatCardInput
): Promise<AdminFormatCard> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/formats`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(input),
    });
    return handleResponse<AdminFormatCard>(res);
}

export async function updateFormatCard(
    token: string | null,
    id: string,
    input: Partial<CreateFormatCardInput>
): Promise<AdminFormatCard> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/formats/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(input),
    });
    return handleResponse<AdminFormatCard>(res);
}

export async function deleteFormatCard(
    token: string | null,
    id: string
): Promise<{ deleted: boolean }> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/formats/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ deleted: boolean }>(res);
}

export async function reorderFormatCards(
    token: string | null,
    items: { id: string; sortOrder: number }[]
): Promise<AdminFormatCard[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/formats/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items }),
    });
    return handleResponse<AdminFormatCard[]>(res);
}