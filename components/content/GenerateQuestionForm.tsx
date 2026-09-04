"use client";

import { useMemo, useState } from "react";
import type { Format, Section, AiModel, AiCredits } from "@/types/content";
import {
  formatPricePerMillion,
  getCostTier,
  estimateGenerationCost,
  COST_TIER_LABELS,
  COST_TIER_ORDER,
  type CostTier,
} from "@/lib/ai/pricing";

interface GenerateQuestionFormProps {
  formats: Format[];
  sections: Section[];
  models: AiModel[];
  credits: AiCredits | null;
  generating: boolean;
  initialSectionId?: string;
  initialTopic?: string;
  onGenerate: (data: { sectionId: string; difficulty: string; model: string; topic: string }) => Promise<void>;
  onCancel: () => void;
}

export function GenerateQuestionForm({
  formats,
  sections,
  models,
  credits,
  generating,
  initialSectionId,
  initialTopic,
  onGenerate,
  onCancel,
}: GenerateQuestionFormProps) {
  const [sectionId, setSectionId] = useState(initialSectionId ?? "");
  const [difficulty, setDifficulty] = useState("easy");
  const [model, setModel] = useState("");
  const [topic, setTopic] = useState(initialTopic ?? "");
  const [costFilter, setCostFilter] = useState<CostTier | "any">("any");

  const activeFormats = formats.filter((f) => !f.killed);
  const activeSections = sections.filter((s) => !s.killed);

  const filteredModels = useMemo(
    () => (costFilter === "any" ? models : models.filter((m) => getCostTier(m) === costFilter)),
    [models, costFilter],
  );

  const modelsByTier = useMemo(() => {
    const grouped = new Map<CostTier, AiModel[]>();
    for (const tier of COST_TIER_ORDER) grouped.set(tier, []);
    for (const m of filteredModels) grouped.get(getCostTier(m))!.push(m);
    return grouped;
  }, [filteredModels]);

  const selectedModel = models.find((m) => m.id === model) ?? null;
  const estimate = selectedModel && topic.trim() ? estimateGenerationCost(selectedModel, topic) : null;

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
      <label className="text-xs font-semibold tracking-wider text-mint-600">GENERATE WITH AI</label>

      {/* Row: section + difficulty (unchanged) */}
      <div className="mt-4 flex items-end gap-4">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-ink/50">Section</label>
          <select className={`w-full ${selectClass}`} value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
            <option value="">Select section…</option>
            {activeFormats.map((f) => {
              const fmtSections = activeSections.filter((s) => s.formatId === f.id);
              if (fmtSections.length === 0) return null;
              return (
                <optgroup key={f.id} label={f.title}>
                  {fmtSections.map((s) => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>
        <div className="w-40">
          <label className="mb-1 block text-xs font-medium text-ink/50">Difficulty</label>
          <select className={`w-full ${selectClass}`} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Cost filter */}
      <div className="mt-4">
        <label className="mb-1 block text-xs font-medium text-ink/50">Filter by cost</label>
        <select
          className={`w-full max-w-xs ${selectClass}`}
          value={costFilter}
          onChange={(e) => {
            setCostFilter(e.target.value as CostTier | "any");
            setModel(""); // avoid keeping a selection the new filter would hide
          }}
        >
          <option value="any">Any cost</option>
          {COST_TIER_ORDER.map((tier) => (
            <option key={tier} value={tier}>{COST_TIER_LABELS[tier]}</option>
          ))}
        </select>
      </div>

      {/* AI model */}
      <div className="mt-4">
        <label className="mb-1 block text-xs font-medium text-ink/50">AI model</label>
        <select className={`w-full max-w-md ${selectClass}`} value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="">Select model…</option>
          {COST_TIER_ORDER.map((tier) => {
            const tierModels = modelsByTier.get(tier) ?? [];
            if (tierModels.length === 0) return null;
            return (
              <optgroup key={tier} label={COST_TIER_LABELS[tier]}>
                {tierModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                    {m.contextLength ? ` · ${(m.contextLength / 1000).toFixed(0)}k ctx` : ""}
                    {m.pricing
                      ? ` · ${formatPricePerMillion(m.pricing.prompt)} in / ${formatPricePerMillion(m.pricing.completion)} out per 1M tok`
                      : ""}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </div>

      {/* Topic */}
      <div className="mt-4">
        <label className="mb-1 block text-xs font-medium text-ink/50">Topic / brief</label>
        <textarea
          className={textareaClass}
          rows={4}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. pricing strategy for a subscription SaaS product"
        />
      </div>

      {/* Estimated cost */}
      {estimate && (
        <div className="mt-3 rounded-md border border-violet-200 bg-violet-50 px-4 py-2.5 text-xs text-violet-700">
          <span className="font-medium">Estimated cost for this generation: </span>
          {estimate.totalUsd < 0.0005 ? "< $0.001" : `~$${estimate.totalUsd.toFixed(3)}`}
          <span className="text-violet-500">
            {" "}(~{estimate.promptTokens.toLocaleString()} in / ~{estimate.completionTokens.toLocaleString()} out tokens, ballpark only)
          </span>
        </div>
      )}

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
          <span
            title="Your team's prepaid balance for AI generation on OpenRouter"
            className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700"
          >
            {credits.balanceUsd != null ? `$${credits.balanceUsd.toFixed(2)} credits available` : "Credits available"}
          </span>
        )}
        <button type="button" onClick={onCancel} className="text-sm text-mint-600 hover:text-mint-700">
          Cancel
        </button>
      </div>
    </div>
  );
}