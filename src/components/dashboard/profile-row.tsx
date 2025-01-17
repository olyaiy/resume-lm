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
    <div className="group relative">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 via-rose-100/20 to-teal-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-xl" />
      
      <div className="relative rounded-xl bg-gradient-to-br from-white/60 to-white/30 hover:from-white/70 hover:to-white/40 backdrop-blur-xl border border-white/40 shadow-lg transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-0.5">
        <div className="px-8 py-4 flex items-center gap-6">
          {/* Enhanced Avatar Circle */}
          <div className="shrink-0 h-14 w-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 p-[2.5px] shadow-xl group-hover:shadow-teal-500/25 transition-all duration-500">
            <div className="h-full w-full rounded-full bg-gradient-to-br from-white to-white/90 p-2 flex items-center justify-center">
              <User className="h-6 w-6 text-teal-600/80" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Name with enhanced gradient */}
            <h3 className="text-xl font-semibold bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent pb-1">
              {profile.first_name} {profile.last_name}
            </h3>

            {/* Stats Row with enhanced styling */}
            <div className="flex flex-wrap items-center gap-3">
              {[
                { 
                  icon: Briefcase, 
                  label: "Experience", 
                  count: profile.work_experience.length,
                  colors: {
                    bg: "from-cyan-50/50 to-cyan-100/50",
                    text: "text-cyan-700",
                    iconBg: "bg-cyan-100",
                    border: "border-cyan-200"
                  }
                },
                { 
                  icon: GraduationCap, 
                  label: "Education", 
                  count: profile.education.length,
                  colors: {
                    bg: "from-indigo-50/50 to-indigo-100/50",
                    text: "text-indigo-700",
                    iconBg: "bg-indigo-100",
                    border: "border-indigo-200"
                  }
                },
                { 
                  icon: Code, 
                  label: "Projects", 
                  count: profile.projects.length,
                  colors: {
                    bg: "from-violet-50/50 to-violet-100/50",
                    text: "text-violet-700",
                    iconBg: "bg-violet-100",
                    border: "border-violet-200"
                  }
                },
                { 
                  icon: Award, 
                  label: "Certifications", 
                  count: profile.certifications.length,
                  colors: {
                    bg: "from-rose-50/50 to-rose-100/50",
                    text: "text-rose-700",
                    iconBg: "bg-rose-100",
                    border: "border-rose-200"
                  }
                }
              ].map((stat) => (
                <div 
                  key={stat.label} 
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full",
                    "bg-gradient-to-r border backdrop-blur-sm",
                    "transition-all duration-500 hover:shadow-sm",
                    "hover:-translate-y-0.5",
                    stat.colors.bg,
                    stat.colors.border
                  )}
                >
                  <div className={cn(
                    "p-1 rounded-full transition-transform duration-300",
                    stat.colors.iconBg,
                    "group-hover:scale-110"
                  )}>
                    <stat.icon className={cn("h-3.5 w-3.5", stat.colors.text)} />
                  </div>
                  <span className="text-sm whitespace-nowrap">
                    <span className={cn("font-semibold", stat.colors.text)}>{stat.count}</span>
                    <span className="text-muted-foreground ml-1.5">{stat.label}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Edit Button with enhanced styling */}
          <Link href="/profile" className="shrink-0">  
            <Button
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200 hover:border-teal-300 text-teal-700 
                         hover:bg-gradient-to-r hover:from-teal-100 hover:to-cyan-100
                         transition-all duration-500 hover:-translate-y-0.5 hover:shadow-md shadow-sm"
            >
              <Pencil className="h-3.5 w-3.5 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 