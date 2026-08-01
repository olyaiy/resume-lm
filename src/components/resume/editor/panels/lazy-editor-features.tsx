"use client";

import dynamic from "next/dynamic";
import { useState, type ComponentType } from "react";
import { Bot, BriefcaseIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { Job, Resume } from "@/lib/types";
import { LoadingFallback } from "../shared/LoadingFallback";

const LazyChatBot = dynamic(
  () => import("../../assistant/chatbot"),
  {
    ssr: false,
    loading: () => <LoadingFallback lines={2} />,
  },
);

export const LazyCoverLetterPanel = dynamic(
  () => import("./cover-letter-panel").then((module) => ({ default: module.CoverLetterPanel })),
  {
    ssr: false,
    loading: () => <LoadingFallback lines={3} />,
  },
);

export const LazyResumeScorePanel = dynamic(
  () => import("./resume-score-panel"),
  {
    ssr: false,
    loading: () => <LoadingFallback lines={3} />,
  },
);

interface ChatAssistantSlotProps {
  resume: Resume;
  onResumeChange: (field: keyof Resume, value: Resume[keyof Resume]) => void;
  job?: Job | null;
}

export function ChatAssistantSlot({ resume, onResumeChange, job }: ChatAssistantSlotProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg border-2 px-3 py-2",
          "border-purple-200/60 bg-purple-50/70 text-xs font-medium text-purple-700",
          "shadow-sm transition-colors hover:border-purple-300/70 hover:bg-purple-100/80",
        )}
        aria-label="Open ResumeLM AI assistant"
      >
        <Bot className="h-3.5 w-3.5" />
        Open AI assistant
      </button>
    );
  }

  return <LazyChatBot resume={resume} onResumeChange={onResumeChange} job={job} />;
}

interface TailoredJobAccordionProps {
  resume: Resume;
  job: Job | null;
  isLoading?: boolean;
}

type LoadedJobAccordion = ComponentType<TailoredJobAccordionProps>;

export function LazyTailoredJobAccordion({ resume, job, isLoading }: TailoredJobAccordionProps) {
  const [value, setValue] = useState<string | undefined>();
  const [LoadedAccordion, setLoadedAccordion] = useState<LoadedJobAccordion | null>(null);

  if (resume.is_base_resume) return null;

  const title = job?.position_title || "Target Job";
  const company = job?.company_name;

  const handleValueChange = (nextValue: string) => {
    setValue(nextValue || undefined);

    if (nextValue !== "job" || LoadedAccordion) return;

    void import("../../management/cards/tailored-job-card").then(({ TailoredJobAccordion }) => {
      setLoadedAccordion(() => TailoredJobAccordion);
    });
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={value}
      onValueChange={handleValueChange}
      className="mt-6"
    >
      {LoadedAccordion ? (
        <LoadedAccordion resume={resume} job={job} isLoading={isLoading} />
      ) : (
        <AccordionItem value="job" className="mb-4 rounded-lg border-2 border-pink-600/50 bg-white shadow-lg backdrop-blur-xl">
          <div className="px-4">
            <AccordionTrigger className="group hover:no-underline">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-pink-100/80 p-1 transition-transform duration-300 group-data-[state=open]:scale-105">
                  <BriefcaseIcon className="h-3.5 w-3.5 text-pink-600" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-pink-900">{title}</span>
                  {company && <span className="text-xs text-pink-600/80">{company}</span>}
                </div>
              </div>
            </AccordionTrigger>
          </div>
          <AccordionContent>
            <LoadingFallback lines={3} />
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}
