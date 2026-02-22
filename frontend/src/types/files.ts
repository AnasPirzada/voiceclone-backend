export type AudioFileType = "sample" | "generated_tts" | "generated_conversion";

export interface AudioFile {
  id: string;
  user_id: string;
  voice_profile_id: string | null;
  file_type: AudioFileType;
  filename: string;
  s3_url: string;
  mime_type: string;
  file_size_bytes: number;
  duration_seconds: number;
  sample_rate: number;
  created_at: string;
}
