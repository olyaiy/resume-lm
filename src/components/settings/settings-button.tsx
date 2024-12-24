'use client';

import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function SettingsButton() {
  const router = useRouter();

  return (
    <Button 
      variant="outline" 
      className="bg-white/50 border-gray-200 hover:border-gray-300 hover:bg-white/60"
      onClick={() => router.push('/settings')}
    >
      <Settings className="h-4 w-4 mr-2" />
      Settings
    </Button>
  );
} 