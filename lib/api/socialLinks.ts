import { handleResponse } from "@/lib/api/admin";
import type { AdminSocialLink, CreateSocialLinkInput } from "@/types/marketing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const headers = (token: string | null) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
});

export async function listSocialLinks(token: string | null): Promise<AdminSocialLink[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/social-links`, {
        headers: headers(token),
        cache: "no-store",
    });
    return handleResponse<AdminSocialLink[]>(res);
}

export async function createSocialLink(
    token: string | null,
    input: CreateSocialLinkInput
): Promise<AdminSocialLink> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/social-links`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify(input),
    });
    return handleResponse<AdminSocialLink>(res);
}

export async function updateSocialLink(
    token: string | null,
    id: string,
    input: Partial<CreateSocialLinkInput>
): Promise<AdminSocialLink> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/social-links/${id}`, {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify(input),
    });
    return handleResponse<AdminSocialLink>(res);
}

export async function deleteSocialLink(
    token: string | null,
    id: string
): Promise<{ deleted: boolean }> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/social-links/${id}`, {
        method: "DELETE",
        headers: headers(token),
    });
    return handleResponse<{ deleted: boolean }>(res);
}

export async function reorderSocialLinks(
    token: string | null,
    items: { id: string; sortOrder: number }[]
): Promise<AdminSocialLink[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/social-links/reorder`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify({ items }),
    });
    return handleResponse<AdminSocialLink[]>(res);
}