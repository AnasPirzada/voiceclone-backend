from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


@dataclass
class ConversionResult:
    audio_path: str
    duration_seconds: float
    sample_rate: int


class VoiceConversionServiceBase(ABC):
    @abstractmethod
    def convert(
        self,
        input_audio_path: str,
        model_path: str,
        pitch_shift: float,
    ) -> str:
        ...


class VoiceConversionService(VoiceConversionServiceBase):
    """
    Voice conversion service using Coqui TTS XTTS v2.
    
    Takes input audio and converts it to sound like the cloned voice
    by re-synthesizing the speech content with the target speaker embedding.
    """

    def __init__(self):
        self._model = None
        self._current_model_path = None

    def _load_model(self, model_path: str):
        """Load the base TTS model for voice conversion."""
        try:
            from TTS.api import TTS
            from backend.config.settings import settings

            if self._model is None or self._current_model_path != model_path:
                self._model = TTS(settings.TTS_MODEL_NAME)
                self._current_model_path = model_path
                logger.info(f"Loaded TTS model for voice conversion")
            return self._model
        except ImportError:
            raise ImportError(
                "TTS library not installed. Install with: pip install TTS"
            )
        except Exception as e:
            raise RuntimeError(f"Failed to load TTS model: {e}")

    def _get_reference_wavs(self, model_path: str) -> list[str]:
        """Get reference audio files from the trained voice model directory."""
        import json

        model_dir = Path(model_path)
        refs_dir = model_dir / "reference_audio"
        config_path = model_dir / "voice_config.json"

        if refs_dir.exists():
            wavs = [str(p) for p in refs_dir.glob("*.wav")]
            if wavs:
                return wavs

        # Fallback: try to read from config
        if config_path.exists():
            with open(config_path, "r") as f:
                config = json.load(f)
                return config.get("speaker_wavs", [])

        raise ValueError(f"No reference audio found in model directory: {model_path}")

    def convert(
        self,
        input_audio_path: str,
        model_path: str,
        pitch_shift: float = 0.0,
    ) -> str:
        """
        Convert input audio to sound like the target cloned voice.
        
        Process:
        1. Transcribe the input audio using Whisper
        2. Re-synthesize the transcribed text using XTTS v2
           with the target speaker's reference audio
        3. Apply optional pitch shifting
        
        Args:
            input_audio_path: Path to the input audio file
            model_path: Path to the trained voice model directory
            pitch_shift: Pitch shift in semitones (-12 to +12)
            
        Returns:
            Path to the converted audio file
        """
        import tempfile
        import os

        logger.info(f"Starting voice conversion: input={input_audio_path}, model={model_path}")

        # Step 1: Transcribe the input audio
        from backend.services.ai_engine.whisper_service import WhisperService
        whisper = WhisperService()

        try:
            transcription = whisper.transcribe(Path(input_audio_path))
            text = transcription.text.strip()
            language = transcription.language
        except Exception as e:
            raise RuntimeError(f"Failed to transcribe input audio: {e}")

        if not text:
            raise ValueError("Could not transcribe any speech from the input audio")

        logger.info(f"Transcribed input audio ({language}): {text[:100]}...")

        # Step 2: Get reference speaker audio from the trained model
        speaker_wavs = self._get_reference_wavs(model_path)
        if not speaker_wavs:
            raise ValueError("No reference audio found for voice conversion")

        # Step 3: Re-synthesize using XTTS v2 with target speaker
        tts_model = self._load_model(model_path)

        output_dir = Path(tempfile.gettempdir()) / "voiceclone_conversion"
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"converted_{os.urandom(8).hex()}.wav"

        try:
            # Use the first reference WAV for speaker conditioning
            speaker_wav = speaker_wavs[0]

            tts_model.tts_to_file(
                text=text,
                file_path=str(output_path),
                speaker_wav=speaker_wav,
                language=language,
            )

            logger.info(f"Generated converted audio at {output_path}")

            # Step 4: Apply pitch shift if needed
            if pitch_shift != 0.0:
                output_path_str = self._apply_pitch_shift(str(output_path), pitch_shift)
                return output_path_str

            return str(output_path)

        except Exception as e:
            if output_path.exists():
                output_path.unlink()
            raise RuntimeError(f"Voice conversion failed: {e}") from e

    def _apply_pitch_shift(self, audio_path: str, pitch_shift: float) -> str:
        """Apply pitch shift to audio file."""
        try:
            import librosa
            import soundfile as sf

            y, sr = librosa.load(audio_path, sr=None)
            y_shifted = librosa.effects.pitch_shift(y, sr=sr, n_steps=pitch_shift)
            sf.write(audio_path, y_shifted, sr)
            return audio_path
        except Exception as e:
            logger.warning(f"Failed to apply pitch shift: {e}")
            return audio_path
