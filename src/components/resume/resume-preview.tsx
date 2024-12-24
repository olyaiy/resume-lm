import { Resume } from "@/lib/types";
import { Card } from "@/components/ui/card";

interface ResumePreviewProps {
  resume: Resume;
}

export function ResumePreview({ resume }: ResumePreviewProps) {
  return (
    <Card className="p-8 min-h-[297mm] w-full bg-white shadow-xl">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">
          {resume.first_name} {resume.last_name}
        </h1>
        <div className="text-sm text-muted-foreground">
          {resume.email} • {resume.phone_number} • {resume.location}
        </div>
      </div>

      {/* Professional Summary */}
      {resume.professional_summary && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold border-b mb-2">Professional Summary</h2>
          <p className="text-sm">{resume.professional_summary}</p>
        </div>
      )}

      {/* Work Experience */}
      {resume.work_experience?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold border-b mb-2">Work Experience</h2>
          {resume.work_experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between">
                <strong>{exp.position}</strong>
                <span className="text-sm">
                  {exp.start_date} - {exp.current ? 'Present' : exp.end_date}
                </span>
              </div>
              <div className="text-sm">{exp.company} • {exp.location}</div>
              <ul className="list-disc list-inside text-sm mt-2">
                {exp.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Add more sections for education, skills, etc. */}
    </Card>
  );
} 