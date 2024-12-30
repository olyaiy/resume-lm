import { LogoutButton } from "@/components/auth/logout-button";
import { SettingsButton } from "@/components/settings/settings-button";

interface DashboardHeaderProps {
  firstName: string | null;
}

export function DashboardHeader({ firstName }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 py-6 px-4 md:px-6 lg:px-8 border-b bg-white/50 backdrop-blur-lg">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Welcome back{firstName ? `, ${firstName}` : ""}! 👋
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Here's what's happening with your resumes
            </p>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <LogoutButton />
            <SettingsButton />
          </div>
        </div>
      </div>
    </header>
  );
} 