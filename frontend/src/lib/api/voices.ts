import apiClient from "./client";
import {
  VoiceProfile,
  VoiceListResponse,
  VoiceCreateRequest,
  VoiceUploadResponse,
  VoiceTrainRequest,
  VoiceTrainResponse,
} from "@/types/voice";
import { TrainingJob } from "@/types/job";

export const voicesApi = {
  create: (data: VoiceCreateRequest) =>
    apiClient.post<VoiceProfile>("/voice/create", data).then((r) => r.data),

  list: () =>
    apiClient.get<VoiceListResponse>("/voice/list").then((r) => r.data),

  get: (voiceId: string) =>
    apiClient.get<VoiceProfile>(`/voice/${voiceId}`).then((r) => r.data),

  delete: (voiceId: string) =>
    apiClient.delete(`/voice/${voiceId}`),

  uploadSample: (voiceProfileId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<VoiceUploadResponse>(`/voice/upload?voice_profile_id=${voiceProfileId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  train: (data: VoiceTrainRequest) =>
    apiClient.post<VoiceTrainResponse>("/voice/train", data).then((r) => r.data),

  getTrainingStatus: (jobId: string) =>
    apiClient.get<TrainingJob>(`/voice/status/${jobId}`).then((r) => r.data),
};
