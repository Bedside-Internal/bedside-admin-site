"use client";

import { Plus, X } from "lucide-react";
import type { ScoringRubricDimension } from "@/types/content";

interface RubricEditorProps {
    dimensions: ScoringRubricDimension[];
    availableDimensions: { label: string }[];
    onChange: (dimensions: ScoringRubricDimension[]) => void;
    error?: string | null;
}

export function RubricEditor({
    dimensions,
    availableDimensions,
    onChange,
    error,
}: RubricEditorProps) {
    const usedLabels = new Set(
        dimensions.map((d) => d.label).filter(Boolean),
    );

    const update = (index: number, patch: Partial<ScoringRubricDimension>) => {
        onChange(
            dimensions.map((d, i) => (i === index ? { ...d, ...patch } : d)),
        );
    };

    return (
        <div>
            <label className="text-xs font-semibold tracking-wider text-mint-600">
                SCORING RUBRIC
            </label>
            <div className="mt-2 space-y-2">
                {dimensions.map((dim, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <select
                            value={dim.label}
                            onChange={(e) => update(i, { label: e.target.value })}
                            className="flex-1 rounded-md border border-ink/10 bg-sand/60 px-3 py-2 text-sm outline-none focus:border-mint-500"
                        >
                            <option value="">Select dimension…</option>
                            {availableDimensions
                                .filter(
                                    (d) => !usedLabels.has(d.label) || d.label === dim.label,
                                )
                                .map((d) => (
                                    <option key={d.label} value={d.label}>
                                        {d.label}
                                    </option>
                                ))}
                        </select>
                        <input
                            type="number"
                            min={0}
                            step={0.5}
                            value={dim.weight}
                            onChange={(e) =>
                                update(i, { weight: parseFloat(e.target.value) || 0 })
                            }
                            className="w-20 rounded-md border border-ink/10 bg-sand/60 px-3 py-2 text-sm outline-none focus:border-mint-500"
                            placeholder="Weight"
                        />
                        <button
                            type="button"
                            onClick={() => onChange(dimensions.filter((_, j) => j !== i))}
                            className="shrink-0 text-ink/40 hover:text-coral-500"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
            {error && <p className="mt-1 text-sm text-coral-500">{error}</p>}
            <button
                type="button"
                onClick={() => onChange([...dimensions, { label: "", weight: 1 }])}
                className="mt-2 text-sm text-mint-600 hover:text-mint-700"
            >
                <Plus className="mr-1 inline h-3.5 w-3.5" />
                Add dimension
            </button>
        </div>
    );
}