"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { listNotifications, createNotification, archiveNotification } from "@/lib/api/notifications";
import type { AdminNotification, CreateNotificationInput } from "@/types/notifications";

const PAGE_SIZE = 20;

export function useNotifications(canWrite: boolean) {
    const { getToken } = useAuth();
    const [listing, setListing] = useState<{ items: AdminNotification[]; page: number }>({ items: [], page: 1 });
    const [requestedPage, setRequestedPage] = useState(1);
    const [failedPage, setFailedPage] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pendingActionId, setPendingActionId] = useState<string | null>(null);
    const busy = useRef(false);
    const loadingRef = useRef(true);
    const requestId = useRef(0);
    const displayedPage = useRef(1);
    const destination = useRef(1);

    const loadPage = useCallback(async (page: number) => {
        const current = ++requestId.current;
        destination.current = page;
        loadingRef.current = true;
        try {
            const token = await getToken();
            if (current !== requestId.current) return;
            setRequestedPage(page); setLoading(true); setError(null); setFailedPage(null);
            const items = await listNotifications(token, page, PAGE_SIZE);
            if (current !== requestId.current) return;
            displayedPage.current = page;
            setListing({ items, page });
        } catch (err) {
            if (current !== requestId.current) return;
            destination.current = displayedPage.current;
            setRequestedPage(displayedPage.current);
            setFailedPage(page);
            setError(`Couldn't load notification page ${page}. ${err instanceof Error ? err.message : "Please try again."}`);
        } finally {
            if (current === requestId.current) { loadingRef.current = false; setLoading(false); }
        }
    }, [getToken]);

    useEffect(() => {
        let cancelled = false;
        const requests = requestId;
        Promise.resolve().then(() => { if (!cancelled) void loadPage(1); });
        return () => { cancelled = true; requests.current++; };
    }, [loadPage]);

    function changePage(direction: -1 | 1) {
        if (busy.current) return;
        void loadPage(Math.max(1, destination.current + direction));
    }

    function retry() {
        if (!busy.current && failedPage !== null) void loadPage(failedPage);
    }

    const create = useCallback(async (input: CreateNotificationInput) => {
        if (!canWrite) throw new Error("You do not have permission to send notifications.");
        if (busy.current || loadingRef.current) throw new Error("Please wait for the current request to finish.");
        busy.current = true;
        setPendingActionId("create");
        try {
            const item = await createNotification(await getToken(), input);
            await loadPage(displayedPage.current);
            return item;
        } finally { busy.current = false; setPendingActionId(null); }
    }, [getToken, canWrite, loadPage]);

    const archive = useCallback(async (id: string) => {
        if (!canWrite || busy.current || loadingRef.current) return;
        busy.current = true;
        setPendingActionId(id);
        setError(null);
        try {
            const item = await archiveNotification(await getToken(), id);
            setListing((previous) => ({ ...previous, items: previous.items.map((row) => row.id === id ? item : row) }));
            await loadPage(displayedPage.current);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Couldn't archive the notification.");
        } finally { busy.current = false; setPendingActionId(null); }
    }, [getToken, canWrite, loadPage]);

    return { ...listing, requestedPage, failedPage, loading, error, pendingActionId, create, archive, changePage, retry };
}
