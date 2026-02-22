import apiClient from "./client";
import {
  Subscription,
  CreateCheckoutSessionRequest,
  CheckoutSessionResponse,
} from "@/types/billing";

export const billingApi = {
  getSubscription: () =>
    apiClient.get<Subscription>("/billing/subscription").then((r) => r.data),

  createCheckoutSession: (data: CreateCheckoutSessionRequest) =>
    apiClient.post<CheckoutSessionResponse>("/billing/create-checkout-session", data).then((r) => r.data),

  cancelSubscription: () =>
    apiClient.post<{ detail: string }>("/billing/cancel").then((r) => r.data),
};
