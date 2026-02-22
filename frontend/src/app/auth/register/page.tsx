"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { getErrorMessage } from "@/lib/utils/error-handler";
import { validatePassword } from "@/lib/utils/validation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { valid, errors } = validatePassword(password);
    if (!valid) {
      setError(errors.join(", "));
      return;
    }
    try {
      await register(email, password, fullName);
      router.push("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0B0F19]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              VoiceClone AI
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white mt-4">Create Your Account</h1>
          <p className="text-sm text-gray-400 mt-1">Start cloning voices for free</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border border-gray-700 rounded-xl p-6 bg-gray-900/50 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 focus:ring-1 focus:ring-indigo-500/50 outline-none"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 focus:ring-1 focus:ring-indigo-500/50 outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 focus:ring-1 focus:ring-indigo-500/50 outline-none"
                placeholder="Min 8 chars, uppercase, lowercase, digit"
                required
                minLength={8}
              />
              <p className="text-[10px] text-gray-600 mt-1">Min 8 characters, including uppercase, lowercase, and digit</p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
