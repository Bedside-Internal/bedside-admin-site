"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/http";

/**
 * Safety net: if an API error ever escapes a component without being caught,
 * show it as a toast instead of failing silently. (Production builds have no
 * error overlay, so without this the admin would just see nothing happen.)
 * Mount once in the root layout.
 */
export default function GlobalErrorToaster() {
    useEffect(() => {
        const onRejection = (event: PromiseRejectionEvent) => {
            if (!(event.reason instanceof ApiError)) return;
            event.preventDefault();
            toast.error(event.reason.message);
        };
        window.addEventListener("unhandledrejection", onRejection);
        return () => window.removeEventListener("unhandledrejection", onRejection);
    }, []);
    return null;
}
