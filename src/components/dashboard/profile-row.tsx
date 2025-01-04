'use client';

import { Profile } from "@/lib/types";
import { User, MapPin, Mail, Phone, Briefcase, GraduationCap, Code, Award } from "lucide-react";

interface ProfileRowProps {
  profile: Profile;
}

export function ProfileRow({ profile }: ProfileRowProps) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-md border border-white/40 shadow-xl">
      {/* Top Banner */}
      <div className="h-16 rounded-t-xl bg-gradient-to-r from-teal-600/10 via-cyan-600/10 to-teal-600/10 border-b border-teal-200/20" />
      
      {/* Profile Content */}
      <div className="px-6 pb-4 -mt-8">
        {/* Avatar Circle */}
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 p-[2px] shadow-xl">
          <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
            <User className="h-6 w-6 text-teal-600" />
          </div>
        </div>

        {/* Profile Grid */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Basic Info */}
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-teal-600">Full Name</p>
            <p className="font-medium">{profile.first_name} {profile.last_name}</p>
          </div>

          {profile.location && (
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-teal-600">Location</p>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{profile.location}</p>
              </div>
            </div>
          )}

          {profile.email && (
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-teal-600">Email</p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>
          )}

          {profile.phone_number && (
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-teal-600">Phone</p>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{profile.phone_number}</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="mt-4 pt-4 border-t border-teal-100/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-teal-50/50 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="font-medium">{profile.work_experience.length} entries</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-teal-50/50 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Education</p>
                <p className="font-medium">{profile.education.length} entries</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-teal-50/50 flex items-center justify-center">
                <Code className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Projects</p>
                <p className="font-medium">{profile.projects.length} entries</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-teal-50/50 flex items-center justify-center">
                <Award className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Certifications</p>
                <p className="font-medium">{profile.certifications.length} entries</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 