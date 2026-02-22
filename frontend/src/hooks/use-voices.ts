import { useEffect, useCallback } from "react";
import { useVoiceStore } from "@/store/voice-store";
import { voicesApi } from "@/lib/api/voices";
import { VoiceTrainRequest } from "@/types/voice";

export function useVoices() {
  const { voices, selectedVoice, isLoading, error, fetchVoices, selectVoice, createVoice, deleteVoice } = useVoiceStore();

  useEffect(() => {
    fetchVoices();
  }, [fetchVoices]);

  const uploadSample = useCallback(async (voiceProfileId: string, file: File) => {
    const result = await voicesApi.uploadSample(voiceProfileId, file);
    await fetchVoices();
    return result;
  }, [fetchVoices]);

  const trainVoice = useCallback(async (data: VoiceTrainRequest) => {
    return voicesApi.train(data);
  }, []);

  return { voices, selectedVoice, isLoading, error, fetchVoices, selectVoice, createVoice, deleteVoice, uploadSample, trainVoice };
}
