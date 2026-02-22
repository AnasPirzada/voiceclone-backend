from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path


@dataclass
class TranscriptionResult:
    text: str
    language: str
    segments: list[dict]
    duration: float


class WhisperServiceBase(ABC):
    @abstractmethod
    def transcribe(self, audio_path: Path, language: str | None = None) -> TranscriptionResult:
        ...

    @abstractmethod
    def detect_language(self, audio_path: Path) -> str:
        ...


class WhisperService(WhisperServiceBase):
    def __init__(self):
        self._model = None

    def _load_model(self):
        import whisper
        from backend.config.settings import settings
        if self._model is None:
            self._model = whisper.load_model(settings.WHISPER_MODEL_SIZE)
        return self._model

    def transcribe(self, audio_path: Path, language: str | None = None) -> TranscriptionResult:
        model = self._load_model()
        options = {}
        if language:
            options["language"] = language

        result = model.transcribe(str(audio_path), **options)

        return TranscriptionResult(
            text=result["text"],
            language=result.get("language", "en"),
            segments=[
                {"start": s["start"], "end": s["end"], "text": s["text"]}
                for s in result.get("segments", [])
            ],
            duration=result.get("segments", [{}])[-1].get("end", 0.0) if result.get("segments") else 0.0,
        )

    def detect_language(self, audio_path: Path) -> str:
        model = self._load_model()
        audio = model.load_audio(str(audio_path))
        audio = model.pad_or_trim(audio)
        mel = model.log_mel_spectrogram(audio).to(model.device)
        _, probs = model.detect_language(mel)
        return max(probs, key=probs.get)
