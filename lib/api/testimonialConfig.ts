import { handleResponse } from "@/lib/api/admin";
import type { TestimonialCollectionConfig, UpdateTestimonialCollectionConfigInput } from "@/types/marketing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getTestimonialCollectionConfig(token: string | null): Promise<TestimonialCollectionConfig> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/testimonial-config`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        cache: "no-store",
    });
    return handleResponse<TestimonialCollectionConfig>(res);
}

export async function updateTestimonialCollectionConfig(
    token: string | null,
    input: UpdateTestimonialCollectionConfigInput,
): Promise<TestimonialCollectionConfig> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/testimonial-config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        cache: "no-store",
        body: JSON.stringify(input),
    });
    return handleResponse<TestimonialCollectionConfig>(res);
}