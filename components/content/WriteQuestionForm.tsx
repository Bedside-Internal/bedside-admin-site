"use client";

import { useState, useMemo } from "react";
import type { Format, Section, Dimension, ScoringRubricDimension, CreateQuestionInput } from "@/types/content";
import { RubricEditor } from "./RubricEditor";

interface WriteQuestionFormProps {
    formats: Format[];
    sections: Section[];
    dimensions: Dimension[];
    initialData?: {
        scenarioText: string;
        guidanceNote: string;
        modelAnswer: string;
        rubricDimensions: ScoringRubricDimension[];
    };
    initialMeta?: {
        sectionId?: string;
        difficulty?: "easy" | "medium" | "hard";
        source: "manual" | "ai_generated";
        aiModel?: string;
        sourceSubmissionId?: string;
    };
    onSubmit: (data: CreateQuestionInput) => Promise<void>;
    onCancel: () => void;
}

export function WriteQuestionForm({
    formats,
    sections,
    dimensions,
    initialData,
    initialMeta,
    onSubmit,
    onCancel,
}: WriteQuestionFormProps) {
    const [sectionId, setSectionId] = useState(initialMeta?.sectionId ?? "");
    const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
        initialMeta?.difficulty ?? "easy",
    );
    const [scenarioText, setScenarioText] = useState(
        initialData?.scenarioText ?? "",
    );
    const [guidanceNote, setGuidanceNote] = useState(
        initialData?.guidanceNote ?? "",
    );
    const [modelAnswer, setModelAnswer] = useState(
        initialData?.modelAnswer ?? "",
    );
    const [rubricDims, setRubricDims] = useState<ScoringRubricDimension[]>(
        initialData?.rubricDimensions ?? [{ label: "", weight: 1 }],
    );
    const [rubricError, setRubricError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const activeFormats = formats.filter((f) => !f.killed);
    const activeSections = sections.filter((s) => !s.killed);

    const availableDimensions = useMemo(() => {
        const sec = sections.find((s) => s.id === sectionId);
        if (!sec) return [];
        return dimensions
            .filter((d) => d.formatId === sec.formatId && !d.killed)
            .map((d) => ({ label: d.label }));
    }, [sectionId, sections, dimensions]);

    const handleSubmit = async (isActive: boolean) => {
        if (!sectionId) return;
        setRubricError(null);
        setSubmitting(true);
        try {
            await onSubmit({
                sectionId,
                difficulty,
                isActive,
                scenarioText,
                guidanceNote,
                modelAnswer,
                scoringRubric: { dimensions: rubricDims },
                source: initialMeta?.source ?? "manual",
                aiModel: initialMeta?.aiModel,
                sourceSubmissionId: initialMeta?.sourceSubmissionId,
            });
        } catch (err: any) {
            if (err?.status === 422) {
                setRubricError(err?.message || "Validation error in scoring rubric.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const textareaClass =
        "w-full rounded-lg border border-ink/10 bg-sand/60 px-4 py-3 text-sm outline-none focus:border-mint-500 placeholder:text-ink/30";
    const selectClass =
        "rounded-md border border-ink/10 bg-sand/60 px-3 py-2 text-sm outline-none focus:border-mint-500";

    return (
        <div>
            <label className="text-xs font-semibold tracking-wider text-mint-600">
                {initialMeta?.source === "ai_generated"
                    ? "REVIEW AI DRAFT"
                    : "NEW QUESTION"}
            </label>

            {/* Row: section + difficulty */}
            <div className="mt-4 flex items-end gap-4">
                <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-ink/50">
                        Section
                    </label>
                    <select
                        className={`w-full ${selectClass}`}
                        value={sectionId}
                        onChange={(e) => {
                            setSectionId(e.target.value);
                            setRubricDims([{ label: "", weight: 1 }]);
                            setRubricError(null);
                        }}
                    >
                        <option value="">Select section…</option>
                        {activeFormats.map((f) => {
                            const fmtSections = activeSections.filter(
                                (s) => s.formatId === f.id,
                            );
                            if (fmtSections.length === 0) return null;
                            return (
                                <optgroup key={f.id} label={f.title}>
                                    {fmtSections.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.title}
                                        </option>
                                    ))}
                                </optgroup>
                            );
                        })}
                    </select>
                </div>
                <div className="w-40">
                    <label className="mb-1 block text-xs font-medium text-ink/50">
                        Difficulty
                    </label>
                    <select
                        className={`w-full ${selectClass}`}
                        value={difficulty}
                        onChange={(e) =>
                            setDifficulty(e.target.value as "easy" | "medium" | "hard")
                        }
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
            </div>

            {/* Textareas */}
            <div className="mt-6 space-y-4">
                <div>
                    <label className="mb-1 block text-xs font-medium text-ink/50">
                        Scenario
                    </label>
                    <textarea
                        className={textareaClass}
                        rows={5}
                        value={scenarioText}
                        onChange={(e) => setScenarioText(e.target.value)}
                        placeholder="Describe the scenario the candidate will see…"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-ink/50">
                        Guidance note
                    </label>
                    <textarea
                        className={textareaClass}
                        rows={3}
                        value={guidanceNote}
                        onChange={(e) => setGuidanceNote(e.target.value)}
                        placeholder="Any guidance for the candidate…"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-ink/50">
                        Model answer
                    </label>
                    <textarea
                        className={textareaClass}
                        rows={5}
                        value={modelAnswer}
                        onChange={(e) => setModelAnswer(e.target.value)}
                        placeholder="The expected model answer…"
                    />
                </div>
            </div>

            {/* Rubric */}
            <div className="mt-6">
                <RubricEditor
                    dimensions={rubricDims}
                    availableDimensions={availableDimensions}
                    onChange={(d) => {
                        setRubricDims(d);
                        setRubricError(null);
                    }}
                    error={rubricError}
                />
            </div>

            {/* Footer */}
            <div className="mt-8 flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => handleSubmit(true)}
                    disabled={submitting || !sectionId}
                    className="rounded-md border border-mint-500 px-4 py-2 text-sm font-medium text-mint-600 hover:bg-mint-50 disabled:opacity-40"
                >
                    {submitting ? "Publishing…" : "Publish"}
                </button>
                <button
                    type="button"
                    onClick={() => handleSubmit(false)}
                    disabled={submitting || !sectionId}
                    className="rounded-md border border-ink/10 px-4 py-2 text-sm font-medium text-ink/60 hover:bg-ink/5 disabled:opacity-40"
                >
                    {submitting ? "Saving…" : "Save as draft"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-sm text-mint-600 hover:text-mint-700"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}