"use client";

import { useAuth } from "@clerk/nextjs";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import AdminNav from "@/components/layout/AdminNav";
import RolesPanel from "@/components/admin-management/RolesPanel";
import AdminsPanel from "@/components/admin-management/AdminsPanel";

export default function AdminManagementPage() {
  const { isLoaded } = useAuth();
  const { can, isLoading: permsLoading, isOwner, adminId } = useAdminPermissions();

  if (!isLoaded || permsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream font-dm text-ink/40">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet border-t-transparent" />
      </div>
    );
  }

  if (!can("admin_management", "read")) {
    return (
      <div className="flex min-h-screen flex-col bg-cream font-dm text-ink">
        <AdminNav />
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <h2 className="font-poppins text-2xl font-bold text-coral">
            Access Denied
          </h2>
          <p className="mt-2 max-w-sm text-sm text-ink/50">
            You do not have permission to view admin management settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream font-dm text-ink">
      <AdminNav />
      
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-8">
          {/* Page Header */}
          <div className="mb-8 flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-poppins text-2xl font-bold text-ink">
                  Scoped Privileges
                </h1>
                <span className="rounded-full bg-violet/15 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-violet">
                  SECURITY
                </span>
              </div>
              <p className="mt-1 text-sm text-ink/50">
                Manage admin roles and console access permissions.
              </p>
            </div>
          </div>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <RolesPanel 
              canWrite={can("admin_management", "write")} 
              canDelete={can("admin_management", "delete")} 
            />
            <AdminsPanel 
              canWrite={can("admin_management", "write")} 
              canDelete={can("admin_management", "delete")} 
              isOwner={isOwner}
              selfAdminId={adminId}
            />
          </div>
        </div>
      </main>
    </div>
  );
}