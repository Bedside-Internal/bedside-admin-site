"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
    "mousedown",
    "mousemove",
    "keydown",
    "scroll",
    "touchstart",
    "wheel",
];

interface UseIdleLogoutOptions {
    /** Minutes of no real interaction before forced sign-out. */
    idleMinutes?: number;
    /** Minutes before that sign-out to show a warning. */
    warnMinutes?: number;
}

export function useIdleLogout({
    idleMinutes = 15,
    warnMinutes = 1,
}: UseIdleLogoutOptions = {}) {
    const { signOut } = useClerk();
    const { isSignedIn } = useUser();
    const [showWarning, setShowWarning] = useState(false);

    const idleTimeoutMs = idleMinutes * 60 * 1000;
    const warnTimeoutMs = (idleMinutes - warnMinutes) * 60 * 1000;

    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const warnTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const signOutNow = useCallback(() => {
        signOut({ redirectUrl: "/sign-in" });
    }, [signOut]);

    const staySignedIn = useCallback(() => {
        setShowWarning(false);
        clearTimeout(idleTimerRef.current);
        clearTimeout(warnTimerRef.current);
        warnTimerRef.current = setTimeout(() => setShowWarning(true), warnTimeoutMs);
        idleTimerRef.current = setTimeout(signOutNow, idleTimeoutMs);
    }, [idleTimeoutMs, warnTimeoutMs, signOutNow]);

    useEffect(() => {
        if (!isSignedIn) return;

        staySignedIn();
        const handleActivity = () => staySignedIn();
        ACTIVITY_EVENTS.forEach((evt) =>
            window.addEventListener(evt, handleActivity, { passive: true }),
        );

        // A backgrounded tab fires none of the above
        const handleVisibility = () => {
            if (document.visibilityState === "visible") staySignedIn();
        };
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handleActivity));
            document.removeEventListener("visibilitychange", handleVisibility);
            clearTimeout(idleTimerRef.current);
            clearTimeout(warnTimerRef.current);
        };
    }, [isSignedIn, staySignedIn]);

    return { showWarning, staySignedIn, signOutNow };
}