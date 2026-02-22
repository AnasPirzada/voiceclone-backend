export type JobStatus = "queued" | "processing" | "completed" | "failed" | "cancelled";
export type JobType = "training" | "tts" | "conversion";

export interface Job {
  id: string;
  status: JobStatus;
  progress: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface TrainingJob extends Job {
  voice_profile_id: string;
  epochs: number;
  current_epoch: number;
  loss: number | null;
}

export interface GenerationJob extends Job {
  job_type: JobType;
  voice_profile_id: string;
  output_audio_url: string | null;
  duration_seconds: number | null;
}

export interface JobListResponse {
  jobs: Job[];
  total: number;
}
