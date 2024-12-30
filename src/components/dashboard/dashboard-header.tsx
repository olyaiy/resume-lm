import { LogoutButton } from "@/components/auth/logout-button";
import { SettingsButton } from "@/components/settings/settings-button";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  firstName: string | null;
}

export function DashboardHeader({ firstName }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 w-full">
      {/* Animated gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50/95 via-pink-50/95 to-indigo-50/95 backdrop-blur-xl animate-gradient-x" />
      
      {/* Gradient Overlays with Animation */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3e8ff30_0%,#ffe4e630_50%,#e0e7ff30_100%)] animate-gradient-x pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-40%,#f3e8ff30_0%,transparent_100%)] animate-pulse pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_100%_100%,#ffe4e630_0%,transparent_100%)] animate-pulse pointer-events-none" />

      {/* Main content */}
      <div className="relative px-4 md:px-6 lg:px-8 py-6 border-b border-pink-200/30 shadow-lg shadow-pink-500/10">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2.5">
              <div className="relative group">
                <h1 className={cn(
                  "text-2xl sm:text-3xl font-semibold tracking-tight",
                  "bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500",
                  "bg-clip-text text-transparent",
                  "transition-transform duration-500 ease-out",
                  "group-hover:-translate-y-0.5",
                  "animate-gradient-x bg-[length:200%_auto]"
                )}>
                  Welcome back{firstName ? `, ${firstName}` : ""}! 👋
                </h1>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 group-hover:w-full transition-all duration-500 animate-gradient-x" />
              </div>
              <p className="text-sm sm:text-base font-medium bg-gradient-to-r from-purple-600/60 via-pink-500/60 to-indigo-500/60 bg-clip-text text-transparent animate-gradient-x">
                Here's what's happening with your resumes
              </p>
            </div>
            <div className="flex items-center gap-4 self-end sm:self-auto">
              <div className="glass-card rounded-full p-1.5 hover:shadow-lg transition-all duration-500 bg-gradient-to-r from-white/40 via-pink-50/30 to-white/40 backdrop-blur-md border border-pink-200/30 animate-gradient-x">
                <div className="flex items-center gap-3">
                  <LogoutButton />
                  <div className="w-px h-6 bg-gradient-to-b from-purple-200/50 via-pink-200/50 to-indigo-200/50" />
                  <SettingsButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 