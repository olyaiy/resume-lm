/**
 * Fast live resume preview.
 *
 * Editing uses normal HTML/CSS so typing never waits for PDF generation or
 * PDF.js page layout. The high-fidelity PDF renderer remains available from
 * the explicit download/print-preview actions.
 */

"use client";

import Image from "next/image";
import { memo, type ReactNode } from "react";
import {
  DocumentSettings,
  Education,
  Project,
  Resume,
  Skill,
  WorkExperience,
} from "@/lib/types";

const DEFAULT_DOCUMENT_SETTINGS: DocumentSettings = {
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
  footer_width: 95,
};

type SectionName = "skills" | "experience" | "projects" | "education";

const DEFAULT_SECTION_ORDER: SectionName[] = [
  "skills",
  "experience",
  "projects",
  "education",
];

function normalizeUrl(value: string): string {
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

function RichText({ value }: { value: string }) {
  const parts = value.split(/(\*\*.*?\*\*)/g);

  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}

function ResumeLink({ href, children }: { href: string; children: ReactNode }) {
  const normalizedHref = href.includes(":") ? href : normalizeUrl(href);

  return (
    <a
      href={normalizedHref}
      target="_blank"
      rel="noreferrer"
      className="text-blue-700 no-underline hover:underline"
    >
      {children}
    </a>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-1 border-b border-gray-200 pb-0 text-[1em] font-bold uppercase text-gray-950">
      {children}
    </h2>
  );
}

function ContactInfo({ resume }: { resume: Resume }) {
  const contacts: ReactNode[] = [];

  if (resume.location) contacts.push(<span key="location">{resume.location}</span>);
  if (resume.email) {
    contacts.push(
      <ResumeLink key="email" href={`mailto:${resume.email}`}>
        {resume.email}
      </ResumeLink>,
    );
  }
  if (resume.phone_number) contacts.push(<span key="phone">{resume.phone_number}</span>);
  if (resume.website) {
    contacts.push(
      <ResumeLink key="website" href={normalizeUrl(resume.website)}>
        {resume.website}
      </ResumeLink>,
    );
  }
  if (resume.linkedin_url) {
    contacts.push(
      <ResumeLink key="linkedin" href={normalizeUrl(resume.linkedin_url)}>
        {resume.linkedin_url}
      </ResumeLink>,
    );
  }
  if (resume.github_url) {
    contacts.push(
      <ResumeLink key="github" href={normalizeUrl(resume.github_url)}>
        {resume.github_url}
      </ResumeLink>,
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-x-1 gap-y-0.5 text-gray-700">
      {contacts.map((contact, index) => (
        <span key={index} className="inline-flex items-center">
          {index > 0 && <span className="mr-1 text-gray-500">•</span>}
          {contact}
        </span>
      ))}
    </div>
  );
}

function SkillsSection({ skills, settings }: { skills: Skill[]; settings: DocumentSettings }) {
  if (!skills.length) return null;

  return (
    <section
      style={{
        marginTop: settings.skills_margin_top,
        marginBottom: settings.skills_margin_bottom,
        marginLeft: settings.skills_margin_horizontal,
        marginRight: settings.skills_margin_horizontal,
      }}
    >
      <SectionTitle>Skills</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: settings.skills_item_spacing }}>
        {skills.map((skill, index) => (
          <div key={`${skill.category}-${index}`} className="flex flex-wrap">
            <strong className="mr-1 shrink-0">{skill.category}:</strong>
            <span className="min-w-0 flex-1 text-gray-700">{skill.items.join(", ")}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function BulletList({ items, itemSpacing }: { items?: string[]; itemSpacing: number }) {
  if (!items?.length) return null;

  return (
    <ul className="m-0 list-none p-0">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="grid grid-cols-[12px_minmax(0,1fr)]"
          style={{ marginBottom: itemSpacing }}
        >
          <span aria-hidden="true">•</span>
          <span className="min-w-0"><RichText value={item} /></span>
        </li>
      ))}
    </ul>
  );
}

function ExperienceSection({ experiences, settings }: { experiences: WorkExperience[]; settings: DocumentSettings }) {
  if (!experiences.length) return null;

  return (
    <section
      style={{
        marginTop: settings.experience_margin_top,
        marginBottom: settings.experience_margin_bottom,
        marginLeft: settings.experience_margin_horizontal,
        marginRight: settings.experience_margin_horizontal,
      }}
    >
      <SectionTitle>Experience</SectionTitle>
      {experiences.map((experience, index) => (
        <article
          key={`${experience.company}-${experience.position}-${index}`}
          style={{ marginBottom: settings.experience_item_spacing }}
        >
          <div className="mb-1 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
            <div className="min-w-0">
              <div className="font-bold text-gray-950"><RichText value={experience.position} /></div>
              <div className="flex flex-wrap items-center gap-x-1 text-gray-950">
                <span><RichText value={experience.company} /></span>
                {experience.location && <><span className="text-gray-500">•</span><span className="text-gray-700">{experience.location}</span></>}
              </div>
            </div>
            <span className="text-right text-gray-950">{experience.date}</span>
          </div>
          <BulletList items={experience.description} itemSpacing={settings.experience_item_spacing} />
        </article>
      ))}
    </section>
  );
}

function ProjectsSection({ projects, settings }: { projects: Project[]; settings: DocumentSettings }) {
  if (!projects.length) return null;

  return (
    <section
      style={{
        marginTop: settings.projects_margin_top,
        marginBottom: settings.projects_margin_bottom,
        marginLeft: settings.projects_margin_horizontal,
        marginRight: settings.projects_margin_horizontal,
      }}
    >
      <SectionTitle>Projects</SectionTitle>
      {projects.map((project, index) => (
        <article key={`${project.name}-${index}`} style={{ marginBottom: settings.projects_item_spacing }}>
          <div className="mb-1">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
              <strong className="min-w-0 text-gray-950"><RichText value={project.name} /></strong>
              <div className="flex flex-wrap justify-end gap-x-2 text-right text-gray-700">
                {project.date && <span>{project.date}</span>}
                {project.url && <ResumeLink href={normalizeUrl(project.url)}>{project.url}</ResumeLink>}
                {project.github_url && <ResumeLink href={normalizeUrl(project.github_url)}>{project.github_url}</ResumeLink>}
              </div>
            </div>
            {project.technologies?.length ? (
              <div className="font-bold text-gray-700">{project.technologies.map((technology) => technology.replace(/\*\*/g, "")).join(", ")}</div>
            ) : null}
          </div>
          <BulletList items={project.description} itemSpacing={settings.projects_item_spacing} />
        </article>
      ))}
    </section>
  );
}

function EducationSection({ education, settings }: { education: Education[]; settings: DocumentSettings }) {
  if (!education.length) return null;

  return (
    <section
      style={{
        marginTop: settings.education_margin_top,
        marginBottom: settings.education_margin_bottom,
        marginLeft: settings.education_margin_horizontal,
        marginRight: settings.education_margin_horizontal,
      }}
    >
      <SectionTitle>Education</SectionTitle>
      {education.map((item, index) => (
        <article key={`${item.school}-${item.degree}-${index}`} style={{ marginBottom: settings.education_item_spacing }}>
          <div className="mb-1 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
            <div className="min-w-0">
              <div className="font-bold text-gray-950"><RichText value={item.school} /></div>
              <div className="text-gray-950"><RichText value={`${item.degree} ${item.field}`} /></div>
            </div>
            <span className="text-right text-gray-950">{item.date}</span>
          </div>
          <BulletList items={item.achievements} itemSpacing={settings.education_item_spacing} />
        </article>
      ))}
    </section>
  );
}

function isSectionVisible(resume: Resume, section: SectionName): boolean {
  return resume.section_configs?.[section]?.visible !== false;
}

function getSectionOrder(resume: Resume): SectionName[] {
  const requested = resume.section_order?.filter((section): section is SectionName =>
    DEFAULT_SECTION_ORDER.includes(section as SectionName),
  );

  if (!requested?.length) return DEFAULT_SECTION_ORDER;

  return [
    ...requested,
    ...DEFAULT_SECTION_ORDER.filter((section) => !requested.includes(section)),
  ];
}

function ResumeSections({ resume, settings }: { resume: Resume; settings: DocumentSettings }) {
  return (
    <>
      {getSectionOrder(resume).map((section) => {
        if (!isSectionVisible(resume, section)) return null;

        switch (section) {
          case "skills":
            return <SkillsSection key={section} skills={resume.skills} settings={settings} />;
          case "experience":
            return <ExperienceSection key={section} experiences={resume.work_experience} settings={settings} />;
          case "projects":
            return <ProjectsSection key={section} projects={resume.projects} settings={settings} />;
          case "education":
            return <EducationSection key={section} education={resume.education} settings={settings} />;
        }
      })}
    </>
  );
}

interface ResumePreviewProps {
  resume: Resume;
  variant?: "base" | "tailored";
  containerWidth: number;
}

export const ResumePreview = memo(function ResumePreview({
  resume,
  variant = "base",
  containerWidth,
}: ResumePreviewProps) {
  const settings = { ...DEFAULT_DOCUMENT_SETTINGS, ...resume.document_settings };

  return (
    <div
      className="relative min-h-full w-full bg-black/15 px-3 py-4 sm:px-6"
      data-preview-variant={variant}
      data-preview-width={Math.round(containerWidth)}
    >
      <article
        aria-label="Live resume preview"
        className="relative mx-auto box-border min-h-[1056px] w-full max-w-[816px] overflow-hidden bg-white text-gray-950 shadow-xl"
        style={{
          paddingTop: `${settings.document_margin_vertical}pt`,
          paddingBottom: `${settings.document_margin_vertical + (settings.show_ubc_footer ? 48 : 0)}pt`,
          paddingLeft: `${settings.document_margin_horizontal}pt`,
          paddingRight: `${settings.document_margin_horizontal}pt`,
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: `${settings.document_font_size}pt`,
          lineHeight: settings.document_line_height,
        }}
      >
        <header className="mb-1 text-center">
          <h1
            className="font-bold text-gray-950"
            style={{
              margin: 0,
              marginBottom: `${settings.header_name_bottom_spacing}pt`,
              fontSize: `${settings.header_name_size}pt`,
              lineHeight: 1,
            }}
          >
            {resume.first_name} {resume.last_name}
          </h1>
          <ContactInfo resume={resume} />
        </header>

        <ResumeSections resume={resume} settings={settings} />

        {settings.show_ubc_footer && (
          <div className="mt-8 flex justify-center">
            <Image
              src="/images/ubc-science-footer.png"
              alt="UBC Science"
              width={612}
              height={72}
              style={{ width: `${settings.footer_width ?? 95}%`, height: "auto" }}
            />
          </div>
        )}
      </article>
    </div>
  );
}, (previous, next) => (
  previous.resume === next.resume &&
  previous.variant === next.variant &&
  previous.containerWidth === next.containerWidth
));
