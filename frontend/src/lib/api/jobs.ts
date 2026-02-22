import apiClient from "./client";
import { Job, JobListResponse } from "@/types/job";

export const jobsApi = {
  list: (params?: { page?: number; page_size?: number; status?: string; job_type?: string }) =>
    apiClient.get<JobListResponse>("/jobs/", { params }).then((r) => r.data),

  get: (jobId: string) =>
    apiClient.get<Job>(`/jobs/${jobId}`).then((r) => r.data),

  cancel: (jobId: string) =>
    apiClient.post<{ detail: string }>(`/jobs/${jobId}/cancel`).then((r) => r.data),
};
