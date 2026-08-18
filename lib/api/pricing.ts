import { handleResponse } from "@/lib/api/admin";
import type {
    PricingPlan,
    PricingPlanType,
    UpdatePricingPlanInput,
    CreateFeatureInput,
    CreateBillingCycleInput,
} from "@/types/marketing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const headers = (token: string | null) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
});

export async function listPricingPlans(token: string | null): Promise<PricingPlan[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/pricing`, {
        headers: headers(token),
        cache: "no-store",
    });
    return handleResponse<PricingPlan[]>(res);
}

export async function updatePricingPlan(
    token: string | null,
    planType: PricingPlanType,
    input: UpdatePricingPlanInput
): Promise<PricingPlan> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/pricing/${planType}`, {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify(input),
    });
    return handleResponse<PricingPlan>(res);
}

export async function addFeature(
    token: string | null,
    planType: PricingPlanType,
    input: CreateFeatureInput
): Promise<PricingPlan> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/pricing/${planType}/features`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify(input),
    });
    return handleResponse<PricingPlan>(res);
}

export async function updateFeature(
    token: string | null,
    planType: PricingPlanType,
    featureId: string,
    input: Partial<CreateFeatureInput>
): Promise<PricingPlan> {
    const res = await fetch(
        `${API_BASE_URL}/api/admin/marketing/pricing/${planType}/features/${featureId}`,
        { method: "PATCH", headers: headers(token), body: JSON.stringify(input) }
    );
    return handleResponse<PricingPlan>(res);
}

export async function deleteFeature(
    token: string | null,
    planType: PricingPlanType,
    featureId: string
): Promise<PricingPlan> {
    const res = await fetch(
        `${API_BASE_URL}/api/admin/marketing/pricing/${planType}/features/${featureId}`,
        { method: "DELETE", headers: headers(token) }
    );
    return handleResponse<PricingPlan>(res);
}

export async function addBillingCycle(
    token: string | null,
    planType: PricingPlanType,
    input: CreateBillingCycleInput
): Promise<PricingPlan> {
    const res = await fetch(`${API_BASE_URL}/api/admin/marketing/pricing/${planType}/billing-cycles`, {
        method: "POST",
        headers: headers(token),
        body: JSON.stringify(input),
    });
    return handleResponse<PricingPlan>(res);
}

export async function updateBillingCycle(
    token: string | null,
    planType: PricingPlanType,
    cycleId: string,
    input: Partial<CreateBillingCycleInput>
): Promise<PricingPlan> {
    const res = await fetch(
        `${API_BASE_URL}/api/admin/marketing/pricing/${planType}/billing-cycles/${cycleId}`,
        { method: "PATCH", headers: headers(token), body: JSON.stringify(input) }
    );
    return handleResponse<PricingPlan>(res);
}

export async function deleteBillingCycle(
    token: string | null,
    planType: PricingPlanType,
    cycleId: string
): Promise<PricingPlan> {
    const res = await fetch(
        `${API_BASE_URL}/api/admin/marketing/pricing/${planType}/billing-cycles/${cycleId}`,
        { method: "DELETE", headers: headers(token) }
    );
    return handleResponse<PricingPlan>(res);
}