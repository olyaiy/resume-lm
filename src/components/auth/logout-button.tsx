'use client'

import { logout } from "@/app/auth/login/actions";
import { Button } from "@/components/ui/button";


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