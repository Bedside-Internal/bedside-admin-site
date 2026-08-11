"use client";

import { useState } from "react";
import { AdminRole, GrantAdminAccessInput } from "@/types/admin";

interface GrantAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGrant: (input: GrantAdminAccessInput) => void;
  isSubmitting: boolean;
  roles: AdminRole[];
}

export default function GrantAccessModal({
  isOpen,
  onClose,
  onGrant,
  isSubmitting,
  roles,
}: GrantAccessModalProps) {
  const [userId, setUserId] = useState("");
  const [roleId, setRoleId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !roleId) return;
    onGrant({ userId, roleId });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-cream p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-poppins text-lg font-bold text-ink">
            Grant Admin Access
          </h3>
          <button
            onClick={onClose}
            className="text-ink/40 transition hover:text-ink"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User ID Input */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink/60">
              User ID (Internal UUID)
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. 1a2b3c4d-..."
              required
              className="w-full rounded-lg border border-ink/10 bg-sand/60 px-3 py-2 font-mono text-sm text-ink placeholder:text-ink/30 focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/30"
            />
            <p className="mt-1 text-[11px] text-ink/40">
              Paste the internal UUID of the user from the Users tab.
            </p>
          </div>

          {/* Role Select */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink/60">
              Assign Role
            </label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              required
              className="w-full rounded-lg border border-ink/10 bg-sand/60 px-3 py-2 text-sm text-ink focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/30"
            >
              <option value="" disabled>
                Select a role...
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label} ({role.slug})
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-ink/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-ink/60 transition hover:bg-sand"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !userId || !roleId}
              className="rounded-lg bg-violet px-4 py-2 text-sm font-semibold text-cream transition hover:bg-violet/90 disabled:opacity-50"
            >
              {isSubmitting ? "Granting..." : "Grant Access"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}