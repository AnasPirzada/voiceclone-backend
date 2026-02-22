export const SUPPORTED_LANGUAGES = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  pl: "Polish",
  tr: "Turkish",
  ru: "Russian",
  nl: "Dutch",
  cs: "Czech",
  ar: "Arabic",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  hi: "Hindi",
} as const;

export const EMOTIONS = [
  "neutral",
  "happy",
  "sad",
  "angry",
  "fearful",
  "surprised",
  "disgusted",
] as const;

export const PLAN_FEATURES = {
  free: { voices: 3, generations: 10, storage: "100MB" },
  basic: { voices: 10, generations: 100, storage: "1GB" },
  pro: { voices: 50, generations: 500, storage: "10GB" },
  enterprise: { voices: -1, generations: -1, storage: "Unlimited" },
} as const;

export const JOB_POLL_INTERVAL = 3000;
export const WS_RECONNECT_DELAY = 5000;
