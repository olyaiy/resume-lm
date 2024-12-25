"use client";

import { Resume } from "@/lib/types";
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { useState, useEffect } from 'react';

interface ResumePreviewProps {
  resume: Resume;
  variant?: 'base' | 'tailored';
}

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: 'Helvetica',
    color: '#1f2937',
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 10,
    textAlign: 'center',
    color: '#4b5563',
    marginBottom: 4,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    fontSize: 10,
    color: '#2563eb',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    marginTop: 16,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 16,
  },
  experienceItem: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  jobTitle: {
    fontSize: 10,
    color: '#4b5563',
  },
  dateRange: {
    fontSize: 10,
    color: '#6b7280',
  },
  bulletPoint: {
    fontSize: 10,
    lineHeight: 1.5,
    marginLeft: 12,
    marginBottom: 2,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillCategory: {
    width: '48%',
  },
  skillCategoryTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  skillItem: {
    fontSize: 10,
    color: '#4b5563',
    backgroundColor: '#f3f4f6',
    padding: '2 6',
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  projectItem: {
    marginBottom: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  projectTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  projectDescription: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 4,
  },
  certificationItem: {
    marginBottom: 8,
  },
});

// Resume Document Component
function ResumeDocument({ resume, variant = 'base' }: ResumePreviewProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{resume.first_name} {resume.last_name}</Text>
          <Text style={styles.contactInfo}>
            {[
              resume.email,
              resume.phone_number,
              resume.location
            ].filter(Boolean).join(' • ')}
          </Text>
          <View style={styles.links}>
            {resume.website && <Text>Portfolio</Text>}
            {resume.linkedin_url && <Text>LinkedIn</Text>}
            {resume.github_url && <Text>GitHub</Text>}
          </View>
        </View>

        {/* Professional Summary */}
        {resume.professional_summary && (
          <>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{resume.professional_summary}</Text>
          </>
        )}

        {/* Work Experience */}
        {resume.work_experience?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {resume.work_experience.map((exp, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <View>
                    <Text style={styles.companyName}>{exp.company}</Text>
                    <Text style={styles.jobTitle}>{exp.position} • {exp.location}</Text>
                  </View>
                  <Text style={styles.dateRange}>
                    {exp.start_date} - {exp.current ? 'Present' : exp.end_date}
                  </Text>
                </View>
                {exp.description.map((desc, i) => (
                  <Text key={i} style={styles.bulletPoint}>• {desc}</Text>
                ))}
                {exp.technologies && exp.technologies.length > 0 && (
                  <View style={{ ...styles.skillsGrid, marginTop: 4 }}>
                    {exp.technologies.map((tech, i) => (
                      <Text key={i} style={styles.skillItem}>{tech}</Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* Education */}
        {resume.education?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((edu, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <View>
                    <Text style={styles.companyName}>{edu.school}</Text>
                    <Text style={styles.jobTitle}>{edu.degree} in {edu.field} • {edu.location}</Text>
                  </View>
                  <Text style={styles.dateRange}>
                    {edu.start_date} - {edu.current ? 'Present' : edu.end_date}
                  </Text>
                </View>
                {edu.gpa && (
                  <Text style={styles.bulletPoint}>GPA: {edu.gpa}</Text>
                )}
                {edu.achievements?.map((achievement, i) => (
                  <Text key={i} style={styles.bulletPoint}>• {achievement}</Text>
                ))}
              </View>
            ))}
          </>
        )}

        {/* Skills */}
        {resume.skills?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsGrid}>
              {resume.skills.map((skill, index) => (
                <View key={index} style={styles.skillCategory}>
                  <Text style={styles.skillCategoryTitle}>{skill.category}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {skill.items.map((item, i) => (
                      <Text key={i} style={styles.skillItem}>{item}</Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Projects */}
        {resume.projects?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resume.projects.map((project, index) => (
              <View key={index} style={styles.projectItem}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectTitle}>{project.name}</Text>
                  <Text style={styles.dateRange}>
                    {project.start_date} - {project.end_date || 'Present'}
                  </Text>
                </View>
                <Text style={styles.projectDescription}>{project.description}</Text>
                {project.highlights?.map((highlight, i) => (
                  <Text key={i} style={styles.bulletPoint}>• {highlight}</Text>
                ))}
                {project.technologies && project.technologies.length > 0 && (
                  <View style={{ ...styles.skillsGrid, marginTop: 4 }}>
                    {project.technologies.map((tech, i) => (
                      <Text key={i} style={styles.skillItem}>{tech}</Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* Certifications */}
        {resume.certifications?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {resume.certifications.map((cert, index) => (
              <View key={index} style={styles.certificationItem}>
                <View style={styles.experienceHeader}>
                  <View>
                    <Text style={styles.companyName}>{cert.name}</Text>
                    <Text style={styles.jobTitle}>{cert.issuer}</Text>
                  </View>
                  <Text style={styles.dateRange}>
                    {cert.date_acquired}
                    {cert.expiry_date && ` - ${cert.expiry_date}`}
                  </Text>
                </View>
                {cert.credential_id && (
                  <Text style={styles.bulletPoint}>Credential ID: {cert.credential_id}</Text>
                )}
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
}

export function ResumePreview({ resume, variant = 'base' }: ResumePreviewProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    async function generatePDF() {
      const blob = await pdf(<ResumeDocument resume={resume} variant={variant} />).toBlob();
      const url = URL.createObjectURL(blob);
      setUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    generatePDF();
  }, [resume, variant]);

  if (!url) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-full min-h-[279.4mm]">
      <iframe
        src={url}
        className="w-full h-full min-h-[279.4mm] rounded-xl"
        title="Resume Preview"
      />
    </div>
  );
} 