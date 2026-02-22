import apiClient from "./client";

export interface AdminUserListResponse {
  users: Array<{
    id: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    is_verified: boolean;
    plan: string | null;
    voices_count: number;
    generations_count: number;
    created_at: string;
  }>;
  total: number;
  page: number;
  page_size: number;
}

export interface AdminJobListResponse {
  jobs: Array<{
    id: string;
    user_id: string;
    user_email: string;
    job_type: string;
    status: string;
    created_at: string;
    started_at: string | null;
    completed_at: string | null;
  }>;
  total: number;
  page: number;
  page_size: number;
}

export interface SystemStatsResponse {
  total_users: number;
  active_users: number;
  total_voices: number;
  total_jobs: number;
  pending_jobs: number;
  processing_jobs: number;
  storage_used_gb: number;
}

export const adminApi = {
  listUsers: (params?: { page?: number; page_size?: number; search?: string }) =>
    apiClient.get<AdminUserListResponse>("/admin/users", { params }).then((r) => r.data),

  listJobs: (params?: { page?: number; page_size?: number; status?: string; job_type?: string }) =>
    apiClient.get<AdminJobListResponse>("/admin/jobs", { params }).then((r) => r.data),

  getStats: () =>
    apiClient.get<SystemStatsResponse>("/admin/stats").then((r) => r.data),

  deactivateUser: (userId: string) =>
    apiClient.post(`/admin/users/${userId}/deactivate`).then((r) => r.data),

  cancelJob: (jobId: string) =>
    apiClient.post(`/admin/jobs/${jobId}/cancel`).then((r) => r.data),
};
