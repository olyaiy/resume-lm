'use client';

import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function SettingsButton() {
  const router = useRouter();

  return (
    <Button 
      variant="ghost" 
      className="relative group px-4 py-2 hover:bg-transparent"
      onClick={() => router.push('/settings')}
    >
      <span className="relative z-10 flex items-center gap-2 bg-gradient-to-r from-purple-600/80 via-pink-500/80 to-indigo-500/80 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:via-pink-600 group-hover:to-indigo-600 transition-all duration-500 animate-gradient-x">
        <Settings className="w-4 h-4" />
        <span>Settings</span>
      </span>
    </Button>
  );
} 