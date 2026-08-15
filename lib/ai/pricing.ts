import type { AiModel } from "@/types/content";


function perMillion(pricePerToken: string | undefined): number | null {
    if (!pricePerToken) return null;
    const n = Number(pricePerToken);
    return Number.isNaN(n) ? null : n * 1_000_000;
}

export function formatPricePerMillion(pricePerToken: string | undefined): string {
    const p = perMillion(pricePerToken);
    if (p === null) return "—";
    if (p === 0) return "Free";
    return `$${p.toFixed(p < 1 ? 3 : 2)}`;
}

export type CostTier = "free" | "budget" | "standard" | "premium";

// Blended using a 3:1 prompt:completion weighting: roughly matches this
// form's actual usage shape (a topic/brief in, a structured draft out).
function blendedCostPerMillion(model: AiModel): number | null {
    const promptPrice = perMillion(model.pricing?.prompt);
    const completionPrice = perMillion(model.pricing?.completion);
    if (promptPrice === null && completionPrice === null) return null;
    return (promptPrice ?? 0) * 0.75 + (completionPrice ?? 0) * 0.25;
}

export function getCostTier(model: AiModel): CostTier {
    const blended = blendedCostPerMillion(model);
    if (blended === null || blended === 0) return "free";
    if (blended < 0.5) return "budget";
    if (blended < 5) return "standard";
    return "premium";
}

export const COST_TIER_LABELS: Record<CostTier, string> = {
    free: "Free",
    budget: "Budget (under $0.50 / 1M tokens)",
    standard: "Standard ($0.50–$5 / 1M tokens)",
    premium: "Premium (over $5 / 1M tokens)",
};

export const COST_TIER_ORDER: CostTier[] = ["free", "budget", "standard", "premium"];

/**
 * Ballpark pre-generation estimate — NOT exact, since actual completion
 * length isn't known until the model responds. Sized for this form's
 * output shape (scenario + guidance + model answer + rubric JSON), which
 * typically lands in the 700–1500 completion-token range.
 */
const SYSTEM_PROMPT_OVERHEAD_TOKENS = 600;
const ESTIMATED_COMPLETION_TOKENS = 1100;
const CHARS_PER_TOKEN = 4; // standard rough heuristic for English text

export function estimateGenerationCost(model: AiModel, topic: string) {
    const promptTokens = SYSTEM_PROMPT_OVERHEAD_TOKENS + Math.ceil(topic.length / CHARS_PER_TOKEN);
    const completionTokens = ESTIMATED_COMPLETION_TOKENS;

    const promptPrice = Number(model.pricing?.prompt ?? 0);
    const completionPrice = Number(model.pricing?.completion ?? 0);
    const totalUsd = promptTokens * promptPrice + completionTokens * completionPrice;

    return { promptTokens, completionTokens, totalUsd };
}