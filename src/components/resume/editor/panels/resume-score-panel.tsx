"use client";

import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  TrendingUp,
  Target,
  Award,
  AlertTriangle,
  ArrowUpCircle,
  CheckCircle2,
  FileSearch,
  BookOpen,
  Zap,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { generateResumeScore } from "@/utils/actions/resumes/actions";
import { Resume, Job as JobType } from "@/lib/types";
import { useApiKeys, useDefaultModel } from "@/hooks/use-api-keys";
import { toast } from "@/hooks/use-toast";

export interface ResumeScoreMetrics {
  overallScore: {
    score: number;
    reason: string;
  };

  completeness: {
    contactInformation: { score: number; reason: string };
    detailLevel: { score: number; reason: string };
  };

  impactScore: {
    activeVoiceUsage: { score: number; reason: string };
    quantifiedAchievements: { score: number; reason: string };
  };

  roleMatch: {
    skillsRelevance: { score: number; reason: string };
    experienceAlignment: { score: number; reason: string };
    educationFit: { score: number; reason: string };
  };

  atsCompatibility?: {
    keywordOptimization: { score: number; reason: string };
    formatting: { score: number; reason: string };
    sectionStructure: { score: number; reason: string };
  };

  brevityAndClarity?: {
    conciseness: { score: number; reason: string };
    bulletPointQuality: { score: number; reason: string };
    readability: { score: number; reason: string };
  };

  prioritizedActions?: Array<{
    priority: "high" | "medium" | "low";
    category: string;
    action: string;
  }>;

  jobAlignment?: {
    keywordMatch: {
      score: number;
      reason: string;
      matchedKeywords?: string[];
      missingKeywords?: string[];
    };
    requirementsMatch: {
      score: number;
      reason: string;
      matchedRequirements?: string[];
      gapAnalysis?: string[];
    };
    companyFit: {
      score: number;
      reason: string;
      suggestions?: string[];
    };
  };

  overallImprovements?: string[];
  jobSpecificImprovements?: string[];
  isTailoredResume?: boolean;
}

interface ResumeScorePanelProps {
  resume: Resume;
  job?: JobType | null;
}

const LOCAL_STORAGE_KEY = "resumelm-resume-scores";
const MAX_SCORES = 10;

interface StoredScoreEntry {
  score: ResumeScoreMetrics;
  signature: string;
  generatedAt: string;
}

// --- Utility helpers ---

function camelCaseToReadable(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (str) => str.toUpperCase());
}

function getResumeForScoring(resume: Resume) {
  return {
    ...resume,
    section_configs: undefined,
    section_order: undefined,
  };
}

function getJobForScoring(job?: JobType | null) {
  if (!job) return null;
  return {
    ...job,
    employment_type: job.employment_type || undefined,
  };
}

function hashContent(content: string): string {
  let hash = 2166136261;
  for (let i = 0; i < content.length; i += 1) {
    hash ^= content.charCodeAt(i);
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function createScoreSignature(
  resume: Resume,
  job: JobType | null | undefined,
  model: string
): string {
  const payload = {
    resume: getResumeForScoring(resume),
    job: getJobForScoring(job),
    model,
  };
  return hashContent(JSON.stringify(payload));
}

function parseStoredScoreEntry(raw: unknown): StoredScoreEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as Record<string, unknown>;
  if (typeof candidate.signature !== "string") return null;
  if (!candidate.score || typeof candidate.score !== "object") return null;
  return {
    score: candidate.score as ResumeScoreMetrics,
    signature: candidate.signature,
    generatedAt:
      typeof candidate.generatedAt === "string" ? candidate.generatedAt : "",
  };
}

function getStoredScores(
  resumeId: string,
  signature: string
): ResumeScoreMetrics | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return null;
    const scores = new Map<string, unknown>(JSON.parse(stored));
    const storedEntry = parseStoredScoreEntry(scores.get(resumeId));
    if (!storedEntry) return null;
    if (storedEntry.signature !== signature) return null;
    return storedEntry.score;
  } catch (error) {
    console.error("Error reading stored scores:", error);
    return null;
  }
}

function updateStoredScores(resumeId: string, entry: StoredScoreEntry) {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const scores = stored
      ? new Map<string, StoredScoreEntry>(JSON.parse(stored))
      : new Map<string, StoredScoreEntry>();
    if (scores.has(resumeId)) {
      scores.delete(resumeId);
    }
    if (scores.size >= MAX_SCORES) {
      const oldestKey = scores.keys().next().value;
      if (oldestKey) {
        scores.delete(oldestKey);
      }
    }
    scores.set(resumeId, entry);
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(Array.from(scores))
    );
  } catch (error) {
    console.error("Error storing score:", error);
  }
}

function getLetterGrade(score: number): {
  grade: string;
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 90) return { grade: "A+", label: "Exceptional", color: "text-emerald-700", bgColor: "bg-emerald-50 border-emerald-200" };
  if (score >= 85) return { grade: "A", label: "Excellent", color: "text-emerald-600", bgColor: "bg-emerald-50 border-emerald-200" };
  if (score >= 80) return { grade: "A-", label: "Very Good", color: "text-green-600", bgColor: "bg-green-50 border-green-200" };
  if (score >= 75) return { grade: "B+", label: "Good", color: "text-green-600", bgColor: "bg-green-50 border-green-200" };
  if (score >= 70) return { grade: "B", label: "Above Average", color: "text-lime-600", bgColor: "bg-lime-50 border-lime-200" };
  if (score >= 65) return { grade: "B-", label: "Slightly Above Average", color: "text-lime-600", bgColor: "bg-lime-50 border-lime-200" };
  if (score >= 60) return { grade: "C+", label: "Average", color: "text-yellow-600", bgColor: "bg-yellow-50 border-yellow-200" };
  if (score >= 55) return { grade: "C", label: "Below Average", color: "text-yellow-600", bgColor: "bg-yellow-50 border-yellow-200" };
  if (score >= 50) return { grade: "C-", label: "Needs Work", color: "text-orange-600", bgColor: "bg-orange-50 border-orange-200" };
  if (score >= 40) return { grade: "D", label: "Poor", color: "text-orange-700", bgColor: "bg-orange-50 border-orange-200" };
  return { grade: "F", label: "Critical Issues", color: "text-red-700", bgColor: "bg-red-50 border-red-200" };
}

function getScorePathColor(score: number): string {
  if (score >= 85) return "#10b981";
  if (score >= 70) return "#22c55e";
  if (score >= 55) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function getCategoryAverage(
  metrics: Record<string, { score: number; reason: string }>
): number {
  const values = Object.values(metrics);
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, m) => sum + m.score, 0) / values.length);
}

// --- Main component ---

export default function ResumeScorePanel({ resume, job }: ResumeScorePanelProps) {
  const { apiKeys } = useApiKeys();
  const { defaultModel } = useDefaultModel();
  const selectedModel = useMemo(() => defaultModel, [defaultModel]);
  const scoreSignature = useMemo(
    () => createScoreSignature(resume, job, selectedModel),
    [resume, job, selectedModel]
  );
  const [isCalculating, setIsCalculating] = useState(false);
  const [scoreData, setScoreData] = useState<ResumeScoreMetrics | null>(() => {
    return getStoredScores(resume.id, scoreSignature);
  });

  useEffect(() => {
    const storedScore = getStoredScores(resume.id, scoreSignature);
    setScoreData(storedScore);
  }, [resume.id, scoreSignature]);

  const handleRecalculate = async () => {
    if (!selectedModel) {
      toast({
        title: "Model required",
        description: "Select an AI model before generating a resume score.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    try {
      const newScore = await generateResumeScore(
        getResumeForScoring(resume),
        getJobForScoring(job),
        { model: selectedModel, apiKeys }
      );

      const scoreMetrics = newScore as ResumeScoreMetrics;
      setScoreData(scoreMetrics);
      updateStoredScores(resume.id, {
        score: scoreMetrics,
        signature: scoreSignature,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error generating score:", error);
      const description =
        error instanceof Error
          ? `${error.message} Check your model selection and API keys in Settings, then try again.`
          : "Failed to generate resume score. Check your model selection and API keys in Settings, then try again.";

      toast({ title: "Resume score failed", description, variant: "destructive" });
    } finally {
      setIsCalculating(false);
    }
  };

  // Empty state
  if (!scoreData) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="p-3 bg-muted rounded-full">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Resume Score Analysis</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get a detailed analysis of your resume&apos;s effectiveness
                across ATS compatibility, impact, clarity, and more
              </p>
              <Button
                onClick={handleRecalculate}
                disabled={isCalculating}
                className="w-full sm:w-auto"
              >
                <RefreshCw className={cn("mr-2 h-4 w-4", isCalculating && "animate-spin")} />
                {isCalculating ? "Analyzing..." : "Generate Score"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const gradeInfo = getLetterGrade(scoreData.overallScore.score);
  const prioritizedActions = scoreData.prioritizedActions ?? [];
  const keyImprovements = scoreData.overallImprovements ?? [];

  // Build the category sections list
  const categoryEntries: Array<{
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    metrics: Record<string, { score: number; reason: string }>;
  }> = [
    { title: "Impact Score", icon: Zap, metrics: scoreData.impactScore },
    { title: "Role Match", icon: Target, metrics: scoreData.roleMatch },
    { title: "Completeness", icon: CheckCircle2, metrics: scoreData.completeness },
  ];

  if (scoreData.atsCompatibility) {
    categoryEntries.splice(2, 0, {
      title: "ATS Compatibility",
      icon: FileSearch,
      metrics: scoreData.atsCompatibility,
    });
  }

  if (scoreData.brevityAndClarity) {
    categoryEntries.push({
      title: "Brevity & Clarity",
      icon: BookOpen,
      metrics: scoreData.brevityAndClarity,
    });
  }

  return (
    <div className="space-y-4">
      {/* Header with recalculate */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Resume Score Analysis</h3>
        <Button onClick={handleRecalculate} disabled={isCalculating} variant="outline" size="sm">
          <RefreshCw className={cn("mr-2 h-3 w-3", isCalculating && "animate-spin")} />
          Recalculate
        </Button>
      </div>

      {/* Overall Score Hero Card */}
      <Card className={cn("border", gradeInfo.bgColor)}>
        <CardContent className="p-5">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 flex-shrink-0">
              <CircularProgressbar
                value={scoreData.overallScore.score}
                text={`${scoreData.overallScore.score}`}
                styles={buildStyles({
                  pathColor: getScorePathColor(scoreData.overallScore.score),
                  textColor: "#1f2937",
                  trailColor: "#e5e7eb",
                  pathTransitionDuration: 1,
                  textSize: "28px",
                })}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn("text-2xl font-bold", gradeInfo.color)}>
                  {gradeInfo.grade}
                </span>
                <span className="text-sm text-muted-foreground">{gradeInfo.label}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {scoreData.overallScore.reason}
              </p>
            </div>
          </div>

          {/* Category quick overview */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categoryEntries.map(({ title, metrics }) => {
              const avg = getCategoryAverage(metrics);
              return (
                <div
                  key={title}
                  className="flex items-center gap-2 rounded-md bg-white/60 border px-2.5 py-1.5"
                >
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full flex-shrink-0",
                      avg >= 70 ? "bg-green-500" : avg >= 50 ? "bg-yellow-500" : "bg-red-500"
                    )}
                  />
                  <span className="text-xs text-muted-foreground truncate">{title}</span>
                  <span className="text-xs font-semibold ml-auto">{avg}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Priority Actions */}
      {prioritizedActions.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-800">
              <ArrowUpCircle className="h-4 w-4" />
              Priority Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2.5">
              {prioritizedActions.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-2.5 text-sm"
                >
                  <PriorityBadge priority={item.priority} />
                  <div className="flex-1 min-w-0">
                    <p className="text-amber-900">{item.action}</p>
                    <span className="text-xs text-amber-600">{item.category}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job-Specific Improvements for Tailored Resumes */}
      {scoreData.isTailoredResume &&
        scoreData.jobSpecificImprovements &&
        scoreData.jobSpecificImprovements.length > 0 && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                <Award className="h-4 w-4" />
                Job-Specific Improvements
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {scoreData.jobSpecificImprovements.map((improvement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    <p className="text-blue-700">{improvement}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Job Alignment Section for Tailored Resumes */}
      {scoreData.isTailoredResume && scoreData.jobAlignment && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-blue-700">
              <Target className="h-4 w-4" />
              Job Alignment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {Object.entries(scoreData.jobAlignment).map(([label, data]) => (
                <JobAlignmentItem key={label} label={label} data={data} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Metrics - collapsible categories */}
      {categoryEntries.map(({ title, icon: Icon, metrics }) => (
        <CollapsibleScoreCard key={title} title={title} icon={Icon} metrics={metrics} />
      ))}

      {/* Key Improvements */}
      {keyImprovements.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              General Improvements
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {keyImprovements.map((improvement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-2 text-sm"
                >
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  <p className="text-muted-foreground">{improvement}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// --- Sub-components ---

function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
  const config = {
    high: { label: "HIGH", className: "bg-red-100 text-red-700 border-red-200" },
    medium: { label: "MED", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    low: { label: "LOW", className: "bg-green-100 text-green-700 border-green-200" },
  };
  const { label, className } = config[priority];
  return (
    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 mt-0.5", className)}>
      {label}
    </span>
  );
}

function CollapsibleScoreCard({
  title,
  icon: Icon,
  metrics,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  metrics: Record<string, { score: number; reason: string }>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const avg = getCategoryAverage(metrics);

  return (
    <Card>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left"
        type="button"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  avg >= 70 ? "bg-green-100 text-green-700" : avg >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                )}
              >
                {avg}/100
              </span>
              <ChevronDown
                className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")}
              />
            </div>
          </div>
        </CardHeader>
      </button>
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {Object.entries(metrics).map(([label, data]) => (
              <ScoreItem key={label} label={label} {...data} />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function ScoreItem({ label, score, reason }: { label: string; score: number; reason: string }) {
  const getScoreColor = (s: number) => {
    if (s >= 70) return "bg-green-500";
    if (s >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{camelCaseToReadable(label)}</span>
        <span
          className={cn(
            "text-xs px-2 py-1 rounded-full font-medium",
            score >= 70 ? "bg-green-100 text-green-700" : score >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
          )}
        >
          {score}/100
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", getScoreColor(score))}
        />
      </div>
      <p className="text-xs text-muted-foreground">{reason}</p>
    </motion.div>
  );
}

function JobAlignmentItem({
  label,
  data,
}: {
  label: string;
  data: {
    score: number;
    reason: string;
    matchedKeywords?: string[];
    missingKeywords?: string[];
    matchedRequirements?: string[];
    gapAnalysis?: string[];
    suggestions?: string[];
  };
}) {
  const getScoreColor = (s: number) => {
    if (s >= 70) return "bg-blue-500";
    if (s >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-blue-700">{camelCaseToReadable(label)}</span>
        <span
          className={cn(
            "text-xs px-2 py-1 rounded-full font-medium",
            data.score >= 70 ? "bg-blue-100 text-blue-700" : data.score >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
          )}
        >
          {data.score}/100
        </span>
      </div>
      <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${data.score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", getScoreColor(data.score))}
        />
      </div>
      <p className="text-xs text-blue-600">{data.reason}</p>

      {/* Matched keywords */}
      {data.matchedKeywords && data.matchedKeywords.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-green-600">Matched Keywords:</p>
          <div className="flex flex-wrap gap-1">
            {data.matchedKeywords.map((keyword, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing keywords */}
      {data.missingKeywords && data.missingKeywords.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-red-600">Missing Keywords:</p>
          <div className="flex flex-wrap gap-1">
            {data.missingKeywords.map((keyword, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Matched requirements */}
      {data.matchedRequirements && data.matchedRequirements.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-green-600">Matched Requirements:</p>
          <div className="space-y-1">
            {data.matchedRequirements.map((req, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
                <p className="text-green-700">{req}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gap analysis */}
      {data.gapAnalysis && data.gapAnalysis.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-orange-600">Areas to Address:</p>
          <div className="space-y-1">
            {data.gapAnalysis.map((gap, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                <AlertTriangle className="h-3 w-3 mt-0.5 text-orange-500 flex-shrink-0" />
                <p className="text-orange-600">{gap}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {data.suggestions && data.suggestions.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-blue-600">Suggestions:</p>
          <div className="space-y-1">
            {data.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                <div className="mt-1.5 h-1 w-1 rounded-full bg-blue-500 flex-shrink-0" />
                <p className="text-blue-600">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
