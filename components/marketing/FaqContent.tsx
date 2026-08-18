"use client";

import { useState } from "react";
import { Plus, ChevronUp, ChevronDown } from "lucide-react";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useFaqEntries } from "@/hooks/useFaqEntries";
import type { AdminFaqEntry } from "@/types/marketing";

export default function FaqContent() {
    const { can } = useAdminPermissions();
    const { items, loading, error, clearError, add, update, remove, move } = useFaqEntries();

    const canWrite = can("marketing", "write");
    const canDelete = can("marketing", "delete");

    const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);

    const handleAdd = () => {
        add({ question: "New question", answer: "Placeholder answer — edit me.", enabled: true });
    };

    return (
        <>
            {error && (
                <div className="mb-4 flex items-center justify-between rounded-md bg-coral/10 px-4 py-2.5 text-[13px] text-coral">
                    <span>{error}</span>
                    <button onClick={clearError} className="text-coral/60 hover:text-coral">×</button>
                </div>
            )}

            <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-mint">
                    FAQ entries
                </span>
                <span className="text-[13px] text-ink/40">
                    {items.length} FAQ{items.length !== 1 ? "s" : ""}
                </span>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-32 animate-pulse rounded-lg border border-ink/10 bg-ink/5" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="rounded-lg border border-ink/10 bg-white px-3 py-8 text-center text-[13px] text-ink/30">
                    No FAQs yet — add one to show it on the homepage.
                </div>
            ) : (
                <div className="space-y-4">
                    {sorted.map((entry, idx) => (
                        <FaqRow
                            key={entry.id}
                            entry={entry}
                            isFirst={idx === 0}
                            isLast={idx === sorted.length - 1}
                            canWrite={canWrite}
                            canDelete={canDelete}
                            onMove={move}
                            onUpdate={(input) => update(entry.id, input)}
                            onDelete={() => remove(entry.id)}
                        />
                    ))}
                </div>
            )}

            {canWrite && (
                <button
                    onClick={handleAdd}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-ink/15 px-4 py-1.5 text-[13px] font-medium text-ink transition-colors hover:bg-sand/60"
                >
                    <Plus size={15} />
                    Add FAQ
                </button>
            )}
        </>
    );
}

function FaqRow({
    entry,
    isFirst,
    isLast,
    canWrite,
    canDelete,
    onMove,
    onUpdate,
    onDelete,
}: {
    entry: AdminFaqEntry;
    isFirst: boolean;
    isLast: boolean;
    canWrite: boolean;
    canDelete: boolean;
    onMove: (id: string, direction: "up" | "down") => void;
    onUpdate: (input: { question?: string; answer?: string }) => void;
    onDelete: () => void;
}) {
    const [question, setQuestion] = useState(entry.question);
    const [answer, setAnswer] = useState(entry.answer);

    return (
        <div className="rounded-lg border border-ink/10 bg-white p-6">
            <div className="flex gap-4">
                {canWrite && (
                    <div className="flex flex-col items-center gap-0.5 pt-1">
                        <button
                            onClick={() => onMove(entry.id, "up")}
                            disabled={isFirst}
                            className="text-mint transition-colors hover:text-mint-hover disabled:cursor-not-allowed disabled:text-ink/15"
                        >
                            <ChevronUp size={16} />
                        </button>
                        <button
                            onClick={() => onMove(entry.id, "down")}
                            disabled={isLast}
                            className="text-mint transition-colors hover:text-mint-hover disabled:cursor-not-allowed disabled:text-ink/15"
                        >
                            <ChevronDown size={16} />
                        </button>
                    </div>
                )}

                <div className="flex-1 space-y-3">
                    <div>
                        <label className="mb-1.5 block text-[13px] text-ink/60">Question</label>
                        <input
                            type="text"
                            value={question}
                            disabled={!canWrite}
                            onChange={(e) => setQuestion(e.target.value)}
                            onBlur={() => {
                                const trimmed = question.trim();
                                if (!trimmed) { setQuestion(entry.question); return; }
                                if (trimmed !== entry.question) onUpdate({ question: trimmed });
                            }}
                            className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm font-dm text-ink outline-none transition-colors focus:border-mint disabled:bg-sand/40"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-[13px] text-ink/60">Answer</label>
                        <textarea
                            rows={3}
                            value={answer}
                            disabled={!canWrite}
                            onChange={(e) => setAnswer(e.target.value)}
                            onBlur={() => {
                                const trimmed = answer.trim();
                                if (!trimmed) { setAnswer(entry.answer); return; }
                                if (trimmed !== entry.answer) onUpdate({ answer: trimmed });
                            }}
                            className="w-full resize-y rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm font-dm text-ink outline-none transition-colors focus:border-mint disabled:bg-sand/40"
                        />
                    </div>
                </div>

                {canDelete && (
                    <button
                        onClick={onDelete}
                        className="h-fit whitespace-nowrap text-[13px] font-medium text-coral hover:brightness-110"
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
}