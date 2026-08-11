export type UserTier = "free" | "paid" | "admin";

// Mirrors server/src/schemas/adminSchemas.ts -> AdminUserDTO
export interface AdminUserDTO {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  tier: UserTier;
  paidUntil: string | null;
  attemptsUsed: number;
  attemptsLimit: number;
  createdAt: string;
}

// Backward-compatible alias for existing components
export type User = AdminUserDTO;

export interface UpdateUserPayload {
  tier: UserTier;
  paidUntil: string | null;
}

export interface GrantAttemptsPayload {
  amount: number;
  reason?: string | null;
}

export interface ApiErrorResponse {
  error: string;
}