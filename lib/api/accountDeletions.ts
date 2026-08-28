import { handleResponse } from "@/lib/api/admin";
import type { AccountDeletion, AccountDeletionStatus, RestoreAccountDeletionInput } from "@/types/user";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function listAccountDeletions(
    token: string | null,
    status: AccountDeletionStatus = "pending",
): Promise<AccountDeletion[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/account-deletions?status=${status}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        cache: "no-store",
    });
    return handleResponse<AccountDeletion[]>(res);
}

export async function restoreAccountDeletion(
    token: string | null,
    id: string,
    input: RestoreAccountDeletionInput,
): Promise<AccountDeletion> {
    const res = await fetch(`${API_BASE_URL}/api/admin/account-deletions/${id}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(input),
    });
    return handleResponse<AccountDeletion>(res);
}