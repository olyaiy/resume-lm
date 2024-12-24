import { Profile } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, MapPin, Mail, Phone, Globe, Linkedin, Github, Edit2, ChevronRight, Briefcase, GraduationCap, Wrench, FolderGit2, Award } from "lucide-react";
import { ProfileView } from "./profile-view";

interface ProfileCardProps {
  profile: Profile;
}

interface ContactItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  href?: string;
}

function ContactItem({ icon, label, value, href }: ContactItemProps) {
  if (!value) return null;
  
  const content = (
    <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
      {icon}
      <span>{value}</span>
    </div>
  );

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
      {content}
    </a>
  ) : (
    <div>{content}</div>
  );
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const {
    first_name,
    last_name,
    email,
    phone_number,
    location,
    website,
    linkedin_url,
    github_url,
    professional_summary,
  } = profile;

  const fullName = [first_name, last_name].filter(Boolean).join(" ");

  return (
    <Card className="overflow-hidden border-white/40 shadow-xl backdrop-blur-xl hover:shadow-2xl transition-all duration-300">
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-cyan-500/5">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
        </div>
        
        {/* Header Content */}
        <div className="relative px-8 py-7 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/10">
              <User className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Profile
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Your master profile information used to generate all resumes
              </p>
            </div>
          </div>
          <Link href="/profile/edit">
            <Button 
              variant="outline" 
              className="bg-white/50 border-teal-200 hover:border-teal-300 hover:bg-white/60 transition-all duration-300"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-6 pt-8">
        {/* Profile Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            {fullName || "Add your name"}
          </h3>
          {professional_summary ? (
            <p className="text-muted-foreground">{professional_summary}</p>
          ) : (
            <p className="text-muted-foreground italic">
              Add a professional summary to highlight your expertise
            </p>
          )}
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <ContactItem
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={email}
            href={`mailto:${email}`}
          />
          <ContactItem
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            value={phone_number}
            href={`tel:${phone_number}`}
          />
          <ContactItem
            icon={<MapPin className="h-4 w-4" />}
            label="Location"
            value={location}
          />
          <ContactItem
            icon={<Globe className="h-4 w-4" />}
            label="Website"
            value={website}
            href={website || undefined}
          />
          <ContactItem
            icon={<Linkedin className="h-4 w-4" />}
            label="LinkedIn"
            value={linkedin_url}
            href={linkedin_url || undefined}
          />
          <ContactItem
            icon={<Github className="h-4 w-4" />}
            label="GitHub"
            value={github_url}
            href={github_url || undefined}
          />
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50/50 rounded-lg mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-600">{profile.work_experience.length}</div>
            <div className="text-sm text-muted-foreground">Work Experiences</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-600">{profile.education.length}</div>
            <div className="text-sm text-muted-foreground">Education</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-600">{profile.skills.length}</div>
            <div className="text-sm text-muted-foreground">Skill Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-600">{profile.projects.length}</div>
            <div className="text-sm text-muted-foreground">Projects</div>
          </div>
        </div>

        {/* Section List */}
        <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
          <Link href="/profile/basic-info" className="block">
            <div className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50/50 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-teal-50 text-teal-600 group-hover:bg-teal-100 transition-colors">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Basic Information</div>
                  <div className="text-sm text-muted-foreground">Name, contact, and location details</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-gray-900 transition-colors" />
            </div>
          </Link>

          <Link href="/profile/work-experience" className="block">
            <div className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50/50 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Work Experience</div>
                  <div className="text-sm text-muted-foreground">{profile.work_experience.length} positions listed</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-gray-900 transition-colors" />
            </div>
          </Link>

          <Link href="/profile/education" className="block">
            <div className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50/50 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Education</div>
                  <div className="text-sm text-muted-foreground">{profile.education.length} qualifications listed</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-gray-900 transition-colors" />
            </div>
          </Link>

          <Link href="/profile/skills" className="block">
            <div className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50/50 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-pink-50 text-pink-600 group-hover:bg-pink-100 transition-colors">
                  <Wrench className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Skills</div>
                  <div className="text-sm text-muted-foreground">{profile.skills.length} skill categories</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-gray-900 transition-colors" />
            </div>
          </Link>

          <Link href="/profile/projects" className="block">
            <div className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50/50 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
                  <FolderGit2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Projects</div>
                  <div className="text-sm text-muted-foreground">{profile.projects.length} projects listed</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-gray-900 transition-colors" />
            </div>
          </Link>

          <Link href="/profile/certifications" className="block">
            <div className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50/50 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-yellow-50 text-yellow-600 group-hover:bg-yellow-100 transition-colors">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Certifications</div>
                  <div className="text-sm text-muted-foreground">{profile.certifications.length} certifications listed</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-gray-900 transition-colors" />
            </div>
          </Link>
        </div>
      </div>
    </Card>
  );
} 