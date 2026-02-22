SUPPORTED_LANGUAGES = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "pl": "Polish",
    "tr": "Turkish",
    "ru": "Russian",
    "nl": "Dutch",
    "cs": "Czech",
    "ar": "Arabic",
    "zh": "Chinese",
    "ja": "Japanese",
    "ko": "Korean",
    "hi": "Hindi",
}

EMOTIONS = ["neutral", "happy", "sad", "angry", "fearful", "surprised", "disgusted"]

JOB_STATUS_TRANSITIONS = {
    "queued": ["processing", "cancelled"],
    "processing": ["completed", "failed", "cancelled"],
    "completed": [],
    "failed": [],
    "cancelled": [],
}

MAX_TEXT_LENGTH = 5000
MIN_SAMPLE_DURATION = 3.0
MAX_SAMPLE_DURATION = 300.0
MIN_SAMPLES_FOR_TRAINING = 5
RECOMMENDED_SAMPLES = 20
