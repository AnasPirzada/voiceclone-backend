from pathlib import Path
from dataclasses import dataclass


@dataclass
class AudioMetadata:
    duration: float
    sample_rate: int
    channels: int
    format: str


class AudioPreprocessor:
    SUPPORTED_FORMATS = {"wav", "mp3", "flac", "ogg", "m4a"}
    TARGET_SAMPLE_RATE = 22050
    TARGET_CHANNELS = 1

    def validate_audio(self, file_path: Path) -> AudioMetadata:
        ...

    def normalize_audio(self, file_path: Path, output_path: Path) -> Path:
        ...

    def resample(self, file_path: Path, target_sr: int, output_path: Path) -> Path:
        ...

    def trim_silence(self, file_path: Path, output_path: Path, threshold_db: float = -40.0) -> Path:
        ...

    def split_into_segments(self, file_path: Path, segment_length_seconds: float = 10.0) -> list[Path]:
        ...
