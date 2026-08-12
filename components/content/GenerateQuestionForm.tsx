"use client";

import { useState } from "react";
import type { Format, Section, AiModel, AiCredits } from "@/types/content";

interface GenerateQuestionFormProps {
  formats: Format[];
  sections: Section[];
  models: AiModel[];
  credits: AiCredits | null;
  generating: boolean;
  onGenerate: (data: {
    sectionId: string;
    difficulty: string;
    model: string;
    topic: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export function GenerateQuestionForm({
  formats,
  sections,
  models,
  credits,
  generating,
  onGenerate,
  onCancel,
}: GenerateQuestionFormProps) {
  const [sectionId, setSectionId] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [model, setModel] = useState("");
  const [topic, setTopic] = useState("");

  const activeFormats = formats.filter((f) => !f.killed);
  const activeSections = sections.filter((s) => !s.killed);

  const handleGenerate = async () => {
    if (!sectionId || !model || !topic.trim()) return;
    await onGenerate({ sectionId, difficulty, model, topic: topic.trim() });
  };

  const selectClass =
    "rounded-md border border-ink/10 bg-sand/60 px-3 py-2 text-sm outline-none focus:border-mint-500";
  const textareaClass =
    "w-full rounded-lg border border-ink/10 bg-sand/60 px-4 py-3 text-sm outline-none focus:border-mint-500 placeholder:text-ink/30";

  return (
    <div>
      <label className="text-xs font-semibold tracking-wider text-mint-600">
        GENERATE WITH AI
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
            onChange={(e) => setSectionId(e.target.value)}
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
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* AI model */}
      <div className="mt-4">
        <label className="mb-1 block text-xs font-medium text-ink/50">
          AI model
        </label>
        <select
          className={`w-full max-w-xs ${selectClass}`}
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="">Select model…</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
              {m.contextLength ? ` (${(m.contextLength / 1000).toFixed(0)}k ctx)` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Topic */}
      <div className="mt-4">
        <label className="mb-1 block text-xs font-medium text-ink/50">
          Topic / brief
        </label>
        <textarea
          className={textareaClass}
          rows={4}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. pricing strategy for a subscription SaaS product"
        />
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || !sectionId || !model || !topic.trim()}
          className="rounded-md border border-mint-500 px-4 py-2 text-sm font-medium text-mint-600 hover:bg-mint-50 disabled:opacity-40"
        >
          {generating ? "Generating…" : "Generate"}
        </button>
        {credits && credits.available && (
          <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
            {credits.balanceUsd != null
              ? `$${credits.balanceUsd.toFixed(2)} credits`
              : "Credits available"}
          </span>
        )}
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