"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const tabs = [
    { label: "Users", href: "/users" },
    { label: "Privileges", href: "/admin-management" },
    { label: "Content", href: "/content" },
    { label: "Features", href: "/features" },
    { label: "Marketing", href: "/marketing" },
];

export default function AdminNav() {
    const pathname = usePathname();
    const { getToken } = useAuth();
    const { signOut } = useClerk();
    const { user } = useUser();
    const { can } = useAdminPermissions();
    const visibleTabs = can("notifications", "read") ? [...tabs, { label: "Notifications", href: "/notifications" }] : tabs;

    const handleSignOut = async () => {
        try {
            const token = await getToken();
            await fetch(`${API_BASE_URL}/api/admin/logout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch {
            // best-effort — a stale admin_sessions row here is harmless
            // housekeeping, not a security gap; see adminSessionService
        } finally {
            signOut({ redirectUrl: "/sign-in" });
        }
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-ink/10 bg-cream">
            <div className="mx-auto flex min-h-14 max-w-8xl flex-wrap items-center justify-between gap-y-2 px-4 py-2 lg:h-14 lg:flex-nowrap lg:py-0">
                <div className="flex items-center gap-3">
                    <span className="font-poppins text-lg font-bold text-ink">
                        Bedside Admin
                    </span>
                    <span className="rounded-full bg-sand px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-ink/50">
                        INTERNAL
                    </span>
                </div>

                <ul className="order-last flex w-full items-center gap-1 overflow-x-auto lg:order-none lg:w-auto">
                    {visibleTabs.map((tab) => {
                        const isActive = pathname === tab.href || pathname?.startsWith(tab.href + "/");
                        return (
                            <li key={tab.href}>
                                <Link
                                    href={tab.href}
                                    className={`relative block whitespace-nowrap px-3 py-4 text-sm font-medium transition-colors ${isActive
                                            ? "text-mint"
                                            : "text-ink/50 hover:text-ink"
                                        }`}
                                >
                                    {tab.label}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-mint" />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <div className="flex items-center gap-3">
                    {user?.primaryEmailAddress?.emailAddress && (
                        <span className="hidden text-sm text-ink/50 sm:inline">
                            {user.primaryEmailAddress.emailAddress}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex items-center gap-1.5 rounded-md border border-ink/15 px-3 py-1.5 text-[13px] font-medium text-ink transition hover:bg-sand"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign out
                    </button>
                </div>
            </div>
        </nav>
    );
}