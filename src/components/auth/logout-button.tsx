'use client'

import { logout } from "@/app/auth/login/actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <Button 
      variant="ghost" 
      onClick={() => logout()}
      className="relative group px-4 py-2 hover:bg-transparent"
    >
      <span className="relative z-10 flex items-center gap-2 bg-gradient-to-r from-purple-600/80 via-pink-500/80 to-indigo-500/80 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:via-pink-600 group-hover:to-indigo-600 transition-all duration-500 animate-gradient-x">
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </span>
    </Button>
  );
} 