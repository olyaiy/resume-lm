'use client';

import { Resume } from "@/lib/types";
import { Document as PDFDocument, Page as PDFPage, Text, View, StyleSheet } from '@react-pdf/renderer';

interface ResumePDFDocumentProps {
  resume: Resume;
  variant?: 'base' | 'tailored';
}

// PDF Styles Configuration
const styles = StyleSheet.create({
  // Base page configuration
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    color: '#1f2937',
    fontSize: 10,
  },
  // Header section with improved spacing
  header: {
    marginBottom: 0,
    paddingBottom: 8,
    alignItems: 'center',
  },
  // Modernized name display
  name: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: '#111827',
    textAlign: 'center',
  },
  // Improved contact information layout
  contactInfo: {
    fontSize: 9,
    color: '#4b5563',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  // Professional links with improved visibility
  links: {
    flexDirection: 'row',
    gap: 12,
    fontSize: 9,
    color: '#2563eb',
    marginTop: 4,
  },
  // Enhanced section headers
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    marginTop: 8,
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: '0.5pt solid #e5e7eb',
    paddingBottom: 2,
  },
  // Refined summary section
  summary: {
    fontSize: 9,
    lineHeight: 1.6,
    marginBottom: 0,
    color: '#374151',
  },
  // Experience items with better spacing
  experienceItem: {
    marginBottom: 0,
    paddingBottom: 8,
  },
  // Improved experience header layout
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  // Enhanced company name styling
  companyName: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  // Refined job title display
  jobTitle: {
    fontSize: 11,
    color: '#4b5563',
    marginTop: 1,
  },
  // Improved date range styling
  dateRange: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'right',
  },
  // Enhanced bullet points
  bulletPoint: {
    fontSize: 9,
    lineHeight: 1.5,
    marginLeft: 8,
    marginBottom: 2,
    color: '#374151',
    textIndent: -8,
    paddingLeft: 8,
  },
  // Modernized skills section
  skillsGrid: {
    flexDirection: 'column',
    gap: 5,
    marginBottom: 2,
  },
  // Improved skill category layout
  skillCategory: {
    marginBottom: 0,
  },
  // Enhanced skill category title
  skillCategoryTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  // Modern skill item styling
  skillItem: {
    fontSize: 9,
    color: '#4b5563',
  },
  // Project section improvements
  projectItem: {
    marginBottom: 4,
    paddingBottom: 4,
    
  },
  // Enhanced project header
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  // Refined project title
  projectTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  // Improved project description
  projectDescription: {
    fontSize: 9,
    lineHeight: 1.5,
    marginBottom: 3,
    color: '#374151',
  },
  // Enhanced certification styling
  certificationItem: {
    marginBottom: 6,
    paddingBottom: 4,
  },
  // Link text styling
  link: {
    color: '#2563eb',
    textDecoration: 'none',
  },
});

export function ResumePDFDocument({ resume, variant = 'base' }: ResumePDFDocumentProps) {
  return (
    <PDFDocument>
      <PDFPage size="LETTER" style={styles.page}>
        {/* Header Section - Name and Contact Information */}
        <View style={styles.header}>
          <Text style={styles.name}>{resume.first_name} {resume.last_name}</Text>
          <View style={styles.contactInfo}>
            {resume.email && <Text>{resume.email}</Text>}
            {resume.phone_number && <Text>{resume.phone_number}</Text>}
            {resume.location && <Text>{resume.location}</Text>}
            {resume.website && <Text style={styles.link}>{resume.website}</Text>}
            {resume.linkedin_url && <Text style={styles.link}>{resume.linkedin_url}</Text>}
            {resume.github_url && <Text style={styles.link}>{resume.github_url}</Text>}
          </View>
        </View>

        {/* Professional Summary Section */}
        {resume.professional_summary && (
          <>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summary}>{resume.professional_summary}</Text>
          </>
        )}

        {/* Skills Section - Moved up for software engineering focus */}
        {resume.skills?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsGrid}>
              {resume.skills.map((skill, index) => (
                <View key={index} style={styles.skillCategory}>
                  <Text>
                    <Text style={styles.skillCategoryTitle}>{skill.category}: </Text>
                    <Text style={styles.skillItem}>{skill.items.join(', ')}</Text>
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Work Experience Section */}
        {resume.work_experience?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Experience</Text>
            {resume.work_experience.map((exp, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.companyName}>
                      {exp.company} • {exp.position}
                    </Text>
                    {exp.location && (
                      <Text style={styles.jobTitle}>{exp.location}</Text>
                    )}
                  </View>
                  <Text style={styles.dateRange}>
                    {exp.start_date && `${exp.start_date}${exp.current ? ' - Present' : exp.end_date ? ` - ${exp.end_date}` : ''}`}
                  </Text>
                </View>
                {exp.description.map((desc, i) => (
                  <Text key={i} style={styles.bulletPoint}>• {desc}</Text>
                ))}
                {exp.technologies && exp.technologies.length > 0 && (
                  <Text style={{ ...styles.skillItem, marginLeft: 8, marginTop: 2 }}>
                    Technologies: {exp.technologies.join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </>
        )}

        {/* Projects Section */}
        {resume.projects?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resume.projects.map((project, index) => (
              <View key={index} style={styles.projectItem}>
                <View style={styles.projectHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.projectTitle}>{project.name}</Text>
                  </View>
                  <Text style={styles.dateRange}>
                    {project.start_date && `${project.start_date}${project.end_date ? ` - ${project.end_date}` : ' - Present'}`}
                  </Text>
                </View>
                {[...(project.description || []), ...project.highlights].map((item, i) => (
                  <Text key={i} style={styles.bulletPoint}>• {item}</Text>
                ))}
                {project.technologies && project.technologies.length > 0 && (
                  <Text style={{ ...styles.skillItem, marginLeft: 8, marginTop: 2 }}>
                    Technologies: {project.technologies.join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </>
        )}

        {/* Education Section */}
        {resume.education?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((edu, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.companyName}>
                      {edu.school} • {edu.degree} in {edu.field}
                    </Text>
                    {edu.location && (
                      <Text style={styles.jobTitle}>{edu.location}</Text>
                    )}
                  </View>
                  <Text style={styles.dateRange}>
                    {edu.start_date && `${edu.start_date}${edu.current ? ' - Present' : edu.end_date ? ` - ${edu.end_date}` : ''}`}
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

        {/* Certifications Section */}
        {resume.certifications?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {resume.certifications.map((cert, index) => (
              <View key={index} style={styles.certificationItem}>
                <View style={styles.experienceHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.companyName}>{cert.name}</Text>
                    <Text style={styles.jobTitle}>{cert.issuer}</Text>
                  </View>
                  <Text style={styles.dateRange}>
                    {cert.date_acquired && `${cert.date_acquired}${cert.expiry_date ? ` - ${cert.expiry_date}` : ''}`}
                  </Text>
                </View>
                {cert.credential_id && (
                  <Text style={styles.bulletPoint}>Credential ID: {cert.credential_id}</Text>
                )}
              </View>
            ))}
          </>
        )}
      </PDFPage>
    </PDFDocument>
  );
} 