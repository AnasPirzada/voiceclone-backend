"use client";

import { Subscription } from "@/types/billing";
import { formatDate } from "@/lib/utils/format";

interface SubscriptionCardProps {
  subscription: Subscription;
  onCancel: () => void;
}

export function SubscriptionCard({ subscription, onCancel }: SubscriptionCardProps) {
  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold capitalize">{subscription.plan} Plan</h3>
        <span className={`px-2 py-1 rounded-full text-xs ${subscription.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
          {subscription.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-muted-foreground">Voices</p>
          <p>{subscription.voices_used} / {subscription.monthly_voice_limit === -1 ? "∞" : subscription.monthly_voice_limit}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Generations</p>
          <p>{subscription.generations_used} / {subscription.monthly_generation_limit === -1 ? "∞" : subscription.monthly_generation_limit}</p>
        </div>
      </div>
      {subscription.current_period_end && (
        <p className="text-xs text-muted-foreground mb-4">Renews: {formatDate(subscription.current_period_end)}</p>
      )}
      {subscription.plan !== "free" && subscription.status === "active" && (
        <button onClick={onCancel} className="text-sm text-red-500 hover:underline">Cancel subscription</button>
      )}
    </div>
  );
}
