"use client";

import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { usePricingPlans } from "@/hooks/usePricingPlans";
import PlanColumn from "./PlanColumn";

export default function PricingContent() {
    const { can } = useAdminPermissions();
    const { plans, loading, error, clearError, ...actions } = usePricingPlans();

    const canWrite = can("marketing", "write");
    const canDelete = can("marketing", "delete");

    const free = plans.find((p) => p.planType === "free");
    const pro = plans.find((p) => p.planType === "pro");

    return (
        <>
            {error && (
                <div className="mb-4 flex items-center justify-between rounded-md bg-coral/10 px-4 py-2.5 text-[13px] text-coral">
                    <span>{error}</span>
                    <button onClick={clearError} className="text-coral/60 hover:text-coral">×</button>
                </div>
            )}

            {loading ? (
                <div className="h-40 animate-pulse rounded-lg bg-ink/5" />
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {free && (
                        <PlanColumn
                            plan={free}
                            label="Free plan"
                            canWrite={canWrite}
                            canDelete={canDelete}
                            {...actions}
                        />
                    )}
                    {pro && (
                        <PlanColumn
                            plan={pro}
                            label="Pro plan"
                            canWrite={canWrite}
                            canDelete={canDelete}
                            {...actions}
                        />
                    )}
                </div>
            )}
        </>
    );
}