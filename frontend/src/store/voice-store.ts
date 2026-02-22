import { create } from "zustand";
import { VoiceProfile } from "@/types/voice";
import { voicesApi } from "@/lib/api/voices";

interface VoiceStore {
  voices: VoiceProfile[];
  selectedVoice: VoiceProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchVoices: () => Promise<void>;
  selectVoice: (voice: VoiceProfile | null) => void;
  createVoice: (name: string, description?: string, language?: string) => Promise<VoiceProfile>;
  deleteVoice: (voiceId: string) => Promise<void>;
}

export const useVoiceStore = create<VoiceStore>((set) => ({
  voices: [],
  selectedVoice: null,
  isLoading: false,
  error: null,

  fetchVoices: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await voicesApi.list();
      set({ voices: response.voices || [] });
    } catch (e: unknown) {
      // Silently handle 401 errors (user not authenticated yet)
      const err = e as { response?: { status?: number }; message?: string };
      if (err.response?.status !== 401) {
        set({ error: err.message || "Failed to fetch voices" });
      }
      set({ voices: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  selectVoice: (voice) => set({ selectedVoice: voice }),

  createVoice: async (name, description, language) => {
    const voice = await voicesApi.create({ name, description, language });
    set((state) => ({ voices: [...state.voices, voice] }));
    return voice;
  },

  deleteVoice: async (voiceId) => {
    await voicesApi.delete(voiceId);
    set((state) => ({
      voices: state.voices.filter((v) => v.id !== voiceId),
      selectedVoice: state.selectedVoice?.id === voiceId ? null : state.selectedVoice,
    }));
  },
}));
