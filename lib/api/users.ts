import { ApiError, toApiError } from "./http";
import {
    AdminUserDTO,
    UpdateUserPayload,
    GrantAttemptsPayload,
    ListUsersResponse,
} from "@/types/user";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export { ApiError };

/**
 * Users-page wrapper around the shared handler. Keeps the two special cases
 * this page relies on (expired session redirect, friendly copy for the
 * admin-sync 404 / not-an-admin 403) but otherwise surfaces the server's own
 * message and per-field validation errors like every other admin call.
 */
async function handleResponse<T>(res: Response): Promise<T> {
    // 401: Session expired/revoked. Hard redirect to root login.
    if (res.status === 401) {
        if (typeof window !== "undefined") {
            window.location.href = "/";
        }
        throw new ApiError("Session expired", 401);
    }

    if (!res.ok) {
        const err = await toApiError(res);
        // requireAdmin: caller is authenticated but not an admin.
        if (res.status === 403 && err.message === "Not an admin") {
            err.message = "You do not have admin access";
        }
        // requireAdmin: caller's own row hasn't synced from Clerk yet. A 404
        // from a route handler (e.g. "User not found") keeps its own message.
        if (res.status === 404 && /account sync/i.test(err.message)) {
            err.message = "Account pending setup";
        }
        throw err;
    }

    if (res.status === 204) return undefined as T;
    return res.json();
}

export async function getUsers(
    token: string | null,
    search?: string,
    page?: number,
    limit?: number
): Promise<ListUsersResponse> {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (page) params.set("page", page.toString());
    if (limit) params.set("limit", limit.toString());

    const res = await fetch(
        `${API_BASE_URL}/api/admin/users?${params.toString()}`,
        {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        }
    );

    return handleResponse<ListUsersResponse>(res);
}

export async function updateUser(
    token: string | null,
    id: string,
    payload: UpdateUserPayload
): Promise<AdminUserDTO> {
    const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
    });

    return handleResponse<AdminUserDTO>(res);
}

export async function grantAttempts(
    token: string | null,
    id: string,
    payload: GrantAttemptsPayload
): Promise<void> {
    const res = await fetch(
        `${API_BASE_URL}/api/admin/users/${id}/grant-attempts`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
        }
    );

    return handleResponse<void>(res);
}