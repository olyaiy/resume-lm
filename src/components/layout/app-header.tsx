import { LogoutButton } from "@/components/auth/logout-button";
import { SettingsButton } from "@/components/settings/settings-button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { User } from "lucide-react";
import { PageTitle } from "./page-title";

interface AppHeaderProps {
  children?: React.ReactNode;
}

export function AppHeader({ children }: AppHeaderProps) {
  return (
    <header className="h-14 border-b backdrop-blur-xl sticky top-0 left-0 right-0 z-40 shadow-md border-purple-200/50">
      {/* Gradient backdrop with blur */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50/95 via-white/95 to-purple-50/95" />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f3e8ff30_0%,#ffffff40_50%,#f3e8ff30_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-40%,#f3e8ff30_0%,transparent_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_100%_100%,#f3e8ff20_0%,transparent_100%)] pointer-events-none" />

      {/* Content Container */}
      <div className="max-w-[2000px] mx-auto h-full px-3 flex items-center justify-between relative">
        {/* Left Section - Logo and Title */}
        <div className="flex items-center gap-3">
          <Logo className="text-xl" />
          <div className="h-5 w-px bg-purple-200/50 hidden sm:block" />
          <div className="flex items-center">
            <PageTitle />
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center">
          {children ? (
            children
          ) : (
            <div className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded-full",
              "bg-gradient-to-br from-purple-500/5 to-indigo-500/5",
              "border border-purple-200/40 backdrop-blur-md",
              "shadow-sm hover:shadow-none transition-all duration-500",
              "relative overflow-hidden"
            )}>
              <Link 
                href="/profile" 
                className="flex items-center gap-0.5 px-1 py-0.5 text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
              >
                <User className="h-3 w-3" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
              <div className="w-px h-3.5 bg-purple-200/70" />
              <SettingsButton />
              <div className="w-px h-3.5 bg-purple-200/70" />
              <LogoutButton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 