"use client";

import { useState } from "react";
import { AdminResource, AdminAction, PermissionMatrix } from "@/types/admin";

const RESOURCES: AdminResource[] = [
  "users",
  "content",
  "ai_generation",
  "feature_flags",
  "billing",
  "admin_management",
];

const ACTIONS: AdminAction[] = ["read", "write", "delete"];

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: {
    slug: string;
    label: string;
    permissions: PermissionMatrix;
  }) => void;
  isSubmitting: boolean;
}

function formatResourceHeader(resource: string): string {
  return resource
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function CreateRoleModal({
  isOpen,
  onClose,
  onCreate,
  isSubmitting,
}: CreateRoleModalProps) {
  const [label, setLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [permissions, setPermissions] = useState<PermissionMatrix>(
    () => {
      // Initialize empty matrix
      const init = {} as PermissionMatrix;
      RESOURCES.forEach((r) => (init[r] = []));
      return init;
    }
  );

  const handleToggle = (resource: AdminResource, action: AdminAction) => {
    setPermissions((prev) => {
      const currentActions = prev[resource] || [];
      const hasAction = currentActions.includes(action);
      return {
        ...prev,
        [resource]: hasAction
          ? currentActions.filter((a) => a !== action)
          : [...currentActions, action],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ slug: slug || label.toLowerCase().replace(/\s+/g, "-"), label, permissions });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-cream p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-poppins text-lg font-bold text-ink">
            Create New Role
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meta Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink/60">
                Display Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Content Manager"
                required
                className="w-full rounded-lg border border-ink/10 bg-sand/60 px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/30"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink/60">
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. content_manager (auto-fills)"
                className="w-full rounded-lg border border-ink/10 bg-sand/60 px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/30"
              />
            </div>
          </div>

          {/* Permission Matrix */}
          <div>
            <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-ink/50">
              Permissions Matrix
            </label>
            <div className="overflow-x-auto rounded-lg border border-ink/10">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/10 bg-sand/40">
                    <th className="px-4 py-2.5 text-xs font-medium text-ink/50">
                      Action
                    </th>
                    {RESOURCES.map((r) => (
                      <th
                        key={r}
                        className="px-3 py-2.5 text-center text-xs font-medium text-ink/50"
                      >
                        <span className="inline-block max-w-[80px] truncate">
                          {formatResourceHeader(r)}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ACTIONS.map((action) => (
                    <tr
                      key={action}
                      className="border-b border-ink/5 last:border-0"
                    >
                      <td className="px-4 py-2.5 capitalize text-ink/70">
                        {action}
                      </td>
                      {RESOURCES.map((resource) => {
                        const isChecked = permissions[resource]?.includes(action);
                        return (
                          <td key={resource} className="px-3 py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggle(resource, action)}
                              className="h-4 w-4 cursor-pointer rounded border-ink/20 text-violet focus:ring-violet/30"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
              disabled={isSubmitting || !label}
              className="rounded-lg bg-violet px-4 py-2 text-sm font-semibold text-cream transition hover:bg-violet/90 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}