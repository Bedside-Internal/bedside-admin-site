export type AdminResource =
    | "users"
    | "content"
    | "ai_generation"
    | "feature_flags"
    | "billing"
    | "admin_management";

export type AdminAction = "read" | "write" | "delete";

// e.g., { users: ["read"], admin_management: ["read", "write"] }
export type PermissionMatrix = Record<AdminResource, AdminAction[]>;

// roles
export interface AdminRole {
    id: string;
    slug: string;
    label: string;
    permissions: PermissionMatrix;
    createdAt: string;
}

export interface CreateRoleInput {
    slug: string;
    label: string;
    permissions: PermissionMatrix;
}

export interface UpdateRoleInput {
    label?: string;
    permissions?: Partial<PermissionMatrix>;
}

// admin access
export interface AdminUserRow {
    id: string;
    userId: string; // Internal UUID
    email: string;
    roleId: string;
    roleSlug: string;
    roleLabel: string;
    permissionOverrides: Partial<PermissionMatrix> | null;
    createdAt: string;
}

export interface GrantAdminAccessInput {
    userId: string;
    roleId: string;
    permissionOverrides?: Partial<PermissionMatrix>;
}

export interface UpdateAdminAccessInput {
    roleId?: string;
    permissionOverrides?: Partial<PermissionMatrix>;
}

export interface ApiErrorResponse {
    error: string;
}