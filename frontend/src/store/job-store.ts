import { create } from "zustand";
import { Job, JobStatus } from "@/types/job";
import { jobsApi } from "@/lib/api/jobs";

interface JobStore {
  jobs: Job[];
  activeJobs: Job[];
  isLoading: boolean;
  error: string | null;
  fetchJobs: (params?: { status?: string; job_type?: string }) => Promise<void>;
  cancelJob: (jobId: string) => Promise<void>;
  updateJobStatus: (jobId: string, status: JobStatus, progress: number) => void;
}

export const useJobStore = create<JobStore>((set) => ({
  jobs: [],
  activeJobs: [],
  isLoading: false,
  error: null,

  fetchJobs: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await jobsApi.list(params);
      const jobs = response.jobs || [];
      set({
        jobs,
        activeJobs: jobs.filter((j) => j.status === "queued" || j.status === "processing"),
      });
    } catch (e: unknown) {
      const err = e as { response?: { status?: number }; message?: string };
      if (err.response?.status !== 401) {
        set({ error: err.message || "Failed to fetch jobs" });
      }
      set({ jobs: [], activeJobs: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  cancelJob: async (jobId) => {
    await jobsApi.cancel(jobId);
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === jobId ? { ...j, status: "cancelled" as JobStatus } : j)),
      activeJobs: state.activeJobs.filter((j) => j.id !== jobId),
    }));
  },

  updateJobStatus: (jobId, status, progress) => {
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === jobId ? { ...j, status, progress } : j)),
      activeJobs:
        status === "completed" || status === "failed" || status === "cancelled"
          ? state.activeJobs.filter((j) => j.id !== jobId)
          : state.activeJobs.map((j) => (j.id === jobId ? { ...j, status, progress } : j)),
    }));
  },
}));
