import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Profile, WorkExperience, Skill, Project, Education, Certification } from '@/lib/types';


function formatDate(date: string | null) {
  if (!date) return 'Present';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default async function Home() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single<Profile>();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return <div>Error loading profile</div>;
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="space-y-12">
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">
            {profile.first_name} {profile.last_name}
          </h1>
          <div className="text-gray-600 space-y-1">
            <p>{profile.email}</p>
            <p>{profile.phone_number}</p>
            <p>{profile.location}</p>
          </div>
          <div className="flex gap-4">
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 hover:underline">
                Portfolio
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                 className="text-blue-600 hover:underline">
                LinkedIn
              </a>
            )}
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                 className="text-blue-600 hover:underline">
                GitHub
              </a>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        {profile.professional_summary && (
          <section className="space-y-2">
            <h2 className="text-2xl font-semibold">Professional Summary</h2>
            <p className="text-gray-700">{profile.professional_summary}</p>
          </section>
        )}

        {/* Work Experience */}
        {profile.work_experience?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Work Experience</h2>
            {profile.work_experience.map((work: WorkExperience, index: number) => (
              <div key={index} className="space-y-2">
                <h3 className="text-xl font-medium">{work.position}</h3>
                <div className="text-gray-600">
                  {work.company} • {work.location}
                </div>
                <div className="text-gray-500">
                  {formatDate(work.start_date)} - {formatDate(work.end_date)}
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {work.description.map((desc: string, i: number) => (
                    <li key={i} className="text-gray-700">{desc}</li>
                  ))}
                </ul>
                {work.technologies && (
                  <div className="flex gap-2 flex-wrap">
                    {work.technologies.map((tech: string, i: number) => (
                      <span key={i} className="bg-gray-100 px-2 py-1 rounded-md text-sm">
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
        {profile.skills?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Skills</h2>
            {profile.skills.map((skillGroup: Skill, index: number) => (
              <div key={index} className="space-y-2">
                <h3 className="text-lg font-medium">{skillGroup.category}</h3>
                <div className="flex gap-2 flex-wrap">
                  {skillGroup.items.map((skill: string, i: number) => (
                    <span key={i} className="bg-gray-100 px-2 py-1 rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Projects */}
        {profile.projects?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Projects</h2>
            {profile.projects.map((project: Project, index: number) => (
              <div key={index} className="space-y-2">
                <h3 className="text-xl font-medium">{project.name}</h3>
                <p className="text-gray-700">{project.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {project.technologies.map((tech: string, i: number) => (
                    <span key={i} className="bg-gray-100 px-2 py-1 rounded-md text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {project.highlights.map((highlight: string, i: number) => (
                    <li key={i} className="text-gray-700">{highlight}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {profile.education?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Education</h2>
            {profile.education.map((edu: Education, index: number) => (
              <div key={index} className="space-y-2">
                <h3 className="text-xl font-medium">{edu.school}</h3>
                <div className="text-gray-600">
                  {edu.degree} in {edu.field}
                </div>
                <div className="text-gray-500">
                  {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                </div>
                {edu.achievements && (
                  <ul className="list-disc list-inside space-y-1">
                    {edu.achievements.map((achievement: string, i: number) => (
                      <li key={i} className="text-gray-700">{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Certifications */}
        {profile.certifications?.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Certifications</h2>
            {profile.certifications.map((cert: Certification, index: number) => (
              <div key={index} className="space-y-1">
                <h3 className="text-lg font-medium">{cert.name}</h3>
                <div className="text-gray-600">{cert.issuer}</div>
                <div className="text-gray-500">
                  Issued: {formatDate(cert.date_acquired)}
                  {cert.expiry_date && ` • Expires: ${formatDate(cert.expiry_date)}`}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
