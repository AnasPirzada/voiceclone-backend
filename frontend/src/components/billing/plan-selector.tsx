"use client";

import { PLAN_FEATURES } from "@/lib/utils/constants";
import { PlanTier } from "@/types/billing";

interface PlanSelectorProps {
  currentPlan: PlanTier;
  onSelect: (plan: PlanTier) => void;
  isAnnual: boolean;
  onToggleBilling: () => void;
}

const PLAN_PRICES = {
  free: { monthly: 0, annual: 0 },
  basic: { monthly: 19, annual: 190 },
  pro: { monthly: 49, annual: 490 },
  enterprise: { monthly: 149, annual: 1490 },
};

export function PlanSelector({ currentPlan, onSelect, isAnnual, onToggleBilling }: PlanSelectorProps) {
  return (
    <div>
      <div className="flex justify-center mb-8">
        <button onClick={onToggleBilling} className="text-sm px-4 py-2 rounded border">
          {isAnnual ? "Annual (save 20%)" : "Monthly"}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(Object.entries(PLAN_FEATURES) as [PlanTier, typeof PLAN_FEATURES.free][]).map(([tier, features]) => (
          <div key={tier} className={`border rounded-lg p-6 ${currentPlan === tier ? "border-indigo-600 ring-2 ring-indigo-100" : ""}`}>
            <h3 className="text-lg font-semibold capitalize">{tier}</h3>
            <p className="text-3xl font-bold mt-2">
              ${isAnnual ? PLAN_PRICES[tier].annual : PLAN_PRICES[tier].monthly}
              <span className="text-sm font-normal">/{isAnnual ? "yr" : "mo"}</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>{features.voices === -1 ? "Unlimited" : features.voices} voices</li>
              <li>{features.generations === -1 ? "Unlimited" : features.generations} generations/mo</li>
              <li>{features.storage} storage</li>
            </ul>
            <button
              onClick={() => onSelect(tier)}
              disabled={currentPlan === tier || tier === "free"}
              className="w-full mt-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
            >
              {currentPlan === tier ? "Current" : "Select"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
