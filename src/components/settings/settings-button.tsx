'use client';

import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { MouseEvent } from "react";
import { useTrialGate } from "@/components/trial/trial-gate";

interface SettingsButtonProps {
  className?: string;
  onAllowedNavigation?: () => void;
}

export function SettingsButton({ className, onAllowedNavigation }: SettingsButtonProps) {
  const trialGate = useTrialGate();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (trialGate.enabled) {
      event.preventDefault();
      event.stopPropagation();
      trialGate.open();
      return;
    }
    onAllowedNavigation?.();
  };

  return (
    <Link 
      href="/settings" 
      onClick={handleClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1",
        "text-sm font-medium text-purple-600/80 hover:text-purple-800",
        "transition-colors duration-200",
        className
      )}
    >
      <Settings className="h-4 w-4" />
      <span className="hidden sm:inline">Settings</span>
    </Link>
  );
} 
