"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { getUsers } from "@/lib/api/users";
import type { User } from "@/types/user";

interface UserComboboxProps {
    onSelect: (user: User) => void;
}

export default function UserCombobox({ onSelect }: UserComboboxProps) {
    const { getToken } = useAuth();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<User[]>([]);
    const [selected, setSelected] = useState<User | undefined>(undefined);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        if (selected || query.trim().length < 2) {
            setResults([]);
            return;
        }
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            const token = await getToken();
            const users = await getUsers(token, query.trim());
            setResults(users);
            setOpen(true);
        }, 250);
        return () => clearTimeout(debounceRef.current);
    }, [query, selected, getToken]);

    if (selected) {
        return (
            <div className="flex items-center justify-between rounded-lg border border-mint/30 bg-mint/10 px-3 py-2 text-sm">
                <div>
                    <p className="font-medium text-ink">{selected.firstName} {selected.lastName}</p>
                    <p className="text-xs text-ink/50">{selected.email}</p>
                </div>
                <button
                    type="button"
                    onClick={() => { setSelected(undefined); setQuery(""); }}
                    className="text-xs text-ink/40 hover:text-ink"
                >
                    Change
                </button>
            </div>
        );
    }

    return (
        <div className="relative">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, UUID, or Clerk ID"
                className="w-full rounded-lg border border-ink/10 bg-sand/60 px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/30"
            />
            {open && results.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-ink/10 bg-white shadow-lg">
                    {results.map((u) => (
                        <li
                            key={u.id}
                            onClick={() => { setSelected(u); onSelect(u); setOpen(false); }}
                            className="cursor-pointer px-3 py-2 text-sm hover:bg-sand/60"
                        >
                            <p className="font-medium text-ink">{u.firstName} {u.lastName}</p>
                            <p className="text-xs text-ink/50">{u.email}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}