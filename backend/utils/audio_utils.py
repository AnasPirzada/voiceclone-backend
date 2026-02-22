from pathlib import Path


def get_audio_duration(file_path: str) -> float:
    import librosa
    y, sr = librosa.load(file_path, sr=None)
    return float(len(y) / sr)


def get_audio_metadata(file_path: str) -> dict:
    import librosa
    y, sr = librosa.load(file_path, sr=None)
    return {
        "duration": float(len(y) / sr),
        "sample_rate": sr,
        "channels": 1 if y.ndim == 1 else y.shape[0],
    }


def convert_to_wav(input_path: str, output_path: str, sample_rate: int = 22050) -> str:
    import soundfile as sf
    import librosa
    y, sr = librosa.load(input_path, sr=sample_rate)
    sf.write(output_path, y, sample_rate)
    return output_path
