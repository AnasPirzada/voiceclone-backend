"use client";

import { Job } from "@/types/job";
import { formatDateTime } from "@/lib/utils/format";

interface JobCardProps {
  job: Job;
  onCancel?: (id: string) => void;
}

export function JobCard({ job, onCancel }: JobCardProps) {
  const statusColors: Record<string, string> = {
    queued: "bg-gray-800 text-gray-400 border-gray-600",
    processing: "bg-blue-900/30 text-blue-400 border-blue-500/20",
    completed: "bg-green-900/30 text-green-400 border-green-500/20",
    failed: "bg-red-900/30 text-red-400 border-red-500/20",
    cancelled: "bg-gray-800 text-gray-500 border-gray-600",
  };

  return (
    <div className="border border-gray-700 rounded-xl p-4 bg-gray-900/50 hover:border-gray-600 transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-mono text-gray-300">{job.id.slice(0, 8)}...</span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${statusColors[job.status]}`}>
          {job.status}
        </span>
      </div>
      {(job.status === "processing" || job.status === "queued") && (
        <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${job.progress}%` }}
          />
        </div>
      )}
      <div className="text-xs text-gray-500">
        <span>{formatDateTime(job.created_at)}</span>
      </div>
      {onCancel && (job.status === "queued" || job.status === "processing") && (
        <button
          onClick={() => onCancel(job.id)}
          className="text-xs text-red-400/60 hover:text-red-400 mt-2 transition-colors"
        >
          Cancel
        </button>
      )}
      {job.error_message && (
        <p className="text-xs text-red-400/80 mt-1 bg-red-500/10 px-2 py-1 rounded">{job.error_message}</p>
      )}
    </div>
  );
}
