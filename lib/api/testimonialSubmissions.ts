import { handleResponse } from "@/lib/api/admin";
import type {
    TestimonialSubmissionAdmin,
    ApproveTestimonialSubmissionInput,
    RejectTestimonialSubmissionInput,
    AdminTestimonial,
} from "@/types/marketing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function listTestimonialSubmissions(token: string | null): Promise<TestimonialSubmissionAdmin[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/testimonial-submissions`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });
    return handleResponse<TestimonialSubmissionAdmin[]>(res);
}

export async function approveTestimonialSubmission(
    token: string | null,
    id: string,
    input: ApproveTestimonialSubmissionInput = {},
): Promise<AdminTestimonial> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/testimonial-submissions/${id}/approve`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        body: JSON.stringify(input),
    });
    return handleResponse<AdminTestimonial>(res);
}

export async function rejectTestimonialSubmission(
    token: string | null,
    id: string,
    input: RejectTestimonialSubmissionInput = {},
): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/testimonial-submissions/${id}/reject`, {
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