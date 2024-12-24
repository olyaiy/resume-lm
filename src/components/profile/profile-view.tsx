import { Profile, WorkExperience, Education, Skill, Project, Certification } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileViewProps {
  profile: Profile;
}

function formatDate(date: string | null) {
  if (!date) return 'Present';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function ProfileView({ profile }: ProfileViewProps) {
  const workExperience = (profile.work_experience || []) as WorkExperience[];
  const education = (profile.education || []) as Education[];
  const skills = (profile.skills || []) as Skill[];
  const projects = (profile.projects || []) as Project[];
  const certifications = (profile.certifications || []) as Certification[];

  return (
    <div className="h-screen overflow-y-auto">
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">
            {[profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Profile'}
          </h1>
          <div className="text-muted-foreground space-y-1">
            {/* {profile.email && <p>{profile.email}</p>} */}
            {profile.email && <p>alex@gmail.com</p>}
            {profile.phone_number && <p>{profile.phone_number}</p>}
            {profile.location && <p>{profile.location}</p>}
          </div>
          <div className="flex gap-4">
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                 className="text-primary hover:underline">
                Portfolio
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                 className="text-primary hover:underline">
                LinkedIn
              </a>
            )}
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                 className="text-primary hover:underline">
                GitHub
              </a>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        {profile.professional_summary && (
          <section className="space-y-2">
            <h2 className="text-2xl font-semibold">Professional Summary</h2>
            <p className="text-muted-foreground">{profile.professional_summary}</p>
          </section>
        )}

        {/* Work Experience */}
        {workExperience.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Work Experience</h2>
            {workExperience.map((work, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-xl font-medium">{work.position}</h3>
                <div className="text-muted-foreground">
                  {work.company} • {work.location}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(work.start_date)} - {formatDate(work.end_date)}
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {work.description.map((desc, i) => (
                    <li key={i} className="text-muted-foreground">{desc}</li>
                  ))}
                </ul>
                {work.technologies && (
                  <div className="flex gap-2 flex-wrap">
                    {work.technologies.map((tech, i) => (
                      <span key={i} className="bg-secondary px-2 py-1 rounded-md text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Skills</h2>
            {skills.map((skillGroup, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-lg font-medium">{skillGroup.category}</h3>
                <div className="flex gap-2 flex-wrap">
                  {skillGroup.items.map((skill, i) => (
                    <span key={i} className="bg-secondary px-2 py-1 rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Projects</h2>
            {projects.map((project, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-xl font-medium">{project.name}</h3>
                <p className="text-muted-foreground">{project.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="bg-secondary px-2 py-1 rounded-md text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {project.highlights.map((highlight, i) => (
                    <li key={i} className="text-muted-foreground">{highlight}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Education</h2>
            {education.map((edu, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-xl font-medium">{edu.school}</h3>
                <div className="text-muted-foreground">
                  {edu.degree} in {edu.field}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                </div>
                {edu.achievements && (
                  <ul className="list-disc list-inside space-y-1">
                    {edu.achievements.map((achievement, i) => (
                      <li key={i} className="text-muted-foreground">{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Certifications</h2>
            {certifications.map((cert, index) => (
              <div key={index} className="space-y-1">
                <h3 className="text-lg font-medium">{cert.name}</h3>
                <div className="text-muted-foreground">{cert.issuer}</div>
                <div className="text-sm text-muted-foreground">
                  Issued: {formatDate(cert.date_acquired)}
                  {cert.expiry_date && ` • Expires: ${formatDate(cert.expiry_date)}`}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
} 