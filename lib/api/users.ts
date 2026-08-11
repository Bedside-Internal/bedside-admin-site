import {
    AdminUserDTO,
    UpdateUserPayload,
    GrantAttemptsPayload,
    ApiErrorResponse,
} from "@/types/user";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

async function handleResponse<T>(res: Response): Promise<T> {
    // 401: Session expired/revoked. Hard redirect to root login.
    if (res.status === 401) {
        if (typeof window !== "undefined") {
            window.location.href = "/";
        }
        throw new ApiError("Session expired", 401);
    }

    // 403: Authenticated, but not an admin. Show access denied UI.
    if (res.status === 403) {
        throw new ApiError("You do not have admin access", 403);
    }

    // 404: Account pending Clerk webhook sync. Show setup UI.
    if (res.status === 404) {
        throw new ApiError("Account pending setup", 404);
    }

    // Other errors (400, 500, etc.)
    if (!res.ok) {
        const errData: ApiErrorResponse = await res.json().catch(() => ({
            error: "Request failed",
        }));
        throw new ApiError(errData.error || `HTTP ${res.status}`, res.status);
    }

    // Handle 204 No Content
    if (res.status === 204) return undefined as T;
    return res.json();
}

export async function getUsers(
    token: string | null,
    search?: string,
    page?: number,
    limit?: number
): Promise<AdminUserDTO[]> {
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

    return handleResponse<AdminUserDTO[]>(res);
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