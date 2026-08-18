"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import type {
    AdminPricingTier,
    UpdatePricingTierInput,
    CreateFeatureInput,
    CreateBillingCycleInput,
} from "@/types/marketing";

interface PricingTierColumnProps {
    tier: AdminPricingTier;
    reorder?: React.ReactNode;
    canWrite: boolean;
    canDelete: boolean;
    onUpdate: (input: Partial<UpdatePricingTierInput>) => Promise<void>;
    onDelete: () => void;
    addFeature: (tierId: string, input: CreateFeatureInput) => Promise<void>;
    updateFeature: (tierId: string, featureId: string, input: Partial<CreateFeatureInput>) => Promise<void>;
    removeFeature: (tierId: string, featureId: string) => Promise<void>;
    addBillingCycle: (tierId: string, input: CreateBillingCycleInput) => Promise<void>;
    updateBillingCycle: (tierId: string, cycleId: string, input: Partial<CreateBillingCycleInput>) => Promise<void>;
    removeBillingCycle: (tierId: string, cycleId: string) => Promise<void>;
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

    useEffect(() => {
        setDraft(value);
    }, [value]);

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

export default function PricingTierColumn({
    tier,
    reorder,
    canWrite,
    canDelete,
    onUpdate,
    onDelete,
    addFeature,
    updateFeature,
    removeFeature,
    addBillingCycle,
    updateBillingCycle,
    removeBillingCycle,
}: PricingTierColumnProps) {
    return (
        <div className="rounded-lg border border-ink/10 bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-mint">
                    {tier.title || "New tier"}
                </span>
                {reorder}
            </div>

            <div className="space-y-4">
                <FieldInput
                    label="Title"
                    value={tier.title}
                    disabled={!canWrite}
                    onCommit={(v) => onUpdate({ title: v })}
                />
                <label className="flex items-center gap-2.5 text-[13px] font-medium text-ink">
                    <input
                        type="checkbox"
                        checked={tier.featured}
                        disabled={!canWrite}
                        onChange={(e) => onUpdate({ featured: e.target.checked })}
                        className="h-4 w-4 rounded border-ink/15 accent-mint"
                    />
                    Featured (highlighted card)
                </label>
                <label className="flex items-center gap-2.5 text-[13px] font-medium text-ink">
                    <input
                        type="checkbox"
                        checked={tier.enabled}
                        disabled={!canWrite}
                        onChange={(e) => onUpdate({ enabled: e.target.checked })}
                        className="h-4 w-4 rounded border-ink/15 accent-mint"
                    />
                    Visible on homepage
                </label>
                <FieldInput
                    label="Price"
                    value={tier.price === 0 ? "$0" : `$${tier.price.toFixed(2)}`}
                    disabled={!canWrite}
                    onCommit={(v) => {
                        const parsed = parseFloat(v.replace(/[^0-9.]/g, ""));
                        if (!Number.isNaN(parsed)) onUpdate({ price: parsed });
                    }}
                />
                <FieldInput
                    label="Period label"
                    value={tier.periodLabel}
                    placeholder="e.g. / 12 mo"
                    disabled={!canWrite}
                    onCommit={(v) => onUpdate({ periodLabel: v })}
                />
                <FieldInput
                    label="Price note"
                    value={tier.priceNote}
                    disabled={!canWrite}
                    onCommit={(v) => onUpdate({ priceNote: v })}
                />
                <FieldInput
                    label="Badge (e.g. Most popular)"
                    value={tier.badge ?? ""}
                    disabled={!canWrite}
                    onCommit={(v) => onUpdate({ badge: v || null })}
                />
                <FieldInput
                    label="Button label"
                    value={tier.buttonLabel}
                    disabled={!canWrite}
                    onCommit={(v) => onUpdate({ buttonLabel: v })}
                />
            </div>

            {/* Features */}
            <div className="mt-6">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-mint">
                    Features
                </div>
                <div className="space-y-2">
                    {tier.features.map((f) => (
                        <div key={f.id} className="flex items-center gap-2.5">
                            <input
                                type="checkbox"
                                checked={f.included}
                                disabled={!canWrite}
                                onChange={(e) =>
                                    updateFeature(tier.id, f.id, { included: e.target.checked })
                                }
                                className="h-4 w-4 rounded border-ink/15 accent-mint"
                            />
                            <input
                                type="text"
                                defaultValue={f.label}
                                disabled={!canWrite}
                                onBlur={(e) => {
                                    const trimmed = e.target.value.trim();
                                    if (!trimmed) {
                                        e.target.value = f.label;
                                        return;
                                    }
                                    if (trimmed !== f.label) {
                                        updateFeature(tier.id, f.id, { label: trimmed });
                                    }
                                }}
                                className="flex-1 rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-dm text-ink outline-none focus:border-mint disabled:bg-sand/40"
                            />
                            {canDelete && (
                                <button
                                    onClick={() => removeFeature(tier.id, f.id)}
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
                        onClick={() => addFeature(tier.id, { label: "New feature", included: true })}
                        className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-mint hover:text-mint-hover"
                    >
                        <Plus size={14} /> Add feature
                    </button>
                )}
            </div>

            {/* Billing cycles */}
            <div className="mt-6">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-mint">
                    Billing cycles
                </div>
                <div className="space-y-2">
                    {tier.billingCycles.map((c) => (
                        <div
                            key={c.id}
                            className="grid grid-cols-[52px_72px_76px_1fr_auto] items-center gap-2"
                        >
                            <input
                                type="text"
                                defaultValue={`${c.months} mo`}
                                disabled={!canWrite}
                                onBlur={(e) => {
                                    const months = parseInt(e.target.value, 10);
                                    if (!Number.isNaN(months) && months !== c.months) {
                                        updateBillingCycle(tier.id, c.id, { months });
                                    }
                                }}
                                className="min-w-0 rounded-md border border-ink/15 bg-white px-2 py-2 text-sm font-dm text-ink outline-none focus:border-mint disabled:bg-sand/40"
                            />
                            <input
                                type="text"
                                defaultValue={`$${c.price.toFixed(2)}`}
                                placeholder="Total"
                                disabled={!canWrite}
                                onBlur={(e) => {
                                    const price = parseFloat(e.target.value.replace(/[^0-9.]/g, ""));
                                    if (!Number.isNaN(price) && price !== c.price) {
                                        updateBillingCycle(tier.id, c.id, { price });
                                    }
                                }}
                                className="min-w-0 rounded-md border border-ink/15 bg-white px-2 py-2 text-sm font-dm text-ink outline-none focus:border-mint disabled:bg-sand/40"
                            />
                            <input
                                type="text"
                                defaultValue={`$${c.perMonth.toFixed(2)}/mo`}
                                disabled={!canWrite}
                                onBlur={(e) => {
                                    const perMonth = parseFloat(e.target.value.replace(/[^0-9.]/g, ""));
                                    if (!Number.isNaN(perMonth) && perMonth !== c.perMonth) {
                                        updateBillingCycle(tier.id, c.id, { perMonth });
                                    }
                                }}
                                className="min-w-0 rounded-md border border-ink/15 bg-white px-2 py-2 text-sm font-dm text-ink outline-none focus:border-mint disabled:bg-sand/40"
                            />
                            <input
                                type="text"
                                defaultValue={c.badge ?? ""}
                                placeholder="Best value (optional)"
                                disabled={!canWrite}
                                onBlur={(e) =>
                                    e.target.value !== (c.badge ?? "") &&
                                    updateBillingCycle(tier.id, c.id, { badge: e.target.value || null })
                                }
                                className="min-w-0 rounded-md border border-ink/15 bg-white px-2 py-2 text-sm font-dm text-ink outline-none focus:border-mint disabled:bg-sand/40"
                            />
                            {canDelete && (
                                <button
                                    onClick={() => removeBillingCycle(tier.id, c.id)}
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
                        onClick={() => addBillingCycle(tier.id, { months: 1, price: 0, perMonth: 0 })}
                        className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-mint hover:text-mint-hover"
                    >
                        <Plus size={14} /> Add billing cycle
                    </button>
                )}
            </div>

            {/* Delete tier */}
            {canDelete && (
                <div className="mt-6 border-t border-ink/10 pt-4">
                    <button
                        onClick={onDelete}
                        className="text-[13px] font-medium text-coral hover:brightness-110"
                    >
                        Delete tier
                    </button>
                </div>
            )}
        </div>
    );
}