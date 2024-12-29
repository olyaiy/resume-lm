'use client';

import { Resume } from "@/lib/types";
import { Document as PDFDocument, Page as PDFPage, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import { memo } from 'react';

interface ResumePDFDocumentProps {
  resume: Resume;
  variant?: 'base' | 'tailored';
}

// Add utility function to parse bold text
function renderTextWithBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Remove the ** markers and render as bold
      return <Text key={index} style={{ fontFamily: 'Helvetica-Bold' }}>{part.slice(2, -2)}</Text>;
    }
    return <Text key={index}>{part}</Text>;
  });
}

export const ResumePDFDocument = memo(function ResumePDFDocument({ resume, variant = 'base' }: ResumePDFDocumentProps) {
  // PDF Styles Configuration
  const styles = StyleSheet.create({
    // Base page configuration
    page: {
      paddingTop: resume.document_settings?.document_margin_vertical !== undefined ? resume.document_settings.document_margin_vertical : 36,
      paddingBottom: resume.document_settings?.document_margin_vertical !== undefined ? resume.document_settings.document_margin_vertical : 36,
      paddingLeft: resume.document_settings?.document_margin_horizontal !== undefined ? resume.document_settings.document_margin_horizontal : 36,
      paddingRight: resume.document_settings?.document_margin_horizontal !== undefined ? resume.document_settings.document_margin_horizontal : 36,
      fontFamily: 'Helvetica',
      color: '#1f2937',
      fontSize: resume.document_settings?.document_font_size !== undefined ? resume.document_settings.document_font_size : 10,
      lineHeight: resume.document_settings?.document_line_height !== undefined ? resume.document_settings.document_line_height : 1.5,
    },
    // Header section
    header: {
      alignItems: 'center',
    },
    // Name display
    name: {
      fontSize: resume.document_settings?.header_name_size !== undefined ? resume.document_settings.header_name_size : 24,
      fontFamily: 'Helvetica-Bold',
      marginBottom: resume.document_settings?.header_name_bottom_spacing !== undefined ? resume.document_settings.header_name_bottom_spacing : 24,
      color: '#111827',
      textAlign: 'center',
    },
    // Contact information layout
    contactInfo: {
      fontSize: resume.document_settings?.document_font_size !== undefined ? resume.document_settings.document_font_size : 10,
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
    bulletSeparator: {
      color: '#4b5563',
      marginHorizontal: 2,
    },
    // Section titles
    sectionTitle: {
      fontSize: resume.document_settings?.document_font_size !== undefined ? resume.document_settings.document_font_size : 10,
      fontFamily: 'Helvetica-Bold',
      marginBottom: 4,
      color: '#111827',
      textTransform: 'uppercase',
      borderBottom: '0.5pt solid #e5e7eb',
      paddingBottom: 0,
    },
    // Skills section
    skillsSection: {
      marginTop: resume.document_settings?.skills_margin_top !== undefined ? resume.document_settings.skills_margin_top : 2,
      marginBottom: resume.document_settings?.skills_margin_bottom !== undefined ? resume.document_settings.skills_margin_bottom : 2,
      marginLeft: resume.document_settings?.skills_margin_horizontal !== undefined ? resume.document_settings.skills_margin_horizontal : 0,
      marginRight: resume.document_settings?.skills_margin_horizontal !== undefined ? resume.document_settings.skills_margin_horizontal : 0,
    },
    skillsGrid: {
      flexDirection: 'column',
      gap: resume.document_settings?.skills_item_spacing !== undefined ? resume.document_settings.skills_item_spacing : 4,
    },
    skillCategory: {
      marginBottom: resume.document_settings?.skills_item_spacing !== undefined ? resume.document_settings.skills_item_spacing : 4,
      flexDirection: 'row',
    },
    skillCategoryTitle: {
      fontSize: resume.document_settings?.document_font_size !== undefined ? resume.document_settings.document_font_size : 10,
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
      marginRight: 4,
    },
    skillItem: {
      fontSize: resume.document_settings?.document_font_size !== undefined ? resume.document_settings.document_font_size : 10,
      color: '#4b5563',
    },
    // Experience section
    experienceSection: {
      marginTop: resume.document_settings?.experience_margin_top !== undefined ? resume.document_settings.experience_margin_top : 2,
      marginBottom: resume.document_settings?.experience_margin_bottom !== undefined ? resume.document_settings.experience_margin_bottom : 2,
      marginLeft: resume.document_settings?.experience_margin_horizontal !== undefined ? resume.document_settings.experience_margin_horizontal : 0,
      marginRight: resume.document_settings?.experience_margin_horizontal !== undefined ? resume.document_settings.experience_margin_horizontal : 0,
    },
    experienceItem: {
      marginBottom: resume.document_settings?.experience_item_spacing || 4,
    },
    experienceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    companyName: {
      fontSize: resume.document_settings?.document_font_size !== undefined ? resume.document_settings.document_font_size : 10,
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
    },
    jobTitle: {
      fontSize: resume.document_settings?.document_font_size !== undefined ? resume.document_settings.document_font_size : 10,
      color: '#4b5563',
    },
    dateRange: {
      fontSize: resume.document_settings?.document_font_size !== undefined ? resume.document_settings.document_font_size : 10,
      color: '#6b7280',
      textAlign: 'right',
    },
    bulletPoint: {
      fontSize: resume.document_settings?.document_font_size !== undefined ? resume.document_settings.document_font_size : 10,
      marginBottom: resume.document_settings?.experience_item_spacing || 4,
      color: '#374151',
      marginLeft: 8,
      paddingLeft: 8,
      flexDirection: 'row',
    },
    bulletText: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      display: 'flex',
    },
    bulletDot: {
      width: 8,
      marginRight: 4,
    },
    bulletTextContent: {
      flex: 1,
    },
    // Projects section
    projectsSection: {
      marginTop: resume.document_settings?.projects_margin_top !== undefined ? resume.document_settings.projects_margin_top : 2,
      marginBottom: resume.document_settings?.projects_margin_bottom !== undefined ? resume.document_settings.projects_margin_bottom : 2,
      marginLeft: resume.document_settings?.projects_margin_horizontal !== undefined ? resume.document_settings.projects_margin_horizontal : 0,
      marginRight: resume.document_settings?.projects_margin_horizontal !== undefined ? resume.document_settings.projects_margin_horizontal : 0,
    },
    projectItem: {
      marginBottom: resume.document_settings?.projects_item_spacing || 4,
    },
    projectHeader: {
      flexDirection: 'column',
      marginBottom: 0,
    },
    projectHeaderTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 2,
    },
    projectHeaderRight: {
      alignItems: 'flex-end',
    },
    projectTitle: {
      fontSize: resume.document_settings?.document_font_size !== undefined ? resume.document_settings.document_font_size : 10,
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
    },
    projectTechnologies: {
      fontSize: resume.document_settings?.document_font_size !== undefined ? resume.document_settings.document_font_size : 10,
      color: '#4b5563',
      fontFamily: 'Helvetica-Bold',
    },
    projectDescription: {
      fontSize: resume.document_settings?.document_font_size !== undefined ? resume.document_settings.document_font_size : 10,
      color: '#374151',
    },
    projectLinks: {
      fontSize: resume.document_settings?.document_font_size !== undefined ? resume.document_settings.document_font_size : 10,
      color: '#4b5563',
      textAlign: 'right',
    },
    // Education section
    educationSection: {
      marginTop: resume.document_settings?.education_margin_top !== undefined ? resume.document_settings.education_margin_top : 2,
      marginBottom: resume.document_settings?.education_margin_bottom !== undefined ? resume.document_settings.education_margin_bottom : 2,
      marginLeft: resume.document_settings?.education_margin_horizontal !== undefined ? resume.document_settings.education_margin_horizontal : 0,
      marginRight: resume.document_settings?.education_margin_horizontal !== undefined ? resume.document_settings.education_margin_horizontal : 0,
    },
    educationItem: {
      marginBottom: resume.document_settings?.education_item_spacing || 4,
    },
    educationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    schoolName: {
      fontSize: resume.document_settings?.document_font_size !== undefined ? resume.document_settings.document_font_size : 10,
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
    },
    degree: {
      fontSize: resume.document_settings?.document_font_size !== undefined ? resume.document_settings.document_font_size : 10,
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
            {resume.location && (
              <>
                <Text>{resume.location}</Text>
                {(resume.email || resume.phone_number || resume.website || resume.linkedin_url || resume.github_url) && (
                  <Text style={styles.bulletSeparator}>•</Text>
                )}
              </>
            )}
            {resume.email && (
              <>
                <Link src={`mailto:${resume.email}`}><Text>{resume.email}</Text></Link>
                {(resume.phone_number || resume.website || resume.linkedin_url || resume.github_url) && (
                  <Text style={styles.bulletSeparator}>•</Text>
                )}
              </>
            )}
            {resume.phone_number && (
              <>
                <Text>{resume.phone_number}</Text>
                {(resume.website || resume.linkedin_url || resume.github_url) && (
                  <Text style={styles.bulletSeparator}>•</Text>
                )}
              </>
            )}
            {resume.website && (
              <>
                <Link src={resume.website.startsWith('http') ? resume.website : `https://${resume.website}`}>
                  <Text style={styles.link}>{resume.website}</Text>
                </Link>
                {(resume.linkedin_url || resume.github_url) && (
                  <Text style={styles.bulletSeparator}>•</Text>
                )}
              </>
            )}
            {resume.linkedin_url && (
              <>
                <Link src={resume.linkedin_url.startsWith('http') ? resume.linkedin_url : `https://${resume.linkedin_url}`}>
                  <Text style={styles.link}>{resume.linkedin_url}</Text>
                </Link>
                {resume.github_url && <Text style={styles.bulletSeparator}>•</Text>}
              </>
            )}
            {resume.github_url && (
              <Link src={resume.github_url.startsWith('http') ? resume.github_url : `https://${resume.github_url}`}>
                <Text style={styles.link}>{resume.github_url}</Text>
              </Link>
            )}
          </View>
        </View>

        {/* Skills Section */}
        {resume.skills && resume.skills.length > 0 && (
          <View style={styles.skillsSection}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsGrid}>
              {resume.skills.map((skillCategory, index) => (
                <View key={index} style={styles.skillCategory}>
                  <Text style={styles.skillCategoryTitle}>{skillCategory.category}:</Text>
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
                    <Text style={styles.companyName}>{experience.position}</Text>
                    <Text style={styles.jobTitle}>{experience.company}</Text>
                  </View>
                  <Text style={styles.dateRange}>{experience.date}</Text>
                </View>
                {experience.description.map((bullet, bulletIndex) => (
                  <View key={bulletIndex} style={styles.bulletPoint}>
                    <Text style={styles.bulletDot}>•</Text>
                    <View style={styles.bulletText}>
                      <Text style={styles.bulletTextContent}>
                        {renderTextWithBold(bullet)}
                      </Text>
                    </View>
                  </View>
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
                  <View style={styles.projectHeaderTop}>
                    <View>
                      <Text style={styles.projectTitle}>{project.name}</Text>
                      {project.technologies && (
                        <Text style={styles.projectTechnologies}>
                          {project.technologies.join(', ')}
                        </Text>
                      )}
                    </View>
                    <View style={styles.projectHeaderRight}>
                      {project.date && <Text style={styles.dateRange}>{project.date}</Text>}
                      {(project.url || project.github_url) && (
                        <Text style={styles.projectLinks}>
                          {project.url && (
                            <Link src={project.url.startsWith('http') ? project.url : `https://${project.url}`}>
                              <Text style={styles.link}>{project.url}</Text>
                            </Link>
                          )}
                          {project.url && project.github_url && ' | '}
                          {project.github_url && (
                            <Link src={project.github_url.startsWith('http') ? project.github_url : `https://${project.github_url}`}>
                              <Text style={styles.link}>{project.github_url}</Text>
                            </Link>
                          )}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
                
                {project.description.map((bullet, bulletIndex) => (
                  <View key={bulletIndex} style={styles.bulletPoint}>
                    <Text style={styles.bulletDot}>•</Text>
                    <View style={styles.bulletText}>
                      <Text style={styles.bulletTextContent}>
                        {renderTextWithBold(bullet)}
                      </Text>
                    </View>
                  </View>
                ))}
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
                  <View key={bulletIndex} style={styles.bulletPoint}>
                    <Text style={styles.bulletDot}>•</Text>
                    <View style={styles.bulletText}>
                      {renderTextWithBold(achievement)}
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </PDFPage>
    </PDFDocument>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.resume === nextProps.resume &&
    prevProps.variant === nextProps.variant
  );
}); 