"use client";

import { Job } from "@/types/job";
import { JobCard } from "./job-card";

interface JobListProps {
  jobs: Job[];
  onCancel?: (id: string) => void;
}

export function JobList({ jobs, onCancel }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No jobs found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} onCancel={onCancel} />
      ))}
    </div>
  );
}
