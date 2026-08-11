"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { AdminRole, CreateRoleInput } from "@/types/admin";
import { listRoles, createRole } from "@/lib/api/admin";
import CreateRoleModal from "./CreateRoleModal";

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

  return (
    <>
      <div className="flex h-full flex-col rounded-2xl border border-ink/10 bg-white">
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-ink/10 p-5">
          <div>
            <h2 className="font-poppins text-base font-bold text-ink">Roles</h2>
            <p className="mt-0.5 text-xs text-ink/40">
              {roles.length} configured
            </p>
          </div>
          {canWrite && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-lg border border-violet/30 px-3 py-1.5 text-xs font-medium text-violet transition hover:bg-violet/10"
            >
              Create Role
            </button>
          )}
        </div>

        {/* List Area */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-ink/40">
              Loading...
            </div>
          ) : roles.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet/10">
                <svg
                  className="h-5 w-5 text-violet"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-ink/70">
                No roles configured
              </p>
              <p className="mt-1 text-xs text-ink/40">
                Create a role to define resource permissions.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-ink/5">
              {roles.map((role) => (
                <li
                  key={role.id}
                  className="flex items-center justify-between px-5 py-4 transition hover:bg-sand/40"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {role.label}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-ink/40">
                      {role.slug}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1">
                    {/* Tiny permission summary badges */}
                    {Object.entries(role.permissions).map(
                      ([resource, actions]) =>
                        actions.length > 0 && (
                          <span
                            key={resource}
                            className="rounded bg-violet/10 px-1.5 py-0.5 text-[10px] font-medium text-violet"
                          >
                            {resource.split("_")[0]}:
                            {actions.map((a) => a[0].toUpperCase()).join("")}
                          </span>
                        )
                    )}
                  </div>
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