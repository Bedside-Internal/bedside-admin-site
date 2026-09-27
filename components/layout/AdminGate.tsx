"use client";

import { useAuth } from "@clerk/nextjs";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import AdminNav from "@/components/layout/AdminNav";
import type { AdminResource, AdminAction } from "@/types/admin";
import type { ReactNode } from "react";

type Perms = ReturnType<typeof useAdminPermissions>;

interface AdminGateProps {
    resource: AdminResource;
    action?: AdminAction;
    deniedMessage?: string;
    children: (perms: Perms) => ReactNode;
}

export default function AdminGate({
    resource,
    action = "read",
    deniedMessage = "You do not have permission to view this page.",
    children,
}: AdminGateProps) {
    const { isLoaded } = useAuth();
    const perms = useAdminPermissions();
    const { can, isLoading, isForbidden, isPendingSetup, error } = perms;

    if (!isLoaded || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-cream font-dm text-ink/40">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet border-t-transparent" />
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

    if (isForbidden || !can(resource, action)) {
        return (
            <div className="flex min-h-screen flex-col bg-cream font-dm text-ink">
                <AdminNav />
                <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                    <h2 className="font-poppins text-2xl font-bold text-coral">Access Denied</h2>
                    <p className="mt-2 max-w-sm text-sm text-ink/50">{deniedMessage}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col bg-cream font-dm text-ink">
                <AdminNav />
                <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                    <h2 className="font-poppins text-2xl font-bold text-coral">Something went wrong</h2>
                    <p className="mt-2 max-w-sm text-sm text-ink/50">{error}</p>
                </div>
            </div>
        );
    }

    return <>{children(perms)}</>;
}