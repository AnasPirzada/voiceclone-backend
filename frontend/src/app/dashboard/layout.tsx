"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/store/auth-store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, tokens, fetchUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // If we have tokens but no user loaded yet, fetch user
    if (tokens && !isAuthenticated) {
      fetchUser();
    }
    // If no tokens at all, redirect to login
    if (!tokens) {
      router.push("/auth/login");
    }
  }, [tokens, isAuthenticated, fetchUser, router]);

  // Show loading while checking auth
  if (!tokens) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F19]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
