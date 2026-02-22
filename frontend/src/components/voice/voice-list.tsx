"use client";

import { VoiceProfile } from "@/types/voice";
import { VoiceCard } from "./voice-card";

interface VoiceListProps {
  voices: VoiceProfile[];
  onDelete?: (id: string) => void;
}

export function VoiceList({ voices, onDelete }: VoiceListProps) {
  if (voices.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No voices yet. Create your first voice profile to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {voices.map((voice) => (
        <VoiceCard key={voice.id} voice={voice} onDelete={onDelete} />
      ))}
    </div>
  );
}
