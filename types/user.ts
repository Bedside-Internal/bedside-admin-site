export type UserTier = "free" | "paid" | "admin";

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName?: string;
  tier: UserTier;
  paidUntil: string | null;
  attemptsUsed: number;
  attemptsLimit: number;
  createdAt: string;
}

export interface UpdateUserPayload {
  tier?: UserTier;
  paidUntil?: string | null;
}

export interface GrantAttemptsPayload {
  amount: number;
  reason: string;
}