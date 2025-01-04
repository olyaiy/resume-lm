'use client';

import { Profile } from "@/lib/types";
import { User, MapPin, Mail, Phone, Briefcase, GraduationCap, Code, Award, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProfileRowProps {
  profile: Profile;
}

export function ProfileRow({ profile }: ProfileRowProps) {
  return (
    <div className="group relative rounded-xl overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 via-sky-50/50 to-rose-50/50 animate-gradient" />
      <div className="absolute inset-0 bg-white/40 backdrop-blur-md" />
      
      {/* Hover effect gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-600/5 via-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out" />
      
      {/* Content container */}
      <div className="relative border border-white/40 shadow-lg hover:shadow-xl transition-all duration-500">
        <div className="px-6 py-4 flex items-start gap-4">
          {/* Enhanced Avatar Circle */}
          <div className="relative shrink-0 h-14 w-14">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-500 via-cyan-500 to-purple-500 animate-spin-slow opacity-70 blur-sm" />
            <div className="relative h-full w-full rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 p-[2px] shadow-xl group-hover:-translate-y-0.5 transition-transform duration-500">
              <div className="h-full w-full rounded-full bg-white/95 flex items-center justify-center">
                <User className="h-6 w-6 text-teal-600/90" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Enhanced Name and Edit Section */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">
                <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent">
                  {profile.first_name} {profile.last_name}
                </span>
              </h3>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-white/50 hover:text-teal-600"
              >
                <Link href="/profile">
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit Profile
                </Link>
              </Button>
            </div>

            {/* Enhanced Metadata Row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {/* Contact Info with hover effects */}
              {profile.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-teal-600 transition-colors duration-300">
                  <div className="p-1 rounded-full bg-teal-50/50 group-hover:bg-teal-100/50 transition-colors duration-300">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <span>{profile.location}</span>
                </div>
              )}
              
              {profile.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-cyan-600 transition-colors duration-300">
                  <div className="p-1 rounded-full bg-cyan-50/50 group-hover:bg-cyan-100/50 transition-colors duration-300">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <span>{profile.email}</span>
                </div>
              )}
              
              {profile.phone_number && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-purple-600 transition-colors duration-300">
                  <div className="p-1 rounded-full bg-purple-50/50 group-hover:bg-purple-100/50 transition-colors duration-300">
                    <Phone className="h-3.5 w-3.5" />
                  </div>
                  <span>{profile.phone_number}</span>
                </div>
              )}

              {/* Enhanced divider */}
              <div className="h-4 w-px bg-gradient-to-b from-muted/10 via-muted/30 to-muted/10" />

              {/* Enhanced Stats */}
              {[
                { 
                  icon: Briefcase, 
                  label: "Experience", 
                  count: profile.work_experience.length,
                  colors: {
                    bg: "bg-cyan-100/80",
                    text: "text-cyan-600",
                    gradient: "from-cyan-600 to-blue-600",
                    hover: "hover:from-cyan-500 hover:to-blue-500"
                  }
                },
                { 
                  icon: GraduationCap, 
                  label: "Education", 
                  count: profile.education.length,
                  colors: {
                    bg: "bg-indigo-100/80",
                    text: "text-indigo-600",
                    gradient: "from-indigo-600 to-blue-600",
                    hover: "hover:from-indigo-500 hover:to-blue-500"
                  }
                },
                { 
                  icon: Code, 
                  label: "Projects", 
                  count: profile.projects.length,
                  colors: {
                    bg: "bg-violet-100/80",
                    text: "text-violet-600",
                    gradient: "from-violet-600 to-purple-600",
                    hover: "hover:from-violet-500 hover:to-purple-500"
                  }
                },
                { 
                  icon: Award, 
                  label: "Certifications", 
                  count: profile.certifications.length,
                  colors: {
                    bg: "bg-rose-100/80",
                    text: "text-rose-600",
                    gradient: "from-rose-600 to-pink-600",
                    hover: "hover:from-rose-500 hover:to-pink-500"
                  }
                }
              ].map((stat) => (
                <div 
                  key={stat.label}
                  className="group/stat flex items-center gap-2 px-2 py-1 rounded-md bg-white/30 hover:bg-white/50 transition-all duration-300"
                >
                  <div className={cn(
                    "h-5 w-5 rounded-md flex items-center justify-center transition-all duration-300",
                    "bg-gradient-to-br shadow-sm group-hover/stat:shadow-md",
                    `bg-gradient-to-r ${stat.colors.gradient}`,
                    stat.colors.hover
                  )}>
                    <stat.icon className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm">
                    <span className={cn("font-medium", stat.colors.text)}>{stat.count}</span>
                    <span className="text-muted-foreground/70 ml-1">{stat.label}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 