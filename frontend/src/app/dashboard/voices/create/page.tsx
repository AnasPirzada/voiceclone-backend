"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useVoices } from "@/hooks/use-voices";
import { Upload } from "@/components/audio/upload";
import { Recorder } from "@/components/audio/recorder";
import { SUPPORTED_LANGUAGES } from "@/lib/utils/constants";
import { getErrorMessage } from "@/lib/utils/error-handler";

export default function CreateVoicePage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("en");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createVoice, uploadSample } = useVoices();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const voice = await createVoice(name, description, language);
      for (const file of files) {
        await uploadSample(voice.id, file);
      }
      router.push(`/dashboard/voices/${voice.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/voices" className="text-sm text-gray-400 hover:text-white mb-4 block">
        ← Back to Voices
      </Link>
      <h1 className="text-2xl font-bold mb-2 text-white">Create Voice Profile</h1>
      <p className="text-sm text-gray-400 mb-6">Upload your voice samples and create a new voice clone.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-gray-700 rounded-xl p-6 bg-gray-900/50 space-y-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Voice Details</h2>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Voice, Narrator Voice"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 focus:ring-1 focus:ring-indigo-500/50 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of this voice profile..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 focus:ring-1 focus:ring-indigo-500/50 outline-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-400">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 focus:ring-1 focus:ring-indigo-500/50 outline-none"
            >
              {Object.entries(SUPPORTED_LANGUAGES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border border-gray-700 rounded-xl p-6 bg-gray-900/50">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Voice Samples</h2>
          <p className="text-xs text-gray-500 mb-4">
            Upload 5-30 seconds of clear speech. More samples = better quality. Supported: WAV, MP3, FLAC, OGG, M4A.
          </p>

          <Upload onFileSelect={(f) => setFiles((prev) => [...prev, f])} />

          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Or record directly:</p>
            <Recorder
              onRecordingComplete={(blob) =>
                setFiles((prev) => [
                  ...prev,
                  new File([blob], `recording-${Date.now()}.wav`, { type: "audio/wav" }),
                ])
              }
            />
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-gray-400 font-semibold">{files.length} file{files.length !== 1 ? "s" : ""} selected:</p>
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-800/50 rounded-lg">
                  <span className="text-sm text-gray-300 truncate">{f.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{(f.size / (1024 * 1024)).toFixed(2)} MB</span>
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                      className="text-red-400/60 hover:text-red-400 text-sm transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !name}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Create Voice Profile"}
        </button>
      </form>
    </div>
  );
}
