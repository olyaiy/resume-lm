"use client";

import * as React from "react";
import Link from "next/link";
import { User, Settings, LogOut, Linkedin } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export function NavMenu() {
  return (
    <NavigationMenu className="ml-auto">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[250px] gap-3 p-4">
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    className="flex items-center gap-2 select-none p-3 rounded-md no-underline outline-none transition-colors hover:bg-purple-100 hover:text-purple-900 focus:bg-purple-100 focus:text-purple-900"
                    href="/profile"
                  >
                    <User className="h-4 w-4" />
                    <span>Update Profile</span>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    className="flex items-center gap-2 select-none p-3 rounded-md no-underline outline-none transition-colors hover:bg-purple-100 hover:text-purple-900 focus:bg-purple-100 focus:text-purple-900"
                    href="/profile/linkedin"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span>Import LinkedIn</span>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[250px] gap-3 p-4">
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    className="flex items-center gap-2 select-none p-3 rounded-md no-underline outline-none transition-colors hover:bg-purple-100 hover:text-purple-900 focus:bg-purple-100 focus:text-purple-900"
                    href="/settings"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink asChild>
                  <Link
                    className="flex items-center gap-2 select-none p-3 rounded-md no-underline outline-none transition-colors hover:bg-purple-100 hover:text-purple-900 focus:bg-purple-100 focus:text-purple-900 text-red-600 hover:text-red-700"
                    href="/logout"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
} 