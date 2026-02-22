export type VoiceStatus = "pending" | "processing" | "trained" | "failed";

export interface VoiceProfile {
  id: string;
  name: string;
  description: string | null;
  language: string;
  status: VoiceStatus;
  sample_count: number;
  total_duration_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface VoiceListResponse {
  voices: VoiceProfile[];
  total: number;
}

export interface VoiceCreateRequest {
  name: string;
  description?: string;
  language?: string;
}

export interface VoiceUploadResponse {
  id: string;
  voice_profile_id: string;
  filename: string;
  duration_seconds: number;
  s3_url: string;
}

export interface VoiceTrainRequest {
  voice_profile_id: string;
  epochs?: number;
  batch_size?: number;
  learning_rate?: number;
}

export interface VoiceTrainResponse {
  job_id: string;
  voice_profile_id: string;
  status: string;
}
