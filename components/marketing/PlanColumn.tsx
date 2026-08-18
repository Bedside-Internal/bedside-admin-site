"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type {
    PricingPlan,
    PricingPlanType,
    UpdatePricingPlanInput,
    CreateFeatureInput,
    CreateBillingCycleInput,
} from "@/types/marketing";

interface PlanColumnProps {
    plan: PricingPlan;
    label: string;
    canWrite: boolean;
    canDelete: boolean;
    updatePlan: (planType: PricingPlanType, input: UpdatePricingPlanInput) => Promise<void>;
    addFeature: (planType: PricingPlanType, input: CreateFeatureInput) => Promise<void>;
    updateFeature: (planType: PricingPlanType, featureId: string, input: Partial<CreateFeatureInput>) => Promise<void>;
    removeFeature: (planType: PricingPlanType, featureId: string) => Promise<void>;
    addBillingCycle: (planType: PricingPlanType, input: CreateBillingCycleInput) => Promise<void>;
    updateBillingCycle: (planType: PricingPlanType, cycleId: string, input: Partial<CreateBillingCycleInput>) => Promise<void>;
    removeBillingCycle: (planType: PricingPlanType, cycleId: string) => Promise<void>;
}

function FieldInput({
    label,
    value,
    placeholder,
    disabled,
    onCommit,
}: {
    label: string;
    value: string;
    placeholder?: string;
    disabled?: boolean;
    onCommit: (value: string) => void;
}) {
    const [draft, setDraft] = useState(value);
    return (
        <div>
            <label className="mb-1.5 block text-[13px] text-ink/60">{label}</label>
            <input
                type="text"
                value={draft}
                placeholder={placeholder}
                disabled={disabled}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => draft !== value && onCommit(draft)}
                className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm font-dm text-ink outline-none transition-colors focus:border-mint disabled:bg-sand/40 disabled:text-ink/40"
            />
        </div>
    );
}

export default function PlanColumn({
    plan,
    label,
    canWrite,
    canDelete,
    updatePlan,
    addFeature,
    updateFeature,
    removeFeature,
    addBillingCycle,
    updateBillingCycle,
    removeBillingCycle,
}: PlanColumnProps) {
    const isPro = plan.planType === "pro";

    return (
        <div className="rounded-lg border border-ink/10 bg-white p-6">
            <div className="mb-5 text-[11px] font-semibold uppercase tracking-wide text-mint">
                {label}
            </div>

            <div className="space-y-4">
                <FieldInput
                    label="Price"
                    value={plan.price === 0 ? "$0" : `$${plan.price.toFixed(2)}`}
                    disabled={!canWrite}
                    onCommit={(v) => {
                        const parsed = parseFloat(v.replace(/[^0-9.]/g, ""));
                        if (!Number.isNaN(parsed)) updatePlan(plan.planType, { price: parsed });
                    }}
                />
                <FieldInput
                    label="Period label"
                    value={plan.periodLabel}
                    placeholder="e.g. / 12 mo"
                    disabled={!canWrite}
                    onCommit={(v) => updatePlan(plan.planType, { periodLabel: v })}
                />
                <FieldInput
                    label="Price note"
                    value={plan.priceNote}
                    disabled={!canWrite}
                    onCommit={(v) => updatePlan(plan.planType, { priceNote: v })}
                />
                <FieldInput
                    label="Badge (e.g. Most popular)"
                    value={plan.badge ?? ""}
                    disabled={!canWrite}
                    onCommit={(v) => updatePlan(plan.planType, { badge: v || null })}
                />
                <FieldInput
                    label="Button label"
                    value={plan.buttonLabel}
                    disabled={!canWrite}
                    onCommit={(v) => updatePlan(plan.planType, { buttonLabel: v })}
                />
            </div>

            {!isPro && (
                <div className="mt-6">
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-mint">
                        Features
                    </div>
                    <div className="space-y-2">
                        {plan.features.map((f) => (
                            <div key={f.id} className="flex items-center gap-2.5">
                                <input
                                    type="checkbox"
                                    checked={f.included}
                                    disabled={!canWrite}
                                    onChange={(e) =>
                                        updateFeature(plan.planType, f.id, { included: e.target.checked })
                                    }
                                    className="h-4 w-4 rounded border-ink/15 accent-mint"
                                />
                                <input
                                    type="text"
                                    defaultValue={f.label}
                                    disabled={!canWrite}
                                    onBlur={(e) =>
                                        e.target.value !== f.label &&
                                        updateFeature(plan.planType, f.id, { label: e.target.value })
                                    }
                                    className="flex-1 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-dm text-ink outline-none focus:border-mint disabled:bg-sand/40"
                                />
                                {canDelete && (
                                    <button
                                        onClick={() => removeFeature(plan.planType, f.id)}
                                        className="whitespace-nowrap text-[13px] font-medium text-coral hover:brightness-110"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    {canWrite && (
                        <button
                            onClick={() => addFeature(plan.planType, { label: "New feature", included: true })}
                            className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-mint hover:text-mint-hover"
                        >
                            <Plus size={14} /> Add feature
                        </button>
                    )}
                </div>
            )}

            {isPro && (
                <div className="mt-6">
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-mint">
                        Billing cycles
                    </div>
                    <div className="space-y-2">
                        {plan.billingCycles.map((c) => (
                            <div key={c.id} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    defaultValue={`${c.months} mo`}
                                    disabled={!canWrite}
                                    onBlur={(e) => {
                                        const months = parseInt(e.target.value, 10);
                                        if (!Number.isNaN(months) && months !== c.months) {
                                            updateBillingCycle(plan.planType, c.id, { months });
                                        }
                                    }}
                                    className="w-20 rounded-md border border-ink/15 bg-white px-2 py-2 text-sm font-dm text-ink outline-none focus:border-mint disabled:bg-sand/40"
                                />
                                <input
                                    type="text"
                                    defaultValue={`$${c.perMonth.toFixed(2)}/mo`}
                                    disabled={!canWrite}
                                    onBlur={(e) => {
                                        const perMonth = parseFloat(e.target.value.replace(/[^0-9.]/g, ""));
                                        if (!Number.isNaN(perMonth)) {
                                            updateBillingCycle(plan.planType, c.id, { perMonth });
                                        }
                                    }}
                                    className="w-28 rounded-md border border-ink/15 bg-white px-2 py-2 text-sm font-dm text-ink outline-none focus:border-mint disabled:bg-sand/40"
                                />
                                <input
                                    type="text"
                                    defaultValue={c.badge ?? ""}
                                    placeholder="Best value (optional)"
                                    disabled={!canWrite}
                                    onBlur={(e) =>
                                        e.target.value !== (c.badge ?? "") &&
                                        updateBillingCycle(plan.planType, c.id, { badge: e.target.value || null })
                                    }
                                    className="flex-1 rounded-md border border-ink/15 bg-white px-2 py-2 text-sm font-dm text-ink outline-none focus:border-mint disabled:bg-sand/40"
                                />
                                {canDelete && (
                                    <button
                                        onClick={() => removeBillingCycle(plan.planType, c.id)}
                                        className="whitespace-nowrap text-[13px] font-medium text-coral hover:brightness-110"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    {canWrite && (
                        <button
                            onClick={() =>
                                addBillingCycle(plan.planType, { months: 1, price: 0, perMonth: 0 })
                            }
                            className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-mint hover:text-mint-hover"
                        >
                            <Plus size={14} /> Add billing cycle
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}