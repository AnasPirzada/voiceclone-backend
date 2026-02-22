"use client";

import { useJobs } from "@/hooks/use-jobs";
import { JobList } from "@/components/jobs/job-list";

export default function JobsPage() {
  const { jobs, isLoading, cancelJob } = useJobs();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2 text-white">Jobs</h1>
      <p className="text-sm text-gray-400 mb-6">Track your training, generation, and conversion jobs.</p>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-700 rounded-xl bg-gray-900/30">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-lg font-semibold text-gray-300 mb-1">No jobs yet</p>
          <p className="text-sm text-gray-500">Jobs will appear here when you train voices or generate audio.</p>
        </div>
      ) : (
        <JobList jobs={jobs} onCancel={cancelJob} />
      )}
    </div>
  );
}
