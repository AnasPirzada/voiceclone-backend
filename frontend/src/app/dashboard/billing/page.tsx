"use client";

import { useState } from "react";
import { useSubscription } from "@/hooks/use-subscription";
import { SubscriptionCard } from "@/components/billing/subscription-card";
import { PlanSelector } from "@/components/billing/plan-selector";
import { PlanTier } from "@/types/billing";

export default function BillingPage() {
  const { subscription, isLoading, checkout, cancel } = useSubscription();
  const [isAnnual, setIsAnnual] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Billing</h1>
      {subscription && (
        <div className="mb-8">
          <SubscriptionCard subscription={subscription} onCancel={cancel} />
        </div>
      )}
      <PlanSelector
        currentPlan={subscription?.plan ?? "free"}
        onSelect={(plan: PlanTier) => checkout(plan, isAnnual)}
        isAnnual={isAnnual}
        onToggleBilling={() => setIsAnnual(!isAnnual)}
      />
    </div>
  );
}
