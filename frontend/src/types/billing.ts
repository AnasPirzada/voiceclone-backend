export type PlanTier = "free" | "basic" | "pro" | "enterprise";
export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "trialing" | "inactive";

export interface Subscription {
  id: string;
  plan: PlanTier;
  status: SubscriptionStatus;
  monthly_voice_limit: number;
  monthly_generation_limit: number;
  voices_used: number;
  generations_used: number;
  current_period_start: string | null;
  current_period_end: string | null;
}

export interface CreateCheckoutSessionRequest {
  plan: PlanTier;
  is_annual?: boolean;
  success_url: string;
  cancel_url: string;
}

export interface CheckoutSessionResponse {
  session_id: string;
  url: string;
}
