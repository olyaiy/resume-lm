import { Resume } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface ResumePreviewProps {
  resume: Resume;
}

export function ResumePreview({ resume }: ResumePreviewProps) {
  return (
    <Card className="p-12 min-h-[297mm] w-full bg-white shadow-xl max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          {resume.first_name} {resume.last_name}
        </h1>
        <div className="text-base text-muted-foreground space-y-2 mt-3">
          <div className="flex items-center justify-center gap-3">
            {resume.email && <span>{resume.email}</span>}
            {resume.phone_number && (
              <>
                <span className="text-gray-300">•</span>
                <span>{resume.phone_number}</span>
              </>
            )}
          </div>
          {resume.location && (
            <div className="text-muted-foreground">{resume.location}</div>
          )}
          <div className="flex items-center justify-center gap-6 mt-2">
            {resume.website && (
              <a href={resume.website} target="_blank" rel="noopener noreferrer" 
                 className="flex items-center hover:text-blue-600 transition-colors">
                Website <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            )}
            {resume.linkedin_url && (
              <a href={resume.linkedin_url} target="_blank" rel="noopener noreferrer" 
                 className="flex items-center hover:text-blue-600 transition-colors">
                LinkedIn <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            )}
            {resume.github_url && (
              <a href={resume.github_url} target="_blank" rel="noopener noreferrer" 
                 className="flex items-center hover:text-blue-600 transition-colors">
                GitHub <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      {resume.professional_summary && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-4">Professional Summary</h2>
          <p className="text-base leading-relaxed text-gray-600">{resume.professional_summary}</p>
        </div>
      )}

      {/* Work Experience */}
      {resume.work_experience?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-4">Work Experience</h2>
          {resume.work_experience.map((exp, index) => (
            <div key={index} className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{exp.position}</h3>
                  <div className="text-base text-gray-600">{exp.company} • {exp.location}</div>
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {exp.start_date} - {exp.current ? 'Present' : exp.end_date}
                </span>
              </div>
              <ul className="list-disc list-inside text-base mt-3 space-y-2">
                {exp.description.map((desc, i) => (
                  <li key={i} className="text-gray-600">{desc}</li>
                ))}
              </ul>
              {exp.technologies && exp.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {exp.technologies.map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {resume.education?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-4">Education</h2>
          {resume.education.map((edu, index) => (
            <div key={index} className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{edu.degree} in {edu.field}</h3>
                  <div className="text-base text-gray-600">{edu.school} • {edu.location}</div>
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {edu.start_date} - {edu.current ? 'Present' : edu.end_date}
                </span>
              </div>
              {edu.gpa && (
                <div className="text-base text-gray-600 mt-2">GPA: {edu.gpa}</div>
              )}
              {edu.achievements && edu.achievements.length > 0 && (
                <ul className="list-disc list-inside text-base mt-3 space-y-2">
                  {edu.achievements.map((achievement, i) => (
                    <li key={i} className="text-gray-600">{achievement}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {resume.skills?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-4">Skills</h2>
          <div className="grid grid-cols-2 gap-6">
            {resume.skills.map((skill, index) => (
              <div key={index}>
                <h3 className="text-base font-medium text-gray-800 mb-2">{skill.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skill.items.map((item, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {resume.projects?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-4">Projects</h2>
          {resume.projects.map((project, index) => (
            <div key={index} className="mb-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {project.start_date} - {project.end_date || 'Present'}
                </span>
              </div>
              <p className="text-base text-gray-600 mt-2">{project.description}</p>
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-sm">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              {project.highlights && project.highlights.length > 0 && (
                <ul className="list-disc list-inside text-base mt-3 space-y-2">
                  {project.highlights.map((highlight, i) => (
                    <li key={i} className="text-gray-600">{highlight}</li>
                  ))}
                </ul>
              )}
              <div className="flex gap-4 mt-3">
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                    Live Demo <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                )}
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                    GitHub <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {resume.certifications?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold border-b border-gray-200 pb-2 mb-4">Certifications</h2>
          {resume.certifications.map((cert, index) => (
            <div key={index} className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{cert.name}</h3>
                  <div className="text-base text-gray-600">{cert.issuer}</div>
                </div>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {cert.date_acquired}
                  {cert.expiry_date && ` - ${cert.expiry_date}`}
                </span>
              </div>
              {cert.credential_id && (
                <div className="text-base text-gray-500 mt-2">
                  Credential ID: {cert.credential_id}
                </div>
              )}
              {cert.url && (
                <a href={cert.url} target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mt-2">
                  View Certificate <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
} 