"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { User, UpdateUserPayload, GrantAttemptsPayload } from "@/types/user";
import { getUsers, updateUser, grantAttempts } from "@/lib/api/users";
import AdminGate from "@/components/layout/AdminGate";
import AdminNav from "@/components/layout/AdminNav";
import UserSearch from "@/components/users/UserSearch";
import UserTable from "@/components/users/UserTable";
import UserDetailPanel from "@/components/users/UserDetailPanel";
import AccountDeletionsModal from "@/components/users/AccountDeletionsModal";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 20;

function UsersPageContent() {
    const { getToken } = useAuth();

    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const [showDeletionsModal, setShowDeletionsModal] = useState(false);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const token = await getToken();
            const { users: data, total } = await getUsers(token, search, page, PAGE_SIZE);
            setUsers(data);
            setTotal(total);
        } catch (err: any) {
            // AdminGate already vets read access to this page before we ever get
            // here — a failure at this point (search 400s, transient 500s, a
            // permission revoked mid-session) is the generic case, same as every
            // other page's data-fetching hooks.
            setError(err.message || "Failed to load users");
        } finally {
            setIsLoading(false);
        }
    }, [getToken, search, page]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // reset to page 1 whenever the search term changes
    useEffect(() => {
        setPage(1);
    }, [search]);

    const handleUpdate = async (id: string, payload: UpdateUserPayload) => {
        try {
            const token = await getToken();
            await updateUser(token, id, payload);
            await fetchUsers();
        } catch (err: any) {
            toast.error(err.message || "Failed to update user");
        }
    };

    const handleGrant = async (id: string, payload: GrantAttemptsPayload) => {
        try {
            const token = await getToken();
            await grantAttempts(token, id, payload);
            await fetchUsers();
        } catch (err: any) {
            toast.error(err.message || "Failed to grant attempts");
        }
    };

    const filteredUsers = users;
    const selectedUser = users.find((u) => u.id === selectedUserId) ?? null;

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
                            {total === 0 ? "0 results" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`}
                        </span>
                        <button
                            onClick={() => setShowDeletionsModal(true)}
                            className="rounded-md border border-ink/15 px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-sand"
                        >
                            Account deletions
                        </button>
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

                        {!isLoading && total > PAGE_SIZE && (
                            <div className="flex items-center justify-between border-t border-ink/10 px-6 py-3">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex items-center gap-1 rounded-md border border-ink/15 px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                    Previous
                                </button>
                                <span className="text-sm text-ink/50">
                                    Page {page} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}
                                </span>
                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={page * PAGE_SIZE >= total}
                                    className="flex items-center gap-1 rounded-md border border-ink/15 px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
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
            {showDeletionsModal && <AccountDeletionsModal onClose={() => setShowDeletionsModal(false)} />}
        </div>
    );
}

export default function UsersPage() {
    return (
        <AdminGate
            resource="users"
            deniedMessage="You are authenticated, but your account does not have admin permissions to view this page."
        >
            {() => <UsersPageContent />}
        </AdminGate>
    );
}