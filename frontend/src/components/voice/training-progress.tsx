"use client";

import { TrainingJob } from "@/types/job";
import { formatPercentage } from "@/lib/utils/format";

interface TrainingProgressProps {
  job: TrainingJob;
}

export function TrainingProgress({ job }: TrainingProgressProps) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">Training Progress</span>
        <span className="text-sm">{formatPercentage(job.progress)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${job.progress}%` }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Epoch {job.current_epoch}/{job.epochs}</span>
        {job.loss !== null && <span>Loss: {job.loss.toFixed(4)}</span>}
        <span className="capitalize">{job.status}</span>
      </div>
    </div>
  );
}
