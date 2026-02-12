"use client";

import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, Target, Award } from "lucide-react";
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
    contactInformation: {
      score: number;
      reason: string;
    };
    detailLevel: {
      score: number;
      reason: string;
    };
  };
  
  impactScore: {
    activeVoiceUsage: {
      score: number;
      reason: string;
    };
    quantifiedAchievements: {
      score: number;
      reason: string;
    };
  };

  roleMatch: {
    skillsRelevance: {
      score: number;
      reason: string;
    };
    experienceAlignment: {
      score: number;
      reason: string;
    };
    educationFit: {
      score: number;
      reason: string;
    };
  };

  // Job-specific scoring for tailored resumes
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

  miscellaneous: {
    [key: string]: {
      score: number;
      reason: string;
    };
  };

  overallImprovements?: string[];
  jobSpecificImprovements?: string[];
  isTailoredResume?: boolean;
}

// Add props interface
interface ResumeScorePanelProps {
  resume: Resume;
  job?: JobType | null;
}

const LOCAL_STORAGE_KEY = 'resumelm-resume-scores';
const MAX_SCORES = 10;

interface StoredScoreEntry {
  score: ResumeScoreMetrics;
  signature: string;
  generatedAt: string;
}

// Helper function to convert camelCase to readable labels
function camelCaseToReadable(text: string): string {
  return text
    // Insert space before uppercase letters
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Capitalize first letter
    .replace(/^./, str => str.toUpperCase());
}

function getResumeForScoring(resume: Resume) {
  return {
    ...resume,
    section_configs: undefined,
    section_order: undefined
  };
}

function getJobForScoring(job?: JobType | null) {
  if (!job) return null;

  return {
    ...job,
    employment_type: job.employment_type || undefined
  };
}

function hashContent(content: string): string {
  let hash = 2166136261;
  for (let i = 0; i < content.length; i += 1) {
    hash ^= content.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function createScoreSignature(resume: Resume, job: JobType | null | undefined, model: string): string {
  const payload = {
    resume: getResumeForScoring(resume),
    job: getJobForScoring(job),
    model
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
    generatedAt: typeof candidate.generatedAt === "string" ? candidate.generatedAt : ""
  };
}

function getStoredScores(resumeId: string, signature: string): ResumeScoreMetrics | null {
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
    console.error('Error reading stored scores:', error);
    return null;
  }
}

function updateStoredScores(resumeId: string, entry: StoredScoreEntry) {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const scores = stored ? new Map<string, StoredScoreEntry>(JSON.parse(stored)) : new Map<string, StoredScoreEntry>();

    if (scores.has(resumeId)) {
      scores.delete(resumeId);
    }

    // Maintain only MAX_SCORES entries
    if (scores.size >= MAX_SCORES) {
      const oldestKey = scores.keys().next().value;
      if (oldestKey) {
        scores.delete(oldestKey);
      }
    }

    scores.set(resumeId, entry);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(scores)));
  } catch (error) {
    console.error('Error storing score:', error);
  }
}

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
      // Call the generateResumeScore action with current resume
      const newScore = await generateResumeScore(getResumeForScoring(resume), getJobForScoring(job), {
        model: selectedModel,
        apiKeys,
      });

      // Update state and storage
      const scoreMetrics = newScore as ResumeScoreMetrics;
      setScoreData(scoreMetrics);
      updateStoredScores(resume.id, {
        score: scoreMetrics,
        signature: scoreSignature,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error generating score:", error);
      const description = error instanceof Error
        ? `${error.message} Check your model selection and API keys in Settings, then try again.`
        : "Failed to generate resume score. Check your model selection and API keys in Settings, then try again.";

      toast({
        title: "Resume score failed",
        description,
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // If no score data is available, show the empty state
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
                 Generate a comprehensive analysis of your resume&apos;s effectiveness
               </p>
              <Button
                onClick={handleRecalculate}
                disabled={isCalculating}
                className="w-full sm:w-auto"
              >
                <RefreshCw 
                  className={cn(
                    "mr-2 h-4 w-4",
                    isCalculating && "animate-spin"
                  )} 
                />
                {isCalculating ? "Analyzing..." : "Generate Score"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const keyImprovements = scoreData.overallImprovements ?? [];

  // When we have score data, show the full analysis
  return (
    <div className="space-y-4">
      {/* Header with recalculate button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Resume Score Analysis</h3>
        <Button
          onClick={handleRecalculate}
          disabled={isCalculating}
          variant="outline"
          size="sm"
        >
          <RefreshCw 
            className={cn(
              "mr-2 h-3 w-3",
              isCalculating && "animate-spin"
            )} 
          />
          Recalculate
        </Button>
      </div>

      {/* Overall Score Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex-shrink-0">
              <CircularProgressbar
                value={scoreData.overallScore.score}
                text={`${scoreData.overallScore.score}%`}
                styles={buildStyles({
                  pathColor: scoreData.overallScore.score >= 70 ? '#10b981' : scoreData.overallScore.score >= 50 ? '#f59e0b' : '#ef4444',
                  textColor: '#374151',
                  trailColor: '#e5e7eb',
                  pathTransitionDuration: 1,
                  textSize: '24px'
                })}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium mb-1">Overall Score</h4>
              <p className="text-sm text-muted-foreground">{scoreData.overallScore.reason}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Improvements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Key Improvements
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {keyImprovements.slice(0, 5).map((improvement, index) => (
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

      {/* Job-Specific Improvements for Tailored Resumes */}
      {scoreData.isTailoredResume && scoreData.jobSpecificImprovements && scoreData.jobSpecificImprovements.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-blue-700">
              <Award className="h-4 w-4" />
              Job-Specific Improvements
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {scoreData.jobSpecificImprovements.slice(0, 5).map((improvement, index) => (
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

      {/* Detailed Metrics */}
      {Object.entries({
        Completeness: { icon: Award, metrics: scoreData.completeness },
        "Impact Score": { icon: TrendingUp, metrics: scoreData.impactScore },
        "Role Match": { icon: Target, metrics: scoreData.roleMatch }
      }).map(([title, { icon: Icon, metrics }]) => (
        <Card key={title}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {Object.entries(metrics).map(([label, data]) => (
                <ScoreItem key={label} label={label} {...data} />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ScoreItem({ label, score, reason }: { label: string; score: number; reason: string }) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{camelCaseToReadable(label)}</span>
        <span className={cn(
          "text-xs px-2 py-1 rounded-full font-medium",
          score >= 70 ? "bg-green-100 text-green-700" : 
          score >= 50 ? "bg-yellow-100 text-yellow-700" : 
          "bg-red-100 text-red-700"
        )}>
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
  data 
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
  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-blue-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-blue-700">{camelCaseToReadable(label)}</span>
        <span className={cn(
          "text-xs px-2 py-1 rounded-full font-medium",
          data.score >= 70 ? "bg-blue-100 text-blue-700" : 
          data.score >= 50 ? "bg-yellow-100 text-yellow-700" : 
          "bg-red-100 text-red-700"
        )}>
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
      
      {/* Show matched keywords */}
      {data.matchedKeywords && data.matchedKeywords.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-green-600">Matched Keywords:</p>
          <div className="flex flex-wrap gap-1">
            {data.matchedKeywords.slice(0, 5).map((keyword, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Show missing keywords */}
      {data.missingKeywords && data.missingKeywords.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-red-600">Missing Keywords:</p>
          <div className="flex flex-wrap gap-1">
            {data.missingKeywords.slice(0, 5).map((keyword, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Show gap analysis */}
      {data.gapAnalysis && data.gapAnalysis.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-orange-600">Areas to Address:</p>
          <div className="space-y-1">
            {data.gapAnalysis.slice(0, 3).map((gap, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                <div className="mt-1.5 h-1 w-1 rounded-full bg-orange-500 flex-shrink-0" />
                <p className="text-orange-600">{gap}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
