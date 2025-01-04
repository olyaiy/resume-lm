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
    <div className="relative rounded-xl bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-md border border-white/40 shadow-lg">
      <div className="px-6 py-4 flex items-start gap-4">
        {/* Avatar Circle */}
        <div className="shrink-0 h-14 w-14 rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 p-[2px] shadow-xl">
          <div className="h-full w-full rounded-full bg-white/95 flex items-center justify-center">
            <User className="h-6 w-6 text-teal-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Top Row - Name and Edit */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              {profile.first_name} {profile.last_name}
            </h3>
            <Link href="/profile">
              <Button
                variant="outline"
                size="sm"
                className="border-teal-200 bg-white/50 text-teal-700 hover:bg-white/70 hover:border-teal-300"
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit Profile
              </Button>
            </Link>
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {/* Contact Info */}
            {profile.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{profile.location}</span>
              </div>
            )}
            
            {profile.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>{profile.email}</span>
              </div>
            )}
            
            {profile.phone_number && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span>{profile.phone_number}</span>
              </div>
            )}

            {/* Divider */}
            <div className="h-4 w-px bg-muted/30" />

            {/* Stats */}
            {[
              { 
                icon: Briefcase, 
                label: "Experience", 
                count: profile.work_experience.length,
                colors: {
                  bg: "bg-cyan-500/10",
                  text: "text-cyan-600",
                  iconBg: "bg-cyan-100",
                  border: "border-cyan-500/60"
                }
              },
              { 
                icon: GraduationCap, 
                label: "Education", 
                count: profile.education.length,
                colors: {
                  bg: "bg-indigo-500/10",
                  text: "text-indigo-600",
                  iconBg: "bg-indigo-100",
                  border: "border-indigo-500/60"
                }
              },
              { 
                icon: Code, 
                label: "Projects", 
                count: profile.projects.length,
                colors: {
                  bg: "bg-violet-500/10",
                  text: "text-violet-600",
                  iconBg: "bg-violet-100",
                  border: "border-violet-500/60"
                }
              },
              { 
                icon: Award, 
                label: "Certifications", 
                count: profile.certifications.length,
                colors: {
                  bg: "bg-rose-500/10",
                  text: "text-rose-600",
                  iconBg: "bg-rose-100",
                  border: "border-rose-500/60"
                }
              }
            ].map((stat) => (
              <div key={stat.label} 
                className={cn(
                  "flex items-center gap-2 px-2 py-1 rounded-xl relative transition-all duration-300",
                  "bg-gradient-to-r border",
                  stat.colors.bg,
                  stat.colors.border
                )}
              >
                <div className={cn(
                  "p-1 rounded-full transition-transform duration-300",
                  stat.colors.iconBg
                )}>
                  <stat.icon className={cn("h-3 w-3", stat.colors.text)} />
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
  );
} 