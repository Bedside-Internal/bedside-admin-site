"use client";

import { useId, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { searchNotificationRecipients } from "@/lib/api/notifications";
import { userLabel } from "@/lib/notifications/form";
import type { NotificationRecipient } from "@/types/notifications";

export default function NotificationUserPicker({ value, onChange, disabled }: { value: NotificationRecipient | null; onChange: (user: NotificationRecipient | null) => void; disabled: boolean }) {
    const { getToken } = useAuth();
    const id = useId();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<NotificationRecipient[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);
    const [searching, setSearching] = useState(false);
    const generation = useRef(0);

    async function search() {
        if (disabled || query.trim().length < 2) return;
        const current = ++generation.current;
        setSearching(true); setError(null); setSearched(false);
        try {
            const data = await searchNotificationRecipients(await getToken(), query.trim(), 1, 20);
            if (current === generation.current) { setResults(data.users); setSearched(true); }
        } catch (err) {
            if (current === generation.current) setError(err instanceof Error ? err.message : "Couldn't search users.");
        } finally { if (current === generation.current) setSearching(false); }
    }

    if (value) return <div className="flex items-center justify-between gap-3 rounded-lg border border-mint/30 bg-mint/10 px-3 py-2 text-sm">
        <div className="min-w-0"><p className="break-words font-medium">{userLabel(value)}</p><p className="break-all text-xs text-ink/60">{value.email}</p><p className="break-all text-xs text-ink/60">{value.id}</p></div>
        <button type="button" disabled={disabled} onClick={() => { generation.current++; onChange(null); setResults([]); setSearched(false); setQuery(""); }} className="shrink-0 rounded px-2 py-1 text-xs underline disabled:opacity-40">Change user</button>
    </div>;

    return <div>
        <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium">Find a user</label>
        <div className="flex gap-2">
            <input id={id} value={query} maxLength={255} disabled={disabled} placeholder="Name, email, UUID, or Clerk ID"
                onChange={(event) => { generation.current++; setQuery(event.target.value); setResults([]); setSearched(false); setSearching(false); setError(null); }}
                onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void search(); } }}
                className="min-w-0 flex-1 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-mint" />
            <button type="button" disabled={disabled || searching || query.trim().length < 2} onClick={() => void search()} className="rounded-md border border-ink/15 px-3 py-2 text-sm hover:bg-sand disabled:opacity-40">{searching ? "Searching…" : "Search"}</button>
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-coral">{error}</p>}
        {searched && results.length === 0 && <p role="status" className="mt-2 text-sm text-ink/60">No matching users.</p>}
        {results.length > 0 && <ul aria-label="Matching users" className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-ink/10 bg-white">
            {results.map((user) => <li key={user.id}><button type="button" disabled={disabled} onClick={() => { generation.current++; onChange(user); setResults([]); }} className="w-full px-3 py-2 text-left text-sm hover:bg-sand focus-visible:outline-2 focus-visible:outline-mint">
                <span className="block break-words font-medium">{userLabel(user)}</span><span className="block break-all text-xs text-ink/60">{user.email}</span><span className="block break-all text-xs text-ink/60">{user.id}</span>
            </button></li>)}
        </ul>}
    </div>;
}
