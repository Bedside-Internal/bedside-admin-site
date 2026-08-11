"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { AdminRole, PermissionMatrix, CreateRoleInput } from "@/types/admin";
import { listRoles, createRole, updateRole } from "@/lib/api/admin";
import CreateRoleModal from "./CreateRoleModal";
import PermissionGrid from "./PermissionGrid";

interface RolesPanelProps {
  canWrite: boolean;
  canDelete: boolean;
}

export default function RolesPanel({ canWrite }: RolesPanelProps) {
  const { getToken } = useAuth();
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Expansion & Editing state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editPerms, setEditPerms] = useState<PermissionMatrix | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      const token = await getToken();
      const data = await listRoles(token);
      setRoles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleCreate = async (input: CreateRoleInput) => {
    setIsCreating(true);
    try {
      const token = await getToken();
      await createRole(token, input);
      setIsModalOpen(false);
      fetchRoles();
    } catch (err: any) {
      alert(err.message || "Failed to create role");
    } finally {
      setIsCreating(false);
    }
  };

  const handleExpand = (role: AdminRole) => {
    if (expandedId === role.id) {
      setExpandedId(null);
      setEditPerms(null);
    } else {
      setExpandedId(role.id);
      setEditPerms({ ...role.permissions }); // Deep copy for local editing
    }
  };

  const handleSavePerms = async (roleId: string) => {
    if (!editPerms) return;
    setIsSaving(true);
    try {
      const token = await getToken();
      await updateRole(token, roleId, { permissions: editPerms });
      setExpandedId(null);
      fetchRoles();
    } catch (err: any) {
      alert(err.message || "Failed to update permissions");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="flex h-full flex-col rounded-2xl border border-ink/10 bg-white">
        <div className="flex items-center justify-between border-b border-ink/10 p-5">
          <div>
            <h2 className="font-poppins text-base font-bold text-ink">Roles</h2>
            <p className="mt-0.5 text-xs text-ink/40">{roles.length} configured</p>
          </div>
          {canWrite && (
            <button onClick={() => setIsModalOpen(true)} className="rounded-lg border border-violet/30 px-3 py-1.5 text-xs font-medium text-violet transition hover:bg-violet/10">
              Create Role
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-ink/40">Loading...</div>
          ) : roles.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet/10">
                <svg className="h-5 w-5 text-violet" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
              </div>
              <p className="text-sm font-medium text-ink/70">No roles configured</p>
              <p className="mt-1 text-xs text-ink/40">Create a role to define resource permissions.</p>
            </div>
          ) : (
            <ul className="divide-y divide-ink/5">
              {roles.map((role) => (
                <li key={role.id} className="border-b border-ink/5 last:border-0">
                  <div
                    onClick={() => handleExpand(role)}
                    className="flex cursor-pointer items-center justify-between px-5 py-4 transition hover:bg-sand/40"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">{role.label}</p>
                      <p className="mt-0.5 font-mono text-xs text-ink/40">{role.slug}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden gap-1 sm:flex">
                        {Object.entries(role.permissions).map(([resource, actions]) =>
                          actions.length > 0 ? (
                            <span key={resource} className="rounded bg-violet/10 px-1.5 py-0.5 text-[10px] font-medium text-violet">
                              {resource.split("_")[0]}:{actions.map((a) => a[0].toUpperCase()).join("")}
                            </span>
                          ) : null
                        )}
                      </div>
                      <svg className={`h-4 w-4 text-ink/30 transition-transform ${expandedId === role.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded Inline Editor */}
                  {expandedId === role.id && editPerms && (
                    <div className="border-t border-ink/10 bg-sand/20 px-5 py-4">
                      <PermissionGrid
                        permissions={editPerms}
                        onChange={setEditPerms}
                        disabled={!canWrite}
                      />
                      {canWrite && (
                        <div className="mt-4 flex justify-end gap-3">
                          <button
                            onClick={() => setExpandedId(null)}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-ink/60 transition hover:bg-sand"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSavePerms(role.id)}
                            disabled={isSaving}
                            className="rounded-lg bg-violet px-4 py-2 text-sm font-semibold text-cream transition hover:bg-violet/90 disabled:opacity-50"
                          >
                            {isSaving ? "Saving..." : "Update Permissions"}
                          </button>
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

      <CreateRoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
        isSubmitting={isCreating}
      />
    </>
  );
}