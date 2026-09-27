import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { PermissionMatrix, AdminResource, AdminAction } from "@/types/admin";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

type Status = "loading" | "ready" | "forbidden" | "pending-setup" | "error";

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 800;

export function useAdminPermissions() {
  const { getToken, isLoaded } = useAuth();

  const [permissions, setPermissions] = useState<PermissionMatrix | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const retryCountRef = useRef(0);

  const fetchPermissions = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      // Authenticated, but no admin_users row for this person.
      if (res.status === 403) {
        setStatus("forbidden");
        return;
      }

      // Clerk session exists but the internal `users` row hasn't synced
      // yet (webhook lag on a brand-new signup, essentially never true
      // for someone granted access via the UserCombobox, which only
      // surfaces users who already exist). Self-heal with a few retries
      // instead of forcing a manual refresh
      if (res.status === 404) {
        setStatus("pending-setup");
        if (retryCountRef.current < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * 2 ** retryCountRef.current;
          retryCountRef.current += 1;
          retryTimeoutRef.current = setTimeout(fetchPermissions, delay);
        }
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch admin permissions (${res.status})`);
      }

      const data = await res.json();
      retryCountRef.current = 0;
      setPermissions(data.permissions);
      setIsOwner(Boolean(data.isOwner));
      setAdminId(data.adminId ?? null);
      setError(null);
      setStatus("ready");
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch admin permissions");
      setStatus("error");
    }
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) return;
    retryCountRef.current = 0;
    fetchPermissions();
    return () => clearTimeout(retryTimeoutRef.current);
  }, [isLoaded, fetchPermissions]);

  const can = useCallback(
    (resource: AdminResource, action: AdminAction): boolean => {
      if (!permissions) return false;
      return permissions[resource]?.includes(action) ?? false;
    },
    [permissions],
  );

  return {
    can,
    isOwner,
    adminId,
    isLoading: status === "loading",
    isForbidden: status === "forbidden",
    isPendingSetup: status === "pending-setup",
    error,
    refetch: fetchPermissions,
  };
}