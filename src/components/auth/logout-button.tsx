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
      <span className="relative z-10 flex items-center gap-2 text-purple-600/80 group-hover:text-purple-700 transition-colors duration-500">
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </span>
    </Button>
  );
} 