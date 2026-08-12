"use client";

import type { QuestionListItem } from "@/types/content";

interface ContentTableProps {
    questions: QuestionListItem[];
    onToggleActive: (id: string, isActive: boolean) => void;
}

function DifficultyPill({ difficulty }: { difficulty: string }) {
    const base =
        "inline-block rounded-full px-2 py-0.5 text-xs font-medium";
    if (difficulty === "hard") {
        return (
            <span className={`${base} bg-mint-100 text-mint-700`}>{difficulty}</span>
        );
    }
    return (
        <span className={`${base} border border-ink/20 text-ink/60`}>
            {difficulty}
        </span>
    );
}

export function ContentTable({
    questions,
    onToggleActive,
}: ContentTableProps) {
    if (questions.length === 0) {
        return (
            <div className="rounded-lg border border-ink/10 py-12 text-center text-sm text-ink/40">
                No questions match the current filters.
            </div>
        );
    }

    const sorted = [...questions].sort((a, b) => {
        const fc = a.formatTitle.localeCompare(b.formatTitle);
        if (fc !== 0) return fc;
        return a.sectionTitle.localeCompare(b.sectionTitle);
    });

    return (
        <div className="overflow-x-auto rounded-lg border border-ink/10">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-ink/10 text-left text-xs font-semibold tracking-wider text-ink/50">
                        <th className="px-4 py-3">FORMAT</th>
                        <th className="px-4 py-3">SECTION</th>
                        <th className="px-4 py-3">DIFFICULTY</th>
                        <th className="px-4 py-3">ACTIVE</th>
                        <th className="px-4 py-3">CONTENT</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((q, i) => {
                        const prevFmt = i > 0 ? sorted[i - 1].formatTitle : null;
                        const showFmt = q.formatTitle !== prevFmt;
                        return (
                            <tr
                                key={q.id}
                                className="border-b border-ink/5 last:border-0"
                            >
                                <td className="px-4 py-3 font-medium">
                                    {showFmt ? q.formatTitle : ""}
                                </td>
                                <td className="px-4 py-3 text-ink/70">{q.sectionTitle}</td>
                                <td className="px-4 py-3">
                                    <DifficultyPill difficulty={q.difficulty} />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={q.isActive}
                                        onChange={(e) => onToggleActive(q.id, e.target.checked)}
                                        className="h-4 w-4 rounded border-ink/20 text-mint-600 focus:ring-mint-500"
                                    />
                                </td>
                                <td className="px-4 py-3 text-ink/50">
                                    {[
                                        q.hasScenario && "scenario",
                                        q.rubricDimensionCount > 0 &&
                                        `rubric ×${q.rubricDimensionCount}`,
                                    ]
                                        .filter(Boolean)
                                        .join(" · ") || "—"}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}