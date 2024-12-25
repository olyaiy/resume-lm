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
    padding: 48,
    fontFamily: 'Helvetica',
    color: '#1f2937',
  },
  // Header section containing name and contact info
  header: {
    marginBottom: 20,
  },
  // Large, bold name display at the top
  name: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  // Contact information styling (email, phone, location)
  contactInfo: {
    fontSize: 10,
    textAlign: 'center',
    color: '#4b5563',
    marginBottom: 4,
  },
  // Professional links section (Portfolio, LinkedIn, GitHub)
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    fontSize: 10,
    color: '#2563eb',
  },
  // Section headers (Experience, Education, etc.)
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    marginTop: 16,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  // Professional summary text block
  summary: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 16,
  },
  // Individual experience entries (work, education)
  experienceItem: {
    marginBottom: 12,
  },
  // Header row for experience items with company/title and dates
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  // Company/Organization name styling
  companyName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  // Job title and location text
  jobTitle: {
    fontSize: 10,
    color: '#4b5563',
  },
  // Date range display
  dateRange: {
    fontSize: 10,
    color: '#6b7280',
  },
  // Individual bullet points in descriptions
  bulletPoint: {
    fontSize: 10,
    lineHeight: 1.5,
    marginLeft: 12,
    marginBottom: 2,
  },
  // Skills section grid layout
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  // Individual skill category container
  skillCategory: {
    width: '48%',
  },
  // Skill category title
  skillCategoryTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  // Individual skill tag/pill
  skillItem: {
    fontSize: 10,
    color: '#4b5563',
    backgroundColor: '#f3f4f6',
    padding: '2 6',
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  // Project section styling
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
  // Certification section styling
  certificationItem: {
    marginBottom: 8,
  },
});

export function ResumePDFDocument({ resume, variant = 'base' }: ResumePDFDocumentProps) {
  return (
    <PDFDocument>
      <PDFPage size="LETTER" style={styles.page}>
        {/* Header Section - Name and Contact Information */}
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

        {/* Professional Summary Section */}
        {resume.professional_summary && (
          <>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{resume.professional_summary}</Text>
          </>
        )}

        {/* Work Experience Section */}
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

        {/* Education Section */}
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

        {/* Skills Section */}
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

        {/* Projects Section */}
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

        {/* Certifications Section */}
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
      </PDFPage>
    </PDFDocument>
  );
} 