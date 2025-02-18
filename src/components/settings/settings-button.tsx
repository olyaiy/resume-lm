'use client';

import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SettingsButtonProps {
  className?: string;
}

export function SettingsButton({ className }: SettingsButtonProps) {

  return (
    <Link 
      href="/settings" 
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