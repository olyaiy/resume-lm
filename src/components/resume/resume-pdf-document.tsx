'use client';

import { Resume } from "@/lib/types";
import { Document as PDFDocument, Page as PDFPage, Text, View, StyleSheet } from '@react-pdf/renderer';

interface ResumePDFDocumentProps {
  resume: Resume;
  variant?: 'base' | 'tailored';
}

export function ResumePDFDocument({ resume, variant = 'base' }: ResumePDFDocumentProps) {
  // PDF Styles Configuration
  const styles = StyleSheet.create({
    // Base page configuration
    page: {
      padding: 36,
      fontFamily: 'Helvetica',
      color: '#1f2937',
    },
    // Header section
    header: {
      alignItems: 'center',
    },
    // Name display
    name: {
      fontSize: resume.document_settings?.header_name_size !== undefined ? resume.document_settings.header_name_size : 24,
      fontFamily: 'Helvetica-Bold',
      marginBottom: resume.document_settings?.header_name_bottom_spacing !== undefined ? resume.document_settings.header_name_bottom_spacing : 4,
      color: '#111827',
      textAlign: 'center',
    },
    // Contact information layout
    contactInfo: {
      fontSize: 10,
      color: '#4b5563',
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 4,
    },
    // Links
    link: {
      color: '#2563eb',
      textDecoration: 'none',
    },
    // Section titles
    sectionTitle: {
      fontSize: 10,
      fontFamily: 'Helvetica-Bold',
      marginBottom: 4,
      color: '#111827',
      textTransform: 'uppercase',
      borderBottom: '0.5pt solid #e5e7eb',
      paddingBottom: 2,
    },
    // Skills section
    skillsSection: {
      marginTop: resume.document_settings?.skills_margin_top || 8,
      marginBottom: resume.document_settings?.skills_margin_bottom || 8,
    },
    skillsGrid: {
      flexDirection: 'column',
      gap: resume.document_settings?.skills_item_spacing || 4,
      lineHeight: resume.document_settings?.skills_line_height || 1.5,
    },
    skillCategory: {
      marginBottom: resume.document_settings?.skills_item_spacing || 4,
    },
    skillCategoryTitle: {
      fontSize: resume.document_settings?.skills_font_size || 10,
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
    },
    skillItem: {
      fontSize: resume.document_settings?.skills_font_size || 10,
      color: '#4b5563',
    },
    // Experience section
    experienceSection: {
      marginTop: resume.document_settings?.experience_margin_top || 8,
      marginBottom: resume.document_settings?.experience_margin_bottom || 8,
    },
    experienceItem: {
      marginBottom: resume.document_settings?.experience_item_spacing || 4,
      lineHeight: resume.document_settings?.experience_line_height || 1.5,
    },
    experienceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    companyName: {
      fontSize: resume.document_settings?.experience_font_size || 10,
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
    },
    jobTitle: {
      fontSize: resume.document_settings?.experience_font_size || 10,
      color: '#4b5563',
    },
    dateRange: {
      fontSize: resume.document_settings?.experience_font_size || 10,
      color: '#6b7280',
      textAlign: 'right',
    },
    bulletPoint: {
      fontSize: resume.document_settings?.experience_font_size || 10,
      lineHeight: resume.document_settings?.experience_line_height || 1.5,
      marginBottom: resume.document_settings?.experience_item_spacing || 4,
      color: '#374151',
      marginLeft: 8,
      textIndent: -8,
      paddingLeft: 8,
    },
    // Projects section
    projectsSection: {
      marginTop: resume.document_settings?.projects_margin_top || 8,
      marginBottom: resume.document_settings?.projects_margin_bottom || 8,
    },
    projectItem: {
      marginBottom: resume.document_settings?.projects_item_spacing || 4,
      lineHeight: resume.document_settings?.projects_line_height || 1.5,
    },
    projectHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    projectTitle: {
      fontSize: resume.document_settings?.projects_font_size || 10,
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
    },
    projectDescription: {
      fontSize: resume.document_settings?.projects_font_size || 10,
      color: '#374151',
    },
    projectLinks: {
      fontSize: resume.document_settings?.projects_font_size || 10,
      color: '#4b5563',
      marginBottom: 4,
      marginLeft: 8,
    },
    projectTechnologies: {
      fontSize: resume.document_settings?.projects_font_size || 10,
      color: '#4b5563',
      marginLeft: 8,
      marginBottom: 4,
      fontFamily: 'Helvetica-Bold',
    },
    // Education section
    educationSection: {
      marginTop: resume.document_settings?.education_margin_top || 8,
      marginBottom: resume.document_settings?.education_margin_bottom || 8,
    },
    educationItem: {
      marginBottom: resume.document_settings?.education_item_spacing || 4,
      lineHeight: resume.document_settings?.education_line_height || 1.5,
    },
    educationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    schoolName: {
      fontSize: resume.document_settings?.education_font_size || 10,
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
    },
    degree: {
      fontSize: resume.document_settings?.education_font_size || 10,
      color: '#4b5563',
    },
  });

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

        {/* Skills Section */}
        {resume.skills && resume.skills.length > 0 && (
          <View style={styles.skillsSection}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsGrid}>
              {resume.skills.map((skillCategory, index) => (
                <View key={index} style={styles.skillCategory}>
                  <Text style={styles.skillCategoryTitle}>{skillCategory.category}</Text>
                  <Text style={styles.skillItem}>{skillCategory.items.join(', ')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Experience Section */}
        {resume.work_experience && resume.work_experience.length > 0 && (
          <View style={styles.experienceSection}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {resume.work_experience.map((experience, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <View>
                    <Text style={styles.companyName}>{experience.company}</Text>
                    <Text style={styles.jobTitle}>{experience.position}</Text>
                  </View>
                  <Text style={styles.dateRange}>{experience.date}</Text>
                </View>
                {experience.description.map((bullet, bulletIndex) => (
                  <Text key={bulletIndex} style={styles.bulletPoint}>• {bullet}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Projects Section */}
        {resume.projects && resume.projects.length > 0 && (
          <View style={styles.projectsSection}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resume.projects.map((project, index) => (
              <View key={index} style={styles.projectItem}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectTitle}>{project.name}</Text>
                  {project.date && <Text style={styles.dateRange}>{project.date}</Text>}
                </View>
                {project.description.map((bullet, bulletIndex) => (
                  <Text key={bulletIndex} style={styles.bulletPoint}>• {bullet}</Text>
                ))}
                {project.technologies && (
                  <Text style={styles.projectTechnologies}>
                    Technologies: {project.technologies.join(', ')}
                  </Text>
                )}
                {(project.url || project.github_url) && (
                  <Text style={styles.projectLinks}>
                    {project.url && `Demo: ${project.url}`}
                    {project.url && project.github_url && ' | '}
                    {project.github_url && `Code: ${project.github_url}`}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education Section */}
        {resume.education && resume.education.length > 0 && (
          <View style={styles.educationSection}>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((edu, index) => (
              <View key={index} style={styles.educationItem}>
                <View style={styles.educationHeader}>
                  <View>
                    <Text style={styles.schoolName}>{edu.school}</Text>
                    <Text style={styles.degree}>{edu.degree} in {edu.field}</Text>
                  </View>
                  <Text style={styles.dateRange}>{edu.date}</Text>
                </View>
                {edu.achievements && edu.achievements.map((achievement, bulletIndex) => (
                  <Text key={bulletIndex} style={styles.bulletPoint}>• {achievement}</Text>
                ))}
              </View>
            ))}
          </View>
        )}
      </PDFPage>
    </PDFDocument>
  );
} 