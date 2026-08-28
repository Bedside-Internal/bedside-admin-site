"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { AdminUserRow, AdminRole, GrantAdminAccessInput } from "@/types/admin";
import { listAdmins, listRoles, grantAdminAccess, updateAdminAccess, revokeAdminAccess, grantOwnerStatus, revokeOwnerStatus } from "@/lib/api/admin";
import GrantAccessModal from "./GrantAccessModal";

interface AdminsPanelProps {
  canWrite: boolean;
  canDelete: boolean;
  isOwner: boolean;
  selfAdminId: string | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminsPanel({ canWrite, canDelete, isOwner, selfAdminId }: AdminsPanelProps) {
  const { getToken } = useAuth();

  const [admins, setAdmins] = useState<AdminUserRow[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGranting, setIsGranting] = useState(false);

  // Expansion & Editing state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const token = await getToken();
      const [adminsData, rolesData] = await Promise.all([
        listAdmins(token),
        listRoles(token),
      ]);
      setAdmins(adminsData);
      setRoles(rolesData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGrant = async (input: GrantAdminAccessInput) => {
    setIsGranting(true);
    try {
      const token = await getToken();
      await grantAdminAccess(token, input);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to grant access");
    } finally {
      setIsGranting(false);
    }
  };

  const handleRevoke = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to revoke admin access for ${email}?`)) return;
    try {
      const token = await getToken();
      await revokeAdminAccess(token, id);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to revoke access");
    }
  };

  const ownerCount = admins.filter((a) => a.isOwner).length;
  const handleMakeOwner = async (id: string) => {
    try {
      const token = await getToken();
      await grantOwnerStatus(token, id);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to grant owner status");
    }
  };

  const handleRemoveOwner = async (id: string, isLast: boolean) => {
    if (isLast) {
      alert("Can't remove the last owner — make someone else an owner first.");
      return;
    }
    if (!confirm("Remove owner status from this admin?")) return;
    try {
      const token = await getToken();
      await revokeOwnerStatus(token, id);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to revoke owner status");
    }
  };

  const handleTransferOwnership = async (id: string, email: string) => {
    if (!confirm(`Transfer ownership to ${email}? You'll be removed as an owner (your admin access stays).`)) return;
    try {
      const token = await getToken();
      await grantOwnerStatus(token, id);
      if (selfAdminId) await revokeOwnerStatus(token, selfAdminId);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to transfer ownership");
    }
  };

  const handleExpand = (admin: AdminUserRow) => {
    if (expandedId === admin.id) {
      setExpandedId(null);
      setEditRoleId(null);
    } else {
      setExpandedId(admin.id);
      setEditRoleId(admin.roleId);
    }
  };

  const handleSaveRole = async (adminId: string) => {
    if (!editRoleId) return;
    setIsSaving(true);
    try {
      const token = await getToken();
      await updateAdminAccess(token, adminId, { roleId: editRoleId });
      setExpandedId(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to update role");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="flex h-full flex-col rounded-2xl border border-ink/10 bg-white">
        <div className="flex items-center justify-between border-b border-ink/10 p-5">
          <div>
            <h2 className="font-poppins text-base font-bold text-ink">Admin Users</h2>
            <p className="mt-0.5 text-xs text-ink/40">{admins.length} with access</p>
          </div>
          {canWrite && (
            <button onClick={() => setIsModalOpen(true)} className="rounded-lg border border-violet/30 px-3 py-1.5 text-xs font-medium text-violet transition hover:bg-violet/10">
              Grant Access
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-ink/40">Loading...</div>
          ) : admins.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet/10">
                <svg className="h-5 w-5 text-violet" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
              </div>
              <p className="text-sm font-medium text-ink/70">No admin users</p>
              <p className="mt-1 text-xs text-ink/40">Grant console access to a user to get started.</p>
            </div>
          ) : (
            <ul className="divide-y divide-ink/5">
              {admins.map((admin) => (
                <li key={admin.id} className="border-b border-ink/5 last:border-0">
                  <div
                    onClick={() => handleExpand(admin)}
                    className="group flex cursor-pointer items-center justify-between px-5 py-4 transition hover:bg-sand/40"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-ink">{admin.email}</p>
                        {admin.isOwner && (
                          <span className="shrink-0 rounded bg-amber/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber">Owner</span>
                        )}

                        {admin.permissionOverrides && (
                          <span className="shrink-0 rounded bg-amber/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber">Custom</span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="rounded-full bg-violet/10 px-2 py-0.5 text-xs font-medium text-violet">{admin.roleLabel}</span>
                        <span className="text-[11px] text-ink/40">Added {formatDate(admin.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRevoke(admin.id, admin.email);
                          }}
                          className="rounded-lg p-1.5 text-ink/30 opacity-0 transition hover:bg-coral/10 hover:text-coral group-hover:opacity-100"
                          title="Revoke Access"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        </button>
                      )}
                      <svg className={`h-4 w-4 text-ink/30 transition-transform ${expandedId === admin.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded Inline Editor */}
                  {expandedId === admin.id && editRoleId !== null && (
                    <div className="border-t border-ink/10 bg-sand/20 px-5 py-4">
                      <div className="flex items-end gap-4">
                        <div className="flex-1">
                          <label className="mb-1.5 block text-xs font-medium text-ink/60">Assigned Role</label>
                          <select
                            value={editRoleId}
                            onChange={(e) => setEditRoleId(e.target.value)}
                            disabled={!canWrite}
                            className="w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/30 disabled:opacity-50"
                          >
                            {roles.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.label} ({role.slug})
                              </option>
                            ))}
                          </select>
                        </div>
                        {canWrite && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setExpandedId(null)}
                              className="rounded-lg px-4 py-2 text-sm font-medium text-ink/60 transition hover:bg-sand"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveRole(admin.id)}
                              disabled={isSaving || editRoleId === admin.roleId}
                              className="rounded-lg bg-violet px-4 py-2 text-sm font-semibold text-cream transition hover:bg-violet/90 disabled:opacity-50"
                            >
                              {isSaving ? "Saving..." : "Update Role"}
                            </button>
                          </div>
                        )}
                      </div>
                      {isOwner && (
                        <div className="flex gap-2 border-t border-ink/10 pt-3 mt-3">
                          {admin.isOwner ? (
                            <button
                              onClick={() => handleRemoveOwner(admin.id, ownerCount <= 1)}
                              disabled={ownerCount <= 1}
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-coral hover:bg-coral/10 disabled:opacity-40"
                            >
                              Remove owner status
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleMakeOwner(admin.id)}
                                className="rounded-lg px-3 py-1.5 text-xs font-medium text-violet hover:bg-violet/10"
                              >
                                Add as co-owner
                              </button>
                              <button
                                onClick={() => handleTransferOwnership(admin.id, admin.email)}
                                className="rounded-lg px-3 py-1.5 text-xs font-medium text-amber hover:bg-amber/10"
                              >
                                Transfer ownership to them
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <GrantAccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGrant={handleGrant}
        isSubmitting={isGranting}
        roles={roles}
      />
    </>
  );
}