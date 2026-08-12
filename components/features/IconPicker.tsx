"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { iconRegistry, resolveIcon, iconKeys } from "@/lib/iconRegistry";

interface IconPickerProps {
  value: string;
  onChange: (key: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return iconKeys.slice(0, 80);
    const lower = query.toLowerCase();
    return iconKeys.filter((k) => k.includes(lower)).slice(0, 80);
  }, [query]);

  const SelectedIcon = resolveIcon(value);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-[200px]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-left text-[13px] font-dm text-ink"
      >
        <SelectedIcon size={16} className="flex-shrink-0 text-mint" />
        <span className="truncate">{value || "help-circle"}</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-lg">
          <div className="border-b border-ink/10 px-2 py-1.5">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search icons…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border-none bg-transparent py-1 text-[13px] font-dm text-ink outline-none"
            />
          </div>
          <div className="max-h-[260px] overflow-y-auto py-1">
            {filtered.length === 0 && (
              <div className="px-4 py-3 text-center text-[13px] text-ink/40">
                No icons found
              </div>
            )}
            {filtered.map((key) => {
              const Icon = iconRegistry[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-[13px] font-dm text-ink transition-colors hover:bg-sand ${
                    value === key ? "bg-sand" : ""
                  }`}
                >
                  <Icon size={16} className="flex-shrink-0 text-mint" />
                  <span className="truncate">{key}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}