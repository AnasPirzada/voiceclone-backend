from pathlib import Path


class AudioPostprocessor:
    def apply_pitch_shift(self, audio_path: Path, semitones: float, output_path: Path) -> Path:
        ...

    def apply_speed_change(self, audio_path: Path, speed_factor: float, output_path: Path) -> Path:
        ...

    def normalize_volume(self, audio_path: Path, target_db: float, output_path: Path) -> Path:
        ...

    def convert_format(self, audio_path: Path, target_format: str, output_path: Path) -> Path:
        ...

    def add_fade(self, audio_path: Path, fade_in_ms: int, fade_out_ms: int, output_path: Path) -> Path:
        ...
