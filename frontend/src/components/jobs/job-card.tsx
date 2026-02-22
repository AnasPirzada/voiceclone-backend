"use client";

import { Job } from "@/types/job";
import { formatDateTime } from "@/lib/utils/format";

interface JobCardProps {
  job: Job;
  onCancel?: (id: string) => void;
}

export function JobCard({ job, onCancel }: JobCardProps) {
  const statusColors: Record<string, string> = {
    queued: "bg-gray-100 text-gray-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-mono">{job.id.slice(0, 8)}...</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
          {job.status}
        </span>
      </div>
      {(job.status === "processing" || job.status === "queued") && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
          <div className="bg-indigo-600 h-1.5 rounded-full transition-all" style={{ width: `${job.progress}%` }} />
        </div>
      )}
      <div className="text-xs text-muted-foreground">
        <span>{formatDateTime(job.created_at)}</span>
      </div>
      {onCancel && (job.status === "queued" || job.status === "processing") && (
        <button onClick={() => onCancel(job.id)} className="text-xs text-red-500 mt-2 hover:underline">
          Cancel
        </button>
      )}
      {job.error_message && <p className="text-xs text-red-500 mt-1">{job.error_message}</p>}
    </div>
  );
}
