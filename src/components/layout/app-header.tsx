'use client';

import { LogoutButton } from "@/components/auth/logout-button";
import { SettingsButton } from "@/components/settings/settings-button";
// import { ModelSelector } from "@/components/settings/model-selector";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Menu, User } from "lucide-react";
import { PageTitle } from "./page-title";
// import { TogglePlanButton } from '@/components/settings/toggle-plan-button';
import { ProUpgradeButton } from "@/components/settings/pro-upgrade-button";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface AppHeaderProps {
  children?: React.ReactNode;
  showUpgradeButton?: boolean;
}

export function AppHeader({ children, showUpgradeButton = true }: AppHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="h-14 border-b backdrop-blur-xl fixed top-0 left-0 right-0 z-40 shadow-md border-purple-200/50">
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
          <div className="flex items-center min-w-0 max-w-[140px] sm:max-w-[300px] lg:max-w-[600px]">
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
            <>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-2">
                {showUpgradeButton && (
                  <>
                    <ProUpgradeButton />
                    <div className="h-4 w-px bg-purple-200/50 ml-3" />
                  </>
                )}
                
                <div className="flex items-center px-3 py-1">
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
                  <div className="mx-2 h-4 w-px bg-purple-200/50" />
                  <SettingsButton />
                  <div className="mx-2 h-4 w-px bg-purple-200/50" />
                  <LogoutButton />
                </div>
              </nav>

              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 pt-6">
                    {showUpgradeButton && <ProUpgradeButton className="w-full" />}
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md",
                        "text-sm font-medium text-purple-600/80 hover:text-purple-800",
                        "hover:bg-purple-50 transition-colors duration-200"
                      )}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <div className="px-4">
                      <SettingsButton className="w-full justify-start" />
                    </div>
                    <div className="px-4">
                      <LogoutButton className="w-full justify-start" />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </header>
  );
}