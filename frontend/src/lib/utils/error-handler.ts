import { AxiosError } from "axios";
import { ApiError } from "@/types/api";

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.detail) return data.detail;
    if (error.response?.status === 401) return "Session expired. Please log in again.";
    if (error.response?.status === 403) return "You don't have permission for this action.";
    if (error.response?.status === 429) return "Too many requests. Please try again later.";
    if (error.response?.status === 500) return "Server error. Please try again later.";
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}

export function isAuthError(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 401;
}

export function isRateLimitError(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 429;
}
