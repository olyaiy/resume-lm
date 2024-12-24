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

      <div className="p-6">
        {/* Profile Content - Scrollable */}
        <div className="max-h-[600px] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
          {/* Basic Information Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-teal-50 text-teal-600">
                  <User className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-gray-900">Basic Information</h3>
              </div>
              <Link href="/profile/basic-info" className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1">
                <Edit2 className="h-3 w-3" />
                Edit
              </Link>
            </div>
            <div className="p-3 rounded-lg bg-white/40 hover:bg-white/60 transition-colors">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {fullName || "Add your name"}
              </h3>
              {professional_summary ? (
                <p className="text-muted-foreground mb-4">{professional_summary}</p>
              ) : (
                <p className="text-muted-foreground italic mb-4">
                  Add a professional summary to highlight your expertise
                </p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>

          {/* Work Experience Section */}
          {profile.work_experience.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Work Experience</h3>
                </div>
                <Link href="/profile/work-experience" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Edit2 className="h-3 w-3" />
                  Edit
                </Link>
              </div>
              <div className="space-y-4">
                {profile.work_experience.map((work, index) => (
                  <div key={index} className="p-3 rounded-lg bg-white/40 hover:bg-white/60 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-gray-900">{work.position}</div>
                      <div className="text-sm text-muted-foreground">
                        {work.start_date} - {work.current ? 'Present' : work.end_date}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">{work.company} • {work.location}</div>
                    <ul className="list-disc list-inside space-y-1">
                      {work.description.map((desc, i) => (
                        <li key={i} className="text-sm text-gray-600">{desc}</li>
                      ))}
                    </ul>
                    {work.technologies && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {work.technologies.map((tech, i) => (
                          <span key={i} className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {profile.education.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-purple-50 text-purple-600">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Education</h3>
                </div>
                <Link href="/profile/education" className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
                  <Edit2 className="h-3 w-3" />
                  Edit
                </Link>
              </div>
              <div className="space-y-4">
                {profile.education.map((edu, index) => (
                  <div key={index} className="p-3 rounded-lg bg-white/40 hover:bg-white/60 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-gray-900">{edu.degree} in {edu.field}</div>
                      <div className="text-sm text-muted-foreground">
                        {edu.start_date} - {edu.current ? 'Present' : edu.end_date}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">{edu.school} • {edu.location}</div>
                    {edu.gpa && <div className="text-sm text-gray-600">GPA: {edu.gpa}</div>}
                    {edu.achievements && edu.achievements.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        {edu.achievements.map((achievement, i) => (
                          <li key={i} className="text-sm text-gray-600">{achievement}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {profile.skills.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-pink-50 text-pink-600">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Skills</h3>
                </div>
                <Link href="/profile/skills" className="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-1">
                  <Edit2 className="h-3 w-3" />
                  Edit
                </Link>
              </div>
              <div className="space-y-4">
                {profile.skills.map((skill, index) => (
                  <div key={index} className="p-3 rounded-lg bg-white/40 hover:bg-white/60 transition-colors">
                    <div className="font-medium text-gray-900 mb-2">{skill.category}</div>
                    <div className="flex flex-wrap gap-1">
                      {skill.items.map((item, i) => (
                        <span key={i} className="px-2 py-1 text-xs rounded-full bg-pink-50 text-pink-600">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {profile.projects.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-orange-50 text-orange-600">
                    <FolderGit2 className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Projects</h3>
                </div>
                <Link href="/profile/projects" className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1">
                  <Edit2 className="h-3 w-3" />
                  Edit
                </Link>
              </div>
              <div className="space-y-4">
                {profile.projects.map((project, index) => (
                  <div key={index} className="p-3 rounded-lg bg-white/40 hover:bg-white/60 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-gray-900">{project.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {project.start_date} - {project.end_date || 'Present'}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{project.description}</div>
                    <ul className="list-disc list-inside space-y-1">
                      {project.highlights.map((highlight, i) => (
                        <li key={i} className="text-sm text-gray-600">{highlight}</li>
                      ))}
                    </ul>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {project.technologies.map((tech, i) => (
                        <span key={i} className="px-2 py-1 text-xs rounded-full bg-orange-50 text-orange-600">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-3">
                      {project.url && (
                        <a href={project.url} target="_blank" rel="noopener noreferrer" 
                           className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          Live Demo
                        </a>
                      )}
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                           className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1">
                          <Github className="h-3 w-3" />
                          Source Code
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Section */}
          {profile.certifications.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-yellow-50 text-yellow-600">
                    <Award className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Certifications</h3>
                </div>
                <Link href="/profile/certifications" className="text-sm text-yellow-600 hover:text-yellow-700 flex items-center gap-1">
                  <Edit2 className="h-3 w-3" />
                  Edit
                </Link>
              </div>
              <div className="space-y-4">
                {profile.certifications.map((cert, index) => (
                  <div key={index} className="p-3 rounded-lg bg-white/40 hover:bg-white/60 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-gray-900">{cert.name}</div>
                      <div className="text-sm text-muted-foreground">{cert.date_acquired}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{cert.issuer}</div>
                    {cert.expiry_date && (
                      <div className="text-sm text-gray-600 mt-1">Expires: {cert.expiry_date}</div>
                    )}
                    {cert.url && (
                      <a href={cert.url} target="_blank" rel="noopener noreferrer"
                         className="text-sm text-yellow-600 hover:text-yellow-700 flex items-center gap-1 mt-2">
                        <Globe className="h-3 w-3" />
                        View Certificate
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
} 