import { LogoutButton } from "@/components/auth/logout-button";
import { SettingsButton } from "@/components/settings/settings-button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  firstName: string | null;
}

export function DashboardHeader({ firstName }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 w-full">
      {/* Gradient backdrop with blur */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50/95 via-white/95 to-purple-50/95 backdrop-blur-xl" />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3e8ff30_0%,#ffffff40_50%,#f3e8ff30_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-40%,#f3e8ff30_0%,transparent_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_100%_100%,#f3e8ff20_0%,transparent_100%)] pointer-events-none" />

      {/* Main content */}
      <div className="relative px-4 md:px-6 lg:px-8 py-6 border-b border-purple-200/50 shadow-lg shadow-purple-500/10">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Logo />
              <div className="h-8 w-px bg-purple-200/50 hidden sm:block" />
              <div className="space-y-2.5">
                <div className="relative group">
                  <h1 className={cn(
                    "text-2xl sm:text-3xl font-semibold tracking-tight",
                    "bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600",
                    "bg-clip-text text-transparent",
                    "transition-transform duration-500 ease-out",
                    "group-hover:-translate-y-0.5"
                  )}>
                    Welcome back{firstName ? `, ${firstName}` : ""}! 👋
                  </h1>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 group-hover:w-full transition-all duration-500" />
                </div>
                <p className="text-sm sm:text-base text-purple-600/60 font-medium">
                  Here&apos;s what&apos;s happening with your resumes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 self-end sm:self-auto">
              <div className="glass-card rounded-full p-1.5 hover:shadow-lg transition-all duration-500 bg-white/40 backdrop-blur-md border border-purple-200/50">
                <div className="flex items-center gap-3">
                  <LogoutButton />
                  <div className="w-px h-6 bg-purple-200/50" />
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