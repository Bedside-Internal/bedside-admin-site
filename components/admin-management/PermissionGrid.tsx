"use client";

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

function formatResourceHeader(resource: string): string {
  return resource
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

interface PermissionGridProps {
  permissions: PermissionMatrix;
  onChange: (permissions: PermissionMatrix) => void;
  disabled?: boolean;
}

export default function PermissionGrid({
  permissions,
  onChange,
  disabled = false,
}: PermissionGridProps) {
  const handleToggle = (resource: AdminResource, action: AdminAction) => {
    if (disabled) return;
    const currentActions = permissions[resource] || [];
    const hasAction = currentActions.includes(action);
    
    onChange({
      ...permissions,
      [resource]: hasAction
        ? currentActions.filter((a) => a !== action)
        : [...currentActions, action],
    });
  };

  return (
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
                      disabled={disabled}
                      className="h-4 w-4 cursor-pointer rounded border-ink/20 text-violet focus:ring-violet/30 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}