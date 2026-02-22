import { useEffect, useCallback, useRef } from "react";
import { useJobStore } from "@/store/job-store";
import { JOB_POLL_INTERVAL } from "@/lib/utils/constants";

export function useJobs(autoFetch = true) {
  const { jobs, activeJobs, isLoading, error, fetchJobs, cancelJob, updateJobStatus } = useJobStore();

  useEffect(() => {
    if (autoFetch) fetchJobs();
  }, [autoFetch, fetchJobs]);

  return { jobs, activeJobs, isLoading, error, fetchJobs, cancelJob, updateJobStatus };
}

export function useJobPolling(jobId: string | null, onUpdate?: (status: string, progress: number) => void) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { updateJobStatus } = useJobStore();

  useEffect(() => {
    if (!jobId) return;

    const poll = async () => {
      try {
        const { jobsApi } = await import("@/lib/api/jobs");
        const job = await jobsApi.get(jobId);
        updateJobStatus(jobId, job.status as any, job.progress);
        onUpdate?.(job.status, job.progress);
        if (job.status === "completed" || job.status === "failed" || job.status === "cancelled") {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch {}
    };

    poll();
    intervalRef.current = setInterval(poll, JOB_POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [jobId, updateJobStatus, onUpdate]);
}
