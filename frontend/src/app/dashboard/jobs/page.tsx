"use client";

import { useJobs } from "@/hooks/use-jobs";
import { JobList } from "@/components/jobs/job-list";

export default function JobsPage() {
  const { jobs, isLoading, cancelJob } = useJobs();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Jobs</h1>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <JobList jobs={jobs} onCancel={cancelJob} />
      )}
    </div>
  );
}
