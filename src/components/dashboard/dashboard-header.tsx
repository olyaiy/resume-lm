import { LogoutButton } from "@/components/auth/logout-button";
import { SettingsButton } from "@/components/settings/settings-button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { User } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="h-20 border-b backdrop-blur-xl sticky top-0 left-0 right-0 z-40 shadow-lg border-purple-200/50">
      {/* Gradient backdrop with blur */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50/95 via-white/95 to-purple-50/95" />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3e8ff30_0%,#ffffff40_50%,#f3e8ff30_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-40%,#f3e8ff30_0%,transparent_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_100%_100%,#f3e8ff20_0%,transparent_100%)] pointer-events-none" />

      {/* Content Container */}
      <div className="max-w-[2000px] mx-auto h-full px-6 flex items-center justify-between relative">
        {/* Left Section - Logo and Title */}
        <div className="flex items-center gap-6">
          <Logo className="text-xl" />
          <div className="h-8 w-px bg-purple-200/50 hidden sm:block" />
          <div className="flex flex-col justify-center gap-1">
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold">
                <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                  Dashboard
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-3 px-4 py-2 rounded-full",
            "bg-gradient-to-br from-purple-500/10 to-indigo-500/10",
            "border border-purple-200/50 backdrop-blur-md",
            "shadow-md hover:shadow-lg transition-all duration-500",
            "hover:shadow-purple-500/20",
            "relative overflow-hidden"
          )}>
            <Link href="/profile" className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">
              <User className="h-4 w-4" />
              Profile
            </Link>
            <div className="w-px h-6 bg-purple-300" />
            <SettingsButton />
            <div className="w-px h-6 bg-purple-300" />
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
} 