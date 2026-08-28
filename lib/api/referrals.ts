import { handleResponse } from "@/lib/api/admin";
import type { AdminReferral, VoidReferralInput } from "@/types/marketing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function listReferrals(token: string | null): Promise<AdminReferral[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/referrals`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });
    return handleResponse<AdminReferral[]>(res);
}

export async function voidReferral(
    token: string | null,
    id: string,
    input?: VoidReferralInput,
): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/admin/referrals/${id}/void`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input ?? {}),
    });
    return handleResponse<void>(res);
}