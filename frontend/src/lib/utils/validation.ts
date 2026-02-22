export const ALLOWED_AUDIO_FORMATS = ["audio/wav", "audio/mp3", "audio/mpeg", "audio/flac", "audio/ogg", "audio/x-m4a"];
export const MAX_FILE_SIZE_MB = 50;
export const MAX_TEXT_LENGTH = 5000;

export function validateAudioFile(file: File): string | null {
  if (!ALLOWED_AUDIO_FORMATS.includes(file.type)) {
    return `Unsupported format. Allowed: WAV, MP3, FLAC, OGG, M4A`;
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `File too large. Maximum: ${MAX_FILE_SIZE_MB}MB`;
  }
  return null;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("At least one uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("At least one lowercase letter");
  if (!/\d/.test(password)) errors.push("At least one digit");
  return { valid: errors.length === 0, errors };
}

export function validateTTSText(text: string): string | null {
  if (!text.trim()) return "Text is required";
  if (text.length > MAX_TEXT_LENGTH) return `Text too long. Maximum: ${MAX_TEXT_LENGTH} characters`;
  return null;
}
