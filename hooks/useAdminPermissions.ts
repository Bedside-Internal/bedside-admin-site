import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { PermissionMatrix, AdminResource, AdminAction } from "@/types/admin";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export function useAdminPermissions() {
  const { getToken, isLoaded } = useAuth();
  
  const [permissions, setPermissions] = useState<PermissionMatrix | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const fetchPermissions = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE_URL}/api/admin/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch admin permissions");
        
        const data = await res.json(); 
        setPermissions(data.permissions);
        setIsOwner(Boolean(data.isOwner));
        setAdminId(data.adminId ?? null);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [isLoaded, getToken]);

  const can = useCallback(
    (resource: AdminResource, action: AdminAction): boolean => {
      if (!permissions) return false;
      return permissions[resource]?.includes(action) ?? false;
    },
    [permissions]
  );

  return { can, isLoading, error, permissions, isOwner, adminId };
}