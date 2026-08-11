"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { User, UpdateUserPayload, GrantAttemptsPayload } from "@/types/user";
import { getUsers, updateUser, grantAttempts } from "@/lib/api/users";
import AdminNav from "@/components/layout/AdminNav";
import UserSearch from "@/components/users/UserSearch";
import UserTable from "@/components/users/UserTable";
import UserDetailPanel from "@/components/users/UserDetailPanel";

export default function UsersPage() {
  const { getToken, isLoaded } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // TODO: Add strict admin-role check here if publicMetadata.role === "admin" 
  // is set in Clerk. Otherwise, rely on backend 403.

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const data = await getUsers(token, search);
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [getToken, search]);

  useEffect(() => {
    if (isLoaded) {
      fetchUsers();
    }
  }, [isLoaded, fetchUsers]);

  const handleUpdate = async (id: string, payload: UpdateUserPayload) => {
    try {
      const token = await getToken();
      await updateUser(token, id, payload);
      // Refresh list to get updated computed fields (like attempts)
      await fetchUsers(); 
    } catch (err: any) {
      alert(err.message || "Failed to update user");
    }
  };

  const handleGrant = async (id: string, payload: GrantAttemptsPayload) => {
    try {
      const token = await getToken();
      await grantAttempts(token, id, payload);
      await fetchUsers(); // Refresh to show new limit
    } catch (err: any) {
      alert(err.message || "Failed to grant attempts");
    }
  };

  const filteredUsers = users; // Search is now handled server-side

  const selectedUser =
    users.find((u) => u.id === selectedUserId) ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-cream font-dm text-ink">
      <AdminNav />

      <main className="flex flex-1 overflow-hidden">
        {/* Left: List area */}
        <div
          className="flex flex-1 flex-col overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedUserId(null);
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
            <h1 className="font-poppins text-xl font-bold text-ink">
              Users &amp; Support
            </h1>
            <span className="text-sm text-ink/50">
              {users.length} of {users.length}
            </span>
          </div>

          {/* Search */}
          <div className="border-b border-ink/10 px-6 py-4">
            <UserSearch value={search} onChange={setSearch} />
          </div>

          {/* Content Area */}
          <div className="pt-4">
            {error && (
              <div className="mx-6 mb-4 rounded-lg border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="py-16 text-center text-sm text-ink/40">
                Loading users...
              </div>
            ) : (
              <UserTable
                users={filteredUsers}
                selectedUserId={selectedUserId}
                onSelectUser={setSelectedUserId}
              />
            )}
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