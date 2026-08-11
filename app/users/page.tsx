"use client";

import { useState } from "react";
import { User, UpdateUserPayload, GrantAttemptsPayload } from "@/types/user";
import AdminNav from "@/components/layout/AdminNav";
import UserSearch from "@/components/users/UserSearch";
import UserTable from "@/components/users/UserTable";
import UserDetailPanel from "@/components/users/UserDetailPanel";

// --- Mock data for visual testing ---
const MOCK_USERS: User[] = [
  {
    id: "1",
    clerkId: "user_2XYZabcdef123456",
    email: "alice@example.com",
    firstName: "Alice",
    lastName: "Nguyen",
    tier: "paid",
    paidUntil: "2025-08-15T00:00:00.000Z",
    attemptsUsed: 12,
    attemptsLimit: 20,
    createdAt: "2024-11-02T10:30:00.000Z",
  },
  {
    id: "2",
    clerkId: "user_2XYZabcdef789012",
    email: "bob@test.com",
    firstName: "Bob",
    tier: "free",
    paidUntil: null,
    attemptsUsed: 3,
    attemptsLimit: 5,
    createdAt: "2025-01-14T08:00:00.000Z",
  },
  {
    id: "3",
    clerkId: "user_2XYZabcdef345678",
    email: "carol@bedside.ai",
    firstName: "Carol",
    lastName: "Admin",
    tier: "admin",
    paidUntil: null,
    attemptsUsed: 0,
    attemptsLimit: 999,
    createdAt: "2024-06-01T12:00:00.000Z",
  },
  {
    id: "4",
    clerkId: "user_2XYZabcdef901234",
    email: "dave@company.org",
    firstName: "Dave",
    tier: "paid",
    paidUntil: "2025-02-01T00:00:00.000Z",
    attemptsUsed: 20,
    attemptsLimit: 20,
    createdAt: "2024-09-20T15:45:00.000Z",
  },
];
// -------------------------------

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // TODO: Wrap with Clerk admin-role check before production
  // e.g., useAuth() -> check publicMetadata.role === "admin" -> redirect

  const filteredUsers = MOCK_USERS.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.clerkId.toLowerCase().includes(search.toLowerCase())
  );

  const selectedUser =
    MOCK_USERS.find((u) => u.id === selectedUserId) ?? null;

  const handleUpdate = (id: string, payload: UpdateUserPayload) => {
    console.log("TODO: API call updateUser", id, payload);
  };

  const handleGrant = (id: string, payload: GrantAttemptsPayload) => {
    console.log("TODO: API call grantAttempts", id, payload);
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream font-dm text-ink">
      <AdminNav />

      <main className="flex flex-1 overflow-hidden">
        {/* Left: List area */}
        <div 
            className="flex flex-1 flex-col overflow-y-auto"
            onClick={(e) => {
                // Deselect if clicking directly on the background, not a child
                if (e.target === e.currentTarget) setSelectedUserId(null);
            }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
            <h1 className="font-poppins text-xl font-bold text-ink">
              Users &amp; Support
            </h1>
            <span className="text-sm text-ink/50">
              {filteredUsers.length} of {MOCK_USERS.length}
            </span>
          </div>

          {/* Search */}
          <div className="border-b border-ink/10 px-6 py-4">
            <UserSearch value={search} onChange={setSearch} />
          </div>

          {/* Table */}
          <div className="pt-4">
            <UserTable
              users={filteredUsers}
              selectedUserId={selectedUserId}
              onSelectUser={setSelectedUserId}
            />
          </div>
        </div>

        {/* Right: Detail panel */}
        <UserDetailPanel
          user={selectedUser}
          onUpdate={handleUpdate}
          onGrant={handleGrant}
        />
      </main>
    </div>
  );
}