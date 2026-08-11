"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { User, UpdateUserPayload, GrantAttemptsPayload } from "@/types/user";
import { ApiError, getUsers, updateUser, grantAttempts } from "@/lib/api/users";
import AdminNav from "@/components/layout/AdminNav";
import UserSearch from "@/components/users/UserSearch";
import UserTable from "@/components/users/UserTable";
import UserDetailPanel from "@/components/users/UserDetailPanel";

export default function UsersPage() {
    const { getToken, isLoaded } = useAuth();

    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isForbidden, setIsForbidden] = useState(false);
    const [isPendingSetup, setIsPendingSetup] = useState(false);

    const [search, setSearch] = useState("");
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setIsForbidden(false);
        setIsPendingSetup(false);

        try {
            const token = await getToken();
            const data = await getUsers(token, search);
            setUsers(data);
        } catch (err: any) {
            if (err instanceof ApiError) {
                if (err.status === 403) {
                    setIsForbidden(true);
                    return; // Don't set generic error
                }
                if (err.status === 404) {
                    setIsPendingSetup(true);
                    return; // Don't set generic error
                }
            }
            // Fallback for 500s or generic errors
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
            await fetchUsers();
        } catch (err: any) {
            alert(err.message || "Failed to update user");
        }
    };

    const handleGrant = async (id: string, payload: GrantAttemptsPayload) => {
        try {
            const token = await getToken();
            await grantAttempts(token, id, payload);
            await fetchUsers();
        } catch (err: any) {
            alert(err.message || "Failed to grant attempts");
        }
    };

    const filteredUsers = users;
    const selectedUser = users.find((u) => u.id === selectedUserId) ?? null;

    // --- Specific Error/State UI ---
    if (isForbidden) {
        return (
            <div className="flex min-h-screen flex-col bg-cream font-dm text-ink">
                <AdminNav />
                <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                    <h2 className="font-poppins text-2xl font-bold text-coral">
                        Access Denied
                    </h2>
                    <p className="mt-2 max-w-sm text-sm text-ink/50">
                        You are authenticated, but your account does not have admin
                        permissions to view this page.
                    </p>
                </div>
            </div>
        );
    }

    if (isPendingSetup) {
        return (
            <div className="flex min-h-screen flex-col bg-cream font-dm text-ink">
                <AdminNav />
                <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-mint border-t-transparent" />
                    <h2 className="mt-4 font-poppins text-2xl font-bold text-ink">
                        Setting up your account...
                    </h2>
                    <p className="mt-2 max-w-sm text-sm text-ink/50">
                        This usually resolves in a few moments once your profile syncs.
                    </p>
                </div>
            </div>
        );
    }

    // --- Main UI ---
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