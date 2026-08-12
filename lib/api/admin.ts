import {
    AdminRole,
    AdminUserRow,
    CreateRoleInput,
    UpdateRoleInput,
    GrantAdminAccessInput,
    UpdateAdminAccessInput,
    ApiErrorResponse,
    AdminFeature,
    FeatureType,
    UpsertFeatureInput
} from "@/types/admin";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const errData: ApiErrorResponse = await res.json().catch(() => ({
            error: "Request failed",
        }));
        throw new Error(errData.error || `HTTP ${res.status}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json();
}

// role management 
export async function listRoles(token: string | null): Promise<AdminRole[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/roles`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });
    return handleResponse<AdminRole[]>(res);
}

export async function createRole(token: string | null, input: CreateRoleInput): Promise<AdminRole> {
    const res = await fetch(`${API_BASE_URL}/api/admin/roles`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        body: JSON.stringify(input),
    });
    return handleResponse<AdminRole>(res);
}

export async function updateRole(token: string | null, id: string, input: UpdateRoleInput): Promise<AdminRole> {
    const res = await fetch(`${API_BASE_URL}/api/admin/roles/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        body: JSON.stringify(input),
    });
    return handleResponse<AdminRole>(res);
}

export async function deleteRole(token: string | null, id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/admin/roles/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });
    return handleResponse<void>(res);
}

// admin access
export async function listAdmins(token: string | null): Promise<AdminUserRow[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/admins`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });
    return handleResponse<AdminUserRow[]>(res);
}

export async function grantAdminAccess(token: string | null, input: GrantAdminAccessInput): Promise<AdminUserRow> {
    const res = await fetch(`${API_BASE_URL}/api/admin/admins`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        body: JSON.stringify(input),
    });
    return handleResponse<AdminUserRow>(res);
}

export async function updateAdminAccess(token: string | null, id: string, input: UpdateAdminAccessInput): Promise<AdminUserRow> {
    const res = await fetch(`${API_BASE_URL}/api/admin/admins/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        body: JSON.stringify(input),
    });
    return handleResponse<AdminUserRow>(res);
}

export async function revokeAdminAccess(token: string | null, id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/admin/admins/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });
    return handleResponse<void>(res);
}

// feature flags (tracks + formats)
export async function listFeatures(token: string | null, type?: FeatureType): Promise<AdminFeature[]> {
    const params = type ? `?type=${type}` : "";
    const res = await fetch(`${API_BASE_URL}/api/admin/feature-flags${params}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });
    return handleResponse<AdminFeature[]>(res);
}

// upsert: create (new key) or edit (existing key) — same PATCH does both
export async function upsertFeature(token: string | null, key: string, input: UpsertFeatureInput): Promise<AdminFeature> {
    const res = await fetch(`${API_BASE_URL}/api/admin/feature-flags/${key}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        body: JSON.stringify(input),
    });
    return handleResponse<AdminFeature>(res);
}

export async function deleteFeature(token: string | null, key: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/admin/feature-flags/${key}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });
    return handleResponse<void>(res);
}

export async function killFeature(token: string | null, key: string, reason: string): Promise<AdminFeature> {
    const res = await fetch(`${API_BASE_URL}/api/admin/feature-flags/${key}/kill`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        body: JSON.stringify({ reason }),
    });
    return handleResponse<AdminFeature>(res);
}

export async function restoreFeature(token: string | null, key: string): Promise<AdminFeature> {
    const res = await fetch(`${API_BASE_URL}/api/admin/feature-flags/${key}/restore`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });
    return handleResponse<AdminFeature>(res);
}

export async function reorderFeatures(token: string | null, items: { key: string; order: number }[]): Promise<AdminFeature[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/feature-flags/reorder`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        body: JSON.stringify({ items }),
    });
    return handleResponse<AdminFeature[]>(res);
}