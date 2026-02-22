import { useState, useEffect, useCallback } from "react";
import { Subscription } from "@/types/billing";
import { billingApi } from "@/lib/api/billing";

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    setIsLoading(true);
    try {
      const sub = await billingApi.getSubscription();
      setSubscription(sub);
    } catch {
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const checkout = useCallback(async (plan: string, isAnnual = false) => {
    const session = await billingApi.createCheckoutSession({
      plan: plan as any,
      is_annual: isAnnual,
      success_url: `${window.location.origin}/dashboard/billing?success=true`,
      cancel_url: `${window.location.origin}/dashboard/billing?cancelled=true`,
    });
    window.location.href = session.url;
  }, []);

  const cancel = useCallback(async () => {
    await billingApi.cancelSubscription();
    await fetchSubscription();
  }, [fetchSubscription]);

  return { subscription, isLoading, fetchSubscription, checkout, cancel };
}
