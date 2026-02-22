"use client";

import { useAuthStore } from "@/store/auth-store";
import Link from "next/link";

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="border-b px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">AI Voice Cloning Platform</h2>
      </div>
      <div className="flex items-center gap-4">
        {isAuthenticated && user ? (
          <>
            <span className="text-sm">{user.full_name}</span>
            {user.role === "admin" && (
              <Link href="/admin" className="text-xs text-indigo-600 hover:underline">Admin</Link>
            )}
            <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
          </>
        ) : (
          <Link href="/auth/login" className="text-sm text-indigo-600 hover:underline">Login</Link>
        )}
      </div>
    </header>
  );
}
