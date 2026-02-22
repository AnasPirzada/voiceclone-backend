from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path


@dataclass
class TTSResult:
    audio_path: str
    duration_seconds: float
    sample_rate: int


class TTSServiceBase(ABC):
    @abstractmethod
    def generate(
        self,
        text: str,
        model_path: str,
        language: str,
        emotion: str | None,
        pitch_shift: float,
        speed: float,
    ) -> str:
        ...

    @abstractmethod
    def list_available_languages(self) -> list[str]:
        ...

    @abstractmethod
    def list_available_emotions(self) -> list[str]:
        ...


class TTSService(TTSServiceBase):
    def __init__(self):
        self._model = None
        self._current_model_path = None

    def _load_model(self, model_path: str):
        """Load or reload TTS model if path changed."""
        try:
            from TTS.api import TTS
            if self._model is None or self._current_model_path != model_path:
                self._model = TTS(model_path=model_path)
                self._current_model_path = model_path
            return self._model
        except ImportError:
            raise ImportError(
                "TTS library not installed. Install with: pip install TTS"
            )
        except Exception as e:
            raise RuntimeError(f"Failed to load TTS model from {model_path}: {e}")

    def generate(
        self,
        text: str,
        model_path: str,
        language: str = "en",
        emotion: str | None = None,
        pitch_shift: float = 0.0,
        speed: float = 1.0,
    ) -> str:
        """
        Generate TTS audio from text using Coqui TTS.
        
        Args:
            text: Text to synthesize
            model_path: Path to the trained voice model
            language: Language code (e.g., 'en', 'es', 'fr')
            emotion: Emotion to apply (optional)
            pitch_shift: Pitch shift in semitones (-12 to +12)
            speed: Speech speed multiplier (0.5 to 2.0)
            
        Returns:
            Path to generated audio file
        """
        import tempfile
        import os
        from pathlib import Path
        
        # Load model
        tts_model = self._load_model(model_path)
        
        # Create temporary output file
        output_dir = Path(tempfile.gettempdir()) / "voiceclone_tts"
        output_dir.mkdir(parents=True, exist_ok=True)
        
        output_path = output_dir / f"tts_{os.urandom(8).hex()}.wav"
        
        try:
            # Generate audio
            # Coqui TTS API: tts.tts_to_file(text, file_path, speaker_wav=None, language=language)
            # For custom models, we use model_path which should be a directory containing the model
            
            # Check if model_path is a directory (custom trained model) or model name
            if Path(model_path).is_dir():
                # Custom trained model - use tts_to_file with model_path
                tts_model.tts_to_file(
                    text=text,
                    file_path=str(output_path),
                    language=language,
                )
            else:
                # Pre-trained model name - use model_name parameter
                tts_model.tts_to_file(
                    text=text,
                    file_path=str(output_path),
                    language=language,
                )
            
            # Apply post-processing if needed (pitch shift, speed)
            if pitch_shift != 0.0 or speed != 1.0:
                output_path = self._apply_audio_effects(
                    str(output_path),
                    pitch_shift=pitch_shift,
                    speed=speed,
                )
            
            return str(output_path)
            
        except Exception as e:
            # Cleanup on error
            if output_path.exists():
                output_path.unlink()
            raise RuntimeError(f"TTS generation failed: {e}") from e
    
    def _apply_audio_effects(
        self,
        audio_path: str,
        pitch_shift: float = 0.0,
        speed: float = 1.0,
    ) -> str:
        """Apply pitch shift and speed changes to audio."""
        try:
            import librosa
            import soundfile as sf
            import numpy as np
            from pathlib import Path
            
            # Load audio
            y, sr = librosa.load(audio_path, sr=None)
            
            # Apply pitch shift
            if pitch_shift != 0.0:
                # Convert semitones to pitch shift factor
                pitch_factor = 2 ** (pitch_shift / 12.0)
                y = librosa.effects.pitch_shift(
                    y,
                    sr=sr,
                    n_steps=pitch_shift,
                )
            
            # Apply speed change (time stretching)
            if speed != 1.0:
                y = librosa.effects.time_stretch(y, rate=speed)
            
            # Save processed audio
            output_path = Path(audio_path)
            sf.write(str(output_path), y, sr)
            
            return str(output_path)
            
        except ImportError:
            # If librosa/soundfile not available, return original
            return audio_path
        except Exception as e:
            # On error, return original file
            return audio_path

    def list_available_languages(self) -> list[str]:
        return ["en", "es", "fr", "de", "it", "pt", "pl", "tr", "ru", "nl", "cs", "ar", "zh", "ja", "ko", "hi"]

    def list_available_emotions(self) -> list[str]:
        return ["neutral", "happy", "sad", "angry", "fearful", "surprised", "disgusted"]
