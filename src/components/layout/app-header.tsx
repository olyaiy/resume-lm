'use client';

import { LogoutButton } from "@/components/auth/logout-button";
import { SettingsButton } from "@/components/settings/settings-button";
import { ModelSelector } from "@/components/settings/model-selector";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { User, CreditCard } from "lucide-react";
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

        {/* Right Section - Navigation Items */}
        <div className="flex items-center">
          {children ? (
            children
          ) : (
            <nav className="flex items-center">
              <Link 
                href="/subscription" 
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1",
                  "text-sm font-medium text-purple-600/80 hover:text-purple-800",
                  "transition-colors duration-200"
                )}
              >
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Subscription</span>
              </Link>
              <div className="h-4 w-px bg-purple-200/50" />
              <Link 
                href="/profile" 
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1",
                  "text-sm font-medium text-purple-600/80 hover:text-purple-800",
                  "transition-colors duration-200"
                )}
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
              <div className="h-4 w-px bg-purple-200/50" />
              <div className="flex items-center px-3 py-1">
                <ModelSelector />
                <div className="mx-2 h-4 w-px bg-purple-200/50" />
                <SettingsButton />
                <div className="mx-2 h-4 w-px bg-purple-200/50" />
                <LogoutButton />
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
} 