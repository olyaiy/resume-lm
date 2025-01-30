'use client';

import { LogoutButton } from "@/components/auth/logout-button";
import { SettingsButton } from "@/components/settings/settings-button";
import { ModelSelector } from "@/components/settings/model-selector";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { User, Sparkles } from "lucide-react";
import { PageTitle } from "./page-title";
import { motion } from "framer-motion";

interface AppHeaderProps {
  children?: React.ReactNode;
  showUpgradeButton?: boolean;
}

export function AppHeader({ children, showUpgradeButton = true }: AppHeaderProps) {
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
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
          <Logo className="text-xl flex-shrink-0" />
          <div className="h-5 w-px bg-purple-200/50 hidden sm:block flex-shrink-0" />
          <div className="flex items-center min-w-0 max-w-[300px] sm:max-w-[400px] lg:max-w-[600px]">
            <div className="truncate max-w-[80ch] overflow-hidden text-ellipsis">
              <PageTitle />
            </div>
          </div>
        </div>

        {/* Right Section - Navigation Items */}
        <div className="flex items-center flex-shrink-0">
          {children ? (
            children
          ) : (
            <nav className="flex items-center gap-2">
              {showUpgradeButton && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative group"
                  >
                    {/* Outer glow effect */}
                    <div className="absolute -inset-[3px] bg-gradient-to-r from-amber-500/0 via-orange-500/0 to-red-500/0 rounded-lg opacity-75 blur-md group-hover:from-amber-500/50 group-hover:via-orange-500/50 group-hover:to-red-500/50 transition-all duration-500" />
                    {/* Inner subtle gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-orange-400/0 to-red-400/0 rounded-lg opacity-100 group-hover:via-orange-400/10 transition-all duration-500" />
                    <Link 
                      href="/subscription" 
                      className={cn(
                        "relative flex items-center gap-1.5 px-4 py-1.5",
                        "bg-gradient-to-r from-amber-500 to-orange-500",
                        "hover:from-amber-500 hover:via-orange-500 hover:to-red-500",
                        "text-white font-medium rounded-lg",
                        "shadow-lg hover:shadow-xl hover:shadow-orange-500/20",
                        "transition-all duration-500",
                        "text-sm"
                      )}
                    >
                      <Sparkles className="h-4 w-4 transition-transform duration-500 group-hover:rotate-12" />
                      <span className="transition-all duration-500 group-hover:tracking-wider group-hover:translate-x-0.5">Upgrade to Pro</span>
                    </Link>
                  </motion.div>
                  <div className="h-4 w-px bg-purple-200/50 ml-3" />
                </>
              )}
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