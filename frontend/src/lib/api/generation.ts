import apiClient from "./client";
import {
  TTSRequest,
  TTSResponse,
  VoiceConversionRequest,
  VoiceConversionResponse,
  GenerationStatusResponse,
} from "@/types/api";

export const generationApi = {
  generateTTS: (data: TTSRequest) =>
    apiClient.post<TTSResponse>("/tts/generate", data).then((r) => r.data),

  getTTSStatus: (jobId: string) =>
    apiClient.get<GenerationStatusResponse>(`/tts/status/${jobId}`).then((r) => r.data),

  convertVoice: (data: VoiceConversionRequest, audioFile: File) => {
    const formData = new FormData();
    formData.append("file", audioFile);
    const params = new URLSearchParams();
    params.set("voice_profile_id", data.voice_profile_id);
    if (data.language) params.set("language", data.language);
    if (data.pitch_shift !== undefined) params.set("pitch_shift", String(data.pitch_shift));
    if (data.emotion) params.set("emotion", data.emotion);
    return apiClient
      .post<VoiceConversionResponse>(`/convert?${params.toString()}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  getConversionStatus: (jobId: string) =>
    apiClient.get<GenerationStatusResponse>(`/convert/status/${jobId}`).then((r) => r.data),
};
