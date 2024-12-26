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
      padding: resume.document_settings?.margin_tb ? resume.document_settings.margin_tb * 72 : 40,
      fontFamily: resume.document_settings?.font_family || 'Helvetica',
      color: '#1f2937',
      fontSize: resume.document_settings?.base_font_size || 10,
      lineHeight: resume.document_settings?.line_spacing || 1.15,
    },
    // Header section with improved spacing
    header: {
      marginBottom: resume.document_settings?.header_spacing || 8,
      paddingBottom: resume.document_settings?.header_spacing || 8,
      alignItems: 'center',
    },
    // Modernized name display
    name: {
      fontSize: resume.document_settings?.header_name_size || 24,
      fontFamily: resume.document_settings?.font_family ? `${resume.document_settings.font_family}-Bold` : 'Helvetica-Bold',
      marginBottom: resume.document_settings?.header_name_bottom_spacing || 20,
      color: resume.document_settings?.header_name_color || '#111827',
      textAlign: 'center',
      letterSpacing: resume.document_settings?.header_name_spacing || 0.5,
    },
    // Improved contact information layout
    contactInfo: {
      fontSize: resume.document_settings?.header_info_size || 10,
      color: resume.document_settings?.header_info_color || '#4b5563',
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: resume.document_settings?.header_info_spacing || 4,
    },
    // Professional links with improved visibility
    links: {
      flexDirection: 'row',
      gap: resume.document_settings?.header_info_spacing || 4,
      fontSize: resume.document_settings?.header_info_size || 10,
      color: resume.document_settings?.link_color || '#2563eb',
      marginTop: resume.document_settings?.header_info_spacing || 4,
    },
    // Enhanced section headers
    sectionTitle: {
      fontSize: resume.document_settings?.section_title_size || 10,
      fontFamily: resume.document_settings?.font_family ? `${resume.document_settings.font_family}-Bold` : 'Helvetica-Bold',
      marginBottom: resume.document_settings?.section_title_padding || 2,
      marginTop: resume.document_settings?.section_spacing || 8,
      color: '#111827',
      textTransform: 'uppercase',
      letterSpacing: resume.document_settings?.section_title_spacing || 0.5,
      borderBottom: `${resume.document_settings?.section_title_border || 0.5}pt solid #e5e7eb`,
      paddingBottom: resume.document_settings?.section_title_padding || 2,
    },
    // Refined summary section
    summary: {
      fontSize: resume.document_settings?.base_font_size || 10,
      lineHeight: resume.document_settings?.line_spacing || 1.15,
      marginBottom: resume.document_settings?.section_spacing || 8,
      color: '#374151',
    },
    // Experience items with better spacing
    experienceItem: {
      marginBottom: resume.document_settings?.item_spacing || 4,
      paddingBottom: resume.document_settings?.item_spacing || 4,
    },
    // Improved experience header layout
    experienceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: resume.document_settings?.item_spacing || 4,
    },
    // Enhanced company name styling
    companyName: {
      marginTop: resume.document_settings?.item_spacing || 2,
      fontSize: (resume.document_settings?.base_font_size || 10) + 1,
      fontFamily: resume.document_settings?.font_family ? `${resume.document_settings.font_family}-Bold` : 'Helvetica-Bold',
      color: '#111827',
    },
    // Refined job title display
    jobTitle: {
      fontSize: resume.document_settings?.base_font_size || 10,
      color: '#4b5563',
      marginTop: resume.document_settings?.item_spacing || 1,
    },
    // Improved date range styling
    dateRange: {
      fontSize: resume.document_settings?.secondary_text_size || 9,
      color: '#6b7280',
      textAlign: 'right',
    },
    // Enhanced bullet points
    bulletPoint: {
      fontSize: resume.document_settings?.bullet_point_font_size || 10,
      lineHeight: resume.document_settings?.bullet_point_line_height || 1.5,
      marginBottom: resume.document_settings?.bullet_point_spacing || 4,
      color: '#374151',
      marginLeft: resume.document_settings?.bullet_indent || 8,
      textIndent: -(resume.document_settings?.bullet_indent || 8),
      paddingLeft: resume.document_settings?.bullet_indent || 8,
    },
    // Modernized skills section
    skillsGrid: {
      flexDirection: 'column',
      gap: resume.document_settings?.item_spacing || 4,
      marginBottom: resume.document_settings?.item_spacing || 4,
    },
    // Improved skill category layout
    skillCategory: {
      marginBottom: resume.document_settings?.item_spacing || 4,
    },
    // Enhanced skill category title
    skillCategoryTitle: {
      fontSize: resume.document_settings?.base_font_size || 10,
      fontFamily: resume.document_settings?.font_family ? `${resume.document_settings.font_family}-Bold` : 'Helvetica-Bold',
      color: '#111827',
    },
    // Modern skill item styling
    skillItem: {
      fontSize: resume.document_settings?.base_font_size || 10,
      color: '#4b5563',
    },
    // Project section improvements
    projectItem: {
      marginBottom: resume.document_settings?.item_spacing || 4,
      paddingBottom: resume.document_settings?.item_spacing || 4,
    },
    // Enhanced project header
    projectHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: resume.document_settings?.item_spacing || 4,
    },
    // Refined project title
    projectTitle: {
      fontSize: (resume.document_settings?.base_font_size || 10) + 1,
      fontFamily: resume.document_settings?.font_family ? `${resume.document_settings.font_family}-Bold` : 'Helvetica-Bold',
      color: '#111827',
    },
    // Improved project description
    projectDescription: {
      fontSize: resume.document_settings?.base_font_size || 10,
      lineHeight: resume.document_settings?.line_spacing || 1.15,
      marginBottom: resume.document_settings?.item_spacing || 4,
      color: '#374151',
    },
    // Enhanced certification styling
    certificationItem: {
      marginBottom: resume.document_settings?.item_spacing || 4,
      paddingBottom: resume.document_settings?.item_spacing || 4,
    },
    // Link text styling
    link: {
      color: resume.document_settings?.link_color || '#2563eb',
      textDecoration: 'none',
    },
    projectLinks: {
      fontSize: resume.document_settings?.secondary_text_size || 9,
      color: '#4b5563',
      marginBottom: resume.document_settings?.item_spacing || 4,
      marginLeft: resume.document_settings?.bullet_indent || 8,
    },
    projectTechnologies: {
      fontSize: resume.document_settings?.base_font_size || 10,
      color: '#4b5563',
      marginLeft: resume.document_settings?.bullet_indent || 8,
      marginBottom: resume.document_settings?.item_spacing || 4,
      fontFamily: resume.document_settings?.font_family ? `${resume.document_settings.font_family}-Bold` : 'Helvetica-Bold',
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
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={styles.companyName}>{exp.position}</Text>
                      <Text style={{ ...styles.companyName, fontFamily: 'Helvetica', fontSize: 10 }}>{' '}•{' '}{exp.company}</Text>
                    </View>
                    {exp.location && (
                      <Text style={styles.jobTitle}>{exp.location}</Text>
                    )}
                  </View>
                  <Text style={styles.dateRange}>
                    {exp.date}
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
                    {(project.url || project.github_url) && (
                      <Text style={styles.projectLinks}>
                        {project.url && `${project.url}`}
                        {project.url && project.github_url && ' • '}
                        {project.github_url && `${project.github_url}`}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.dateRange}>
                    {project.date}
                  </Text>
                </View>
                {project.technologies && project.technologies.length > 0 && (
                  <Text style={styles.projectTechnologies}>
                    {project.technologies.join(' • ')}
                  </Text>
                )}
                {[...(project.description || [])].map((item, i) => (
                  <Text key={i} style={styles.bulletPoint}>• {item}</Text>
                ))}
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
                    {edu.date}
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