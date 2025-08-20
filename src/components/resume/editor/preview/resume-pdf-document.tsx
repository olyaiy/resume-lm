'use client';

import { Resume } from "@/lib/types";
import { Document as PDFDocument, Page as PDFPage, Text, View, StyleSheet, Link, Image } from '@react-pdf/renderer';
import { memo, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';

// Base styles that don't depend on resume settings
const baseStyles = {
  link: {
    color: '#2563eb',
    textDecoration: 'none',
  },
  bulletSeparator: {
    color: '#4b5563',
    marginHorizontal: 2,
  },
  bulletDot: {
    width: 8,
    marginRight: 4,
  },
} as const;

// Create a cache outside of components to persist between renders
const textProcessingCache = new Map<string, ReactNode[]>();

// Memoized text processing function
function useTextProcessor() {
  const processText = useCallback((text: string, ignoreMarkdown = false) => {
    // Check cache first
    const cacheKey = `${text}-${ignoreMarkdown}`;
    if (textProcessingCache.has(cacheKey)) {
      return textProcessingCache.get(cacheKey);
    }

    // If ignoring markdown, extract content between asterisks or return plain text
    if (ignoreMarkdown) {
      const content = text.match(/\*\*(.*?)\*\*/)?.[1] || text;
      const processed = [<Text key={0}>{content}</Text>];
      textProcessingCache.set(cacheKey, processed);
      return processed;
    }

    // Process text if not in cache
    const parts = text.split(/(\*\*.*?\*\*)/g);
    const processed = parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <Text key={index} style={{ fontFamily: 'Helvetica-Bold' }}>{part.slice(2, -2)}</Text>;
      }
      return <Text key={index}>{part}</Text>;
    });

    // Store in cache
    textProcessingCache.set(cacheKey, processed);
    return processed;
  }, []);

  return processText;
}

// Memoized section components
const HeaderSection = memo(function HeaderSection({ 
  resume, 
  styles 
}: { 
  resume: Resume; 
  styles: ReturnType<typeof createResumeStyles>;
}) {
  return (
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
            <Link src={`mailto:${resume.email}`}><Text style={styles.link}>{resume.email}</Text></Link>
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
  );
});

const SkillsSection = memo(function SkillsSection({ 
  skills, 
  styles 
}: { 
  skills: Resume['skills']; 
  styles: ReturnType<typeof createResumeStyles>;
}) {
  if (!skills?.length) return null;
  
  return (
    <View style={styles.skillsSection}>
      <Text style={styles.sectionTitle}>Skills</Text>
      <View style={styles.skillsGrid}>
        {skills.map((skillCategory, index) => (
          <View key={index} style={styles.skillCategory}>
            <Text style={styles.skillCategoryTitle}>{skillCategory.category}:</Text>
            <Text style={styles.skillItem}>{skillCategory.items.join(', ')}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const ExperienceSection = memo(function ExperienceSection({ 
  experiences, 
  styles 
}: { 
  experiences: Resume['work_experience']; 
  styles: ReturnType<typeof createResumeStyles>;
}) {
  const processText = useTextProcessor();
  if (!experiences?.length) return null;

  return (
    <View style={styles.experienceSection}>
      <Text style={styles.sectionTitle}>Experience</Text>
      {experiences.map((experience, index) => (
        <View key={index} style={styles.experienceItem}>
          <View style={styles.experienceHeader}>
            <View>
              <Text style={styles.companyName}>{processText(experience.position, true)}</Text>
              <View style={styles.companyLocationRow}>
                <Text style={styles.jobTitle}>{processText(experience.company, true)}</Text>
                {experience.location && (
                  <>
                    <Text style={styles.bulletSeparator}>•</Text>
                    <Text style={styles.locationText}>{experience.location}</Text>
                  </>
                )}
              </View>
            </View>
            <Text style={styles.dateRange}>{experience.date}</Text>
          </View>
          {experience.description.map((bullet, bulletIndex) => (
            <View key={bulletIndex} style={styles.bulletPoint}>
              <Text style={styles.bulletDot}>•</Text>
              <View style={styles.bulletText}>
                <Text style={styles.bulletTextContent}>
                  {processText(bullet)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
});

const ProjectsSection = memo(function ProjectsSection({ 
  projects, 
  styles 
}: { 
  projects: Resume['projects']; 
  styles: ReturnType<typeof createResumeStyles>;
}) {
  const processText = useTextProcessor();
  if (!projects?.length) return null;

  return (
    <View style={styles.projectsSection}>
      <Text style={styles.sectionTitle}>Projects</Text>
      {projects.map((project, index) => (
        <View key={index} style={styles.projectItem}>
          <View style={styles.projectHeader}>
            <View style={styles.projectHeaderTop}>
              <Text style={styles.projectTitle}>{processText(project.name, true)}</Text>
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
            {project.technologies && (
              <Text style={styles.projectTechnologies}>
                {project.technologies.map(tech => tech.replace(/\*\*/g, '')).join(', ')}
              </Text>
            )}
          </View>
          
          {project.description.map((bullet, bulletIndex) => (
            <View key={bulletIndex} style={styles.bulletPoint}>
              <Text style={styles.bulletDot}>•</Text>
              <View style={styles.bulletText}>
                <Text style={styles.bulletTextContent}>
                  {processText(bullet)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
});

const EducationSection = memo(function EducationSection({ 
  education, 
  styles 
}: { 
  education: Resume['education']; 
  styles: ReturnType<typeof createResumeStyles>;
}) {
  const processText = useTextProcessor();
  if (!education?.length) return null;

  return (
    <View style={styles.educationSection}>
      <Text style={styles.sectionTitle}>Education</Text>
      {education.map((edu, index) => (
        <View key={index} style={styles.educationItem}>
          <View style={styles.educationHeader}>
            <View>
              <Text style={styles.schoolName}>{processText(edu.school, true)}</Text>
              <Text style={styles.degree}>{processText(`${edu.degree} ${edu.field}`)}</Text>
            </View>
            <Text style={styles.dateRange}>{edu.date}</Text>
          </View>
          {edu.achievements && edu.achievements.map((achievement, bulletIndex) => (
            <View key={bulletIndex} style={styles.bulletPoint}>
              <Text style={styles.bulletDot}>•</Text>
              <View style={styles.bulletText}>
                {processText(achievement)}
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
});

// Style factory function
function createResumeStyles(settings: Resume['document_settings'] = {
  document_font_size: 10,
  document_line_height: 1.5,
  document_margin_vertical: 36,
  document_margin_horizontal: 36,
  header_name_size: 24,
  header_name_bottom_spacing: 24,
  skills_margin_top: 2,
  skills_margin_bottom: 2,
  skills_margin_horizontal: 0,
  skills_item_spacing: 2,
  experience_margin_top: 2,
  experience_margin_bottom: 2,
  experience_margin_horizontal: 0,
  experience_item_spacing: 4,
  projects_margin_top: 2,
  projects_margin_bottom: 2,
  projects_margin_horizontal: 0,
  projects_item_spacing: 4,
  education_margin_top: 2,
  education_margin_bottom: 2,
  education_margin_horizontal: 0,
  education_item_spacing: 4,
  footer_width: 80,
}) {
  const {
    document_font_size = 10,
    document_line_height = 1.5,
    document_margin_vertical = 36,
    document_margin_horizontal = 36,
    header_name_size = 24,
    header_name_bottom_spacing = 24,
    skills_margin_top = 2,
    skills_margin_bottom = 2,
    skills_margin_horizontal = 0,
    skills_item_spacing = 2,
    experience_margin_top = 2,
    experience_margin_bottom = 2,
    experience_margin_horizontal = 0,
    experience_item_spacing = 4,
    projects_margin_top = 2,
    projects_margin_bottom = 2,
    projects_margin_horizontal = 0,
    projects_item_spacing = 4,
    education_margin_top = 2,
    education_margin_bottom = 2,
    education_margin_horizontal = 0,
    education_item_spacing = 4,
    footer_width = 95,
  } = settings;

  return StyleSheet.create({
    ...baseStyles,
    // Base page configuration
    page: {
      paddingTop: document_margin_vertical,
      paddingBottom: document_margin_vertical + 28,
      paddingLeft: document_margin_horizontal,
      paddingRight: document_margin_horizontal,
      fontFamily: 'Helvetica',
      color: '#111827',
      fontSize: document_font_size,
      lineHeight: document_line_height,
      position: 'relative',
      // backgroundColor: '#32a852',  // Bright green color that should be very visible for testing
    },
    header: {
      alignItems: 'center',
    },
    name: {
      fontSize: header_name_size,
      fontFamily: 'Helvetica-Bold',
      marginBottom: header_name_bottom_spacing,
      color: '#111827',
      textAlign: 'center',
    },
    contactInfo: {
      fontSize: document_font_size,
      color: '#374151',
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 4,
    },
    sectionTitle: {
      fontSize: document_font_size,
      fontFamily: 'Helvetica-Bold',
      marginBottom: 4,
      color: '#111827',
      textTransform: 'uppercase',
      borderBottom: '0.5pt solid #e5e7eb',
      paddingBottom: 0,
    },
    // Skills section
    skillsSection: {
      marginTop: skills_margin_top,
      marginBottom: skills_margin_bottom,
      marginLeft: skills_margin_horizontal,
      marginRight: skills_margin_horizontal,
    },
    skillsGrid: {
      flexDirection: 'column',
      gap: skills_item_spacing,
    },
    skillCategory: {
      marginBottom: skills_item_spacing,
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: '100%',
    },
    skillCategoryTitle: {
      fontSize: document_font_size,
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
      marginRight: 4,
      width: 'auto',
    },
    skillItem: {
      fontSize: document_font_size,
      color: '#374151',
      flexGrow: 1,
      flexBasis: 0,
      flexWrap: 'wrap',
    },
    // Experience section
    experienceSection: {
      marginTop: experience_margin_top,
      marginBottom: experience_margin_bottom,
      marginLeft: experience_margin_horizontal,
      marginRight: experience_margin_horizontal,
    },
    experienceItem: {
      marginBottom: experience_item_spacing,
    },
    experienceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    companyName: {
      fontSize: document_font_size,
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
    },
    jobTitle: {
      fontSize: document_font_size,
      color: '#111827',
    },
    companyLocationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    locationText: {
      fontSize: document_font_size,
      color: '#374151',
    },
    dateRange: {
      fontSize: document_font_size,
      color: '#111827',
      textAlign: 'right',
    },
    bulletPoint: {
      fontSize: document_font_size,
      marginBottom: experience_item_spacing,
      color: '#111827',
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
    bulletTextContent: {
      flex: 1,
    },
    // Projects section
    projectsSection: {
      marginTop: projects_margin_top,
      marginBottom: projects_margin_bottom,
      marginLeft: projects_margin_horizontal,
      marginRight: projects_margin_horizontal,
    },
    projectItem: {
      marginBottom: projects_item_spacing,
    },
    projectHeader: {
      flexDirection: 'column',
      marginBottom: 4,
    },
    projectHeaderTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 2,
    },
    projectHeaderRight: {
      flexDirection: 'row',
      gap: 8,
    },
    projectTitle: {
      fontSize: document_font_size,
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
    },
    projectTechnologies: {
      fontSize: document_font_size,
      color: '#374151',
      fontFamily: 'Helvetica-Bold',
      marginBottom: 0,
    },
    projectDescription: {
      fontSize: document_font_size,
      color: '#111827',
    },
    projectLinks: {
      fontSize: document_font_size,
      color: '#374151',
      textAlign: 'right',
    },
    // Education section
    educationSection: {
      marginTop: education_margin_top,
      marginBottom: education_margin_bottom,
      marginLeft: education_margin_horizontal,
      marginRight: education_margin_horizontal,
    },
    educationItem: {
      marginBottom: education_item_spacing,
    },
    educationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    schoolName: {
      fontSize: document_font_size,
      fontFamily: 'Helvetica-Bold',
      color: '#111827',
    },
    degree: {
      fontSize: document_font_size,
      color: '#111827',
    },
    footer: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      height: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    footerImage: {
      width: `${footer_width}%`,
      height: 'auto',
    },
  });
}

interface ResumePDFDocumentProps {
  resume: Resume;
  variant?: 'base' | 'tailored';
}

export const ResumePDFDocument = memo(function ResumePDFDocument({ resume }: ResumePDFDocumentProps) {
  // Memoize styles based on document settings
  const styles = useMemo(() => createResumeStyles(resume.document_settings), [resume.document_settings]);

  return (
    <PDFDocument>
      <PDFPage size="LETTER" style={styles.page}>
        <HeaderSection resume={resume} styles={styles} />
        <SkillsSection skills={resume.skills} styles={styles} />
        <ExperienceSection experiences={resume.work_experience} styles={styles} />
        <ProjectsSection projects={resume.projects} styles={styles} />
        <EducationSection education={resume.education} styles={styles} />
        
        {resume.document_settings?.show_ubc_footer && (
          <View style={styles.footer}>
            <Image 
              src="/images/ubc-science-footer.png"
              style={styles.footerImage}
            />
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