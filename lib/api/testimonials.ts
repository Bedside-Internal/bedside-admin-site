import { handleResponse } from "@/lib/api/admin";
import type {
    AdminTestimonial,
    CreateTestimonialInput,
} from "@/types/marketing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function listTestimonials(
    token: string | null
): Promise<AdminTestimonial[]> {
    const res = await fetch(
        `${API_BASE_URL}/api/admin/marketing/testimonials`,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        }
    );
    return handleResponse<AdminTestimonial[]>(res);
}

export async function createTestimonial(
    token: string | null,
    input: CreateTestimonialInput
): Promise<AdminTestimonial> {
    const res = await fetch(
        `${API_BASE_URL}/api/admin/marketing/testimonials`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(input),
        }
    );
    return handleResponse<AdminTestimonial>(res);
}

export async function updateTestimonial(
    token: string | null,
    id: string,
    input: Partial<CreateTestimonialInput>
): Promise<AdminTestimonial> {
    const res = await fetch(
        `${API_BASE_URL}/api/admin/marketing/testimonials/${id}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(input),
        }
    );
    return handleResponse<AdminTestimonial>(res);
}

export async function deleteTestimonial(
    token: string | null,
    id: string
): Promise<{ deleted: boolean }> {
    const res = await fetch(
        `${API_BASE_URL}/api/admin/marketing/testimonials/${id}`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return handleResponse<{ deleted: boolean }>(res);
}

export async function reorderTestimonials(
    token: string | null,
    items: { id: string; sortOrder: number }[]
): Promise<AdminTestimonial[]> {
    const res = await fetch(
        `${API_BASE_URL}/api/admin/marketing/testimonials/reorder`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ items }),
        }
    );
    return handleResponse<AdminTestimonial[]>(res);
}