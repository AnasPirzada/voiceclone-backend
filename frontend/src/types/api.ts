export interface ApiError {
  detail: string;
  status_code: number;
}

export interface PaginationParams {
  page: number;
  page_size: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface TTSRequest {
  voice_profile_id?: string | null;
  model_path?: string | null;
  text: string;
  language?: string;
  emotion?: string | null;
  pitch_shift?: number;
  speed?: number;
}

export interface TTSResponse {
  job_id: string;
  status: string;
}

export interface VoiceConversionRequest {
  voice_profile_id: string;
  language?: string;
  pitch_shift?: number;
  emotion?: string | null;
}

export interface VoiceConversionResponse {
  job_id: string;
  status: string;
}

export interface GenerationStatusResponse {
  job_id: string;
  status: string;
  progress: number;
  output_audio_url: string | null;
  duration_seconds: number | null;
  error_message: string | null;
}
