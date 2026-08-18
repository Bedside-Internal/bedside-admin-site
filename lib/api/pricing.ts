import { handleResponse } from "@/lib/api/admin";
import type {
    AdminPricingTier,
    CreatePricingTierInput,
    CreateFeatureInput,
    CreateBillingCycleInput,
} from "@/types/marketing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const headers = (token: string | null) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
});

export async function listPricingTiers(token: string | null): Promise<AdminPricingTier[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/pricing`, {
        headers: headers(token),
        cache: "no-store",
    });
    return handleResponse<AdminPricingTier[]>(res);
}

export async function createPricingTier(
    token: string | null,
    input: CreatePricingTierInput
): Promise<AdminPricingTier> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/pricing`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify(input),
    });
    return handleResponse<AdminPricingTier>(res);
}

export async function updatePricingTier(
    token: string | null,
    id: string,
    input: Partial<CreatePricingTierInput>
): Promise<AdminPricingTier> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/pricing/${id}`, {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify(input),
    });
    return handleResponse<AdminPricingTier>(res);
}

export async function deletePricingTier(token: string | null, id: string): Promise<{ deleted: boolean }> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/pricing/${id}`, {
        method: "DELETE",
        headers: headers(token),
    });
    return handleResponse<{ deleted: boolean }>(res);
}

export async function reorderPricingTiers(
    token: string | null,
    items: { id: string; sortOrder: number }[]
): Promise<AdminPricingTier[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/pricing/reorder`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify({ items }),
    });
    return handleResponse<AdminPricingTier[]>(res);
}

export async function addFeature(
    token: string | null,
    id: string,
    input: CreateFeatureInput
): Promise<AdminPricingTier> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/pricing/${id}/features`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify(input),
    });
    return handleResponse<AdminPricingTier>(res);
}

export async function updateFeature(
    token: string | null,
    id: string,
    featureId: string,
    input: Partial<CreateFeatureInput>
): Promise<AdminPricingTier> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/pricing/${id}/features/${featureId}`, {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify(input),
    });
    return handleResponse<AdminPricingTier>(res);
}

export async function deleteFeature(
    token: string | null,
    id: string,
    featureId: string
): Promise<AdminPricingTier> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/pricing/${id}/features/${featureId}`, {
        method: "DELETE",
        headers: headers(token),
    });
    return handleResponse<AdminPricingTier>(res);
}

export async function addBillingCycle(
    token: string | null,
    id: string,
    input: CreateBillingCycleInput
): Promise<AdminPricingTier> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/pricing/${id}/billing-cycles`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify(input),
    });
    return handleResponse<AdminPricingTier>(res);
}

export async function updateBillingCycle(
    token: string | null,
    id: string,
    cycleId: string,
    input: Partial<CreateBillingCycleInput>
): Promise<AdminPricingTier> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/pricing/${id}/billing-cycles/${cycleId}`, {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify(input),
    });
    return handleResponse<AdminPricingTier>(res);
}

export async function deleteBillingCycle(
    token: string | null,
    id: string,
    cycleId: string
): Promise<AdminPricingTier> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/pricing/${id}/billing-cycles/${cycleId}`, {
        method: "DELETE",
        headers: headers(token),
    });
    return handleResponse<AdminPricingTier>(res);
}