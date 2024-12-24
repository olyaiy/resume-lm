'use client'

import { Button } from "@/components/ui/button";
import { logout } from "@/app/auth/actions";

export function LogoutButton() {
  return (
    <Button 
      variant="outline" 
      onClick={() => logout()}
      className="bg-white/50 hover:bg-white/60 transition-colors duration-500"
    >
      Logout
    </Button>
  );
} 