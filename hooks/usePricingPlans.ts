"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import * as api from "@/lib/api/pricing";
import type {
    PricingPlan,
    PricingPlanType,
    UpdatePricingPlanInput,
    CreateFeatureInput,
    CreateBillingCycleInput,
} from "@/types/marketing";

export function usePricingPlans() {
    const { getToken } = useAuth();
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            setPlans(await api.listPricingPlans(token));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    const replacePlan = (updated: PricingPlan) =>
        setPlans((prev) => prev.map((p) => (p.planType === updated.planType ? updated : p)));

    const updatePlan = useCallback(
        async (planType: PricingPlanType, input: UpdatePricingPlanInput) => {
            const token = await getToken();
            replacePlan(await api.updatePricingPlan(token, planType, input));
        },
        [getToken]
    );

    const addFeature = useCallback(
        async (planType: PricingPlanType, input: CreateFeatureInput) => {
            const token = await getToken();
            replacePlan(await api.addFeature(token, planType, input));
        },
        [getToken]
    );

    const updateFeature = useCallback(
        async (planType: PricingPlanType, featureId: string, input: Partial<CreateFeatureInput>) => {
            const token = await getToken();
            replacePlan(await api.updateFeature(token, planType, featureId, input));
        },
        [getToken]
    );

    const removeFeature = useCallback(
        async (planType: PricingPlanType, featureId: string) => {
            const token = await getToken();
            replacePlan(await api.deleteFeature(token, planType, featureId));
        },
        [getToken]
    );

    const addBillingCycle = useCallback(
        async (planType: PricingPlanType, input: CreateBillingCycleInput) => {
            const token = await getToken();
            replacePlan(await api.addBillingCycle(token, planType, input));
        },
        [getToken]
    );

    const updateBillingCycle = useCallback(
        async (planType: PricingPlanType, cycleId: string, input: Partial<CreateBillingCycleInput>) => {
            const token = await getToken();
            replacePlan(await api.updateBillingCycle(token, planType, cycleId, input));
        },
        [getToken]
    );

    const removeBillingCycle = useCallback(
        async (planType: PricingPlanType, cycleId: string) => {
            const token = await getToken();
            replacePlan(await api.deleteBillingCycle(token, planType, cycleId));
        },
        [getToken]
    );

    return {
        plans,
        loading,
        error,
        clearError: () => setError(null),
        updatePlan,
        addFeature,
        updateFeature,
        removeFeature,
        addBillingCycle,
        updateBillingCycle,
        removeBillingCycle,
    };
}