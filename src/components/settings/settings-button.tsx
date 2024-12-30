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
      <span className="relative z-10 flex items-center gap-2 text-purple-600/80 group-hover:text-purple-700 transition-colors duration-500">
        <Settings className="w-4 h-4" />
        <span>Settings</span>
      </span>
    </Button>
  );
} 