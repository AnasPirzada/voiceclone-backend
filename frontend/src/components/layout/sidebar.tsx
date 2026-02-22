"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/store/auth-store";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Voices", href: "/dashboard/voices", icon: "🎤" },
  { name: "Studio", href: "/studio", icon: "🎙️" },
  { name: "Generate", href: "/dashboard/generate", icon: "🔊" },
  { name: "Convert", href: "/dashboard/convert", icon: "🔄" },
  { name: "Jobs", href: "/dashboard/jobs", icon: "📋" },
  { name: "Analytics", href: "/dashboard/analytics", icon: "📈" },
  { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <aside className="w-64 border-r border-gray-800/60 min-h-screen p-4 bg-[#0E1425] flex flex-col">
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            VoiceClone AI
          </span>
        </Link>
        <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest">Free Platform</p>
      </div>
      <nav className="space-y-1 flex-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                isActive
                  ? "bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="pt-4 border-t border-gray-800/60 space-y-3">
        <div className="px-3 py-3 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <p className="text-xs font-semibold text-indigo-400 mb-1">100% Free</p>
          <p className="text-[10px] text-gray-500">Unlimited voice cloning. No credit card needed.</p>
        </div>

        {/* User info & logout */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-300 truncate">{user?.full_name || "User"}</p>
            <p className="text-[10px] text-gray-600 truncate">{user?.email || ""}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors ml-2 shrink-0"
            title="Sign out"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
