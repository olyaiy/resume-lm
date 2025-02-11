"use client";

import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { generateResumeScore } from "@/utils/actions/resumes/actions";
import { Resume } from "@/lib/types";
import { ApiKey } from "@/utils/ai-tools";

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

  miscellaneous: {
    [key: string]: {
      score: number;
      reason: string;
    };
  };

  overallImprovements: string[];
}

// Add props interface
interface ResumeScorePanelProps {
  resume: Resume;
}

const LOCAL_STORAGE_KEY = 'resumelm-resume-scores';
const MAX_SCORES = 10;

function getStoredScores(resumeId: string): ResumeScoreMetrics | null {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return null;
    
    const scores = new Map(JSON.parse(stored));
    return scores.get(resumeId) as ResumeScoreMetrics | null;
  } catch (error) {
    console.error('Error reading stored scores:', error);
    return null;
  }
}

function updateStoredScores(resumeId: string, score: ResumeScoreMetrics) {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const scores = stored ? new Map(JSON.parse(stored)) : new Map();

    // Maintain only MAX_SCORES entries
    if (scores.size >= MAX_SCORES) {
      const oldestKey = scores.keys().next().value;
      scores.delete(oldestKey);
    }

    scores.set(resumeId, score);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(scores)));
  } catch (error) {
    console.error('Error storing score:', error);
  }
}

export default function ResumeScorePanel({ resume }: ResumeScorePanelProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [scoreData, setScoreData] = useState<ResumeScoreMetrics | null>(() => {
    // Initialize with stored score if available
    return getStoredScores(resume.id);
  });

  // Add useEffect for initial load
  useEffect(() => {
    const storedScore = getStoredScores(resume.id);
    if (storedScore) {
      setScoreData(storedScore);
    }
  }, [resume.id]);

  const handleRecalculate = async () => {
    setIsCalculating(true);
    try {
        const MODEL_STORAGE_KEY = 'resumelm-default-model';
        // const LOCAL_STORAGE_KEY = 'resumelm-api-keys';
  
        const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
        // const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
        const apiKeys: string[] = [];
        
      // Call the generateResumeScore action with current resume
      const newScore = await generateResumeScore({
        ...resume,
        section_configs: undefined,
        section_order: undefined
      }, {
        model: selectedModel || '',
        apiKeys: apiKeys as unknown as ApiKey[]
      });

      // Update state and storage
      setScoreData(newScore as ResumeScoreMetrics);
      updateStoredScores(resume.id, newScore as ResumeScoreMetrics);
    } catch (error) {
      console.error("Error generating score:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  // If no score data is available, show the empty state
  if (!scoreData) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 p-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl border-white/40">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-cyan-500/10" />
          <div className="relative p-8 flex flex-col items-center gap-6 text-center">
            <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Resume Score Analysis
            </h1>
            <p className="text-muted-foreground text-lg">
              No score analysis available yet. Generate one to see how your resume measures up!
            </p>
            <Button
              onClick={handleRecalculate}
              disabled={isCalculating}
              size="lg"
              className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:opacity-90"
            >
              <RefreshCw 
                className={cn(
                  "mr-2 h-4 w-4",
                  isCalculating && "animate-spin"
                )} 
              />
              {isCalculating ? "Analyzing Resume..." : "Generate Score Analysis"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // When we have score data, show the full analysis
  return (
    <div className="max-w-3xl mx-auto space-y-4 p-6">
      <div className="flex justify-end">
        <Button
          onClick={handleRecalculate}
          disabled={isCalculating}
          variant="outline"
          className="bg-white/50 hover:bg-white/60 border-white/40"
        >
          <RefreshCw 
            className={cn(
              "mr-2 h-4 w-4",
              isCalculating && "animate-spin"
            )} 
          />
          Recalculate Score
        </Button>
      </div>

      {/* Main Score Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl border-white/40">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-cyan-500/10" />
        <div className="relative p-8 flex flex-col sm:flex-row items-center gap-8">
          <div className="w-40 h-40 sm:w-32 sm:h-32">
            <CircularProgressbar
              value={scoreData.overallScore.score}
              text={`${scoreData.overallScore.score}%`}
              styles={buildStyles({
                pathColor: `rgba(20, 184, 166, ${scoreData.overallScore.score / 100})`,
                textColor: '#0F766E',
                trailColor: '#E2E8F0',
                pathTransitionDuration: 1
              })}
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Resume Score Analysis
            </h1>
            <p className="text-muted-foreground text-lg">{scoreData.overallScore.reason}</p>
          </div>
        </div>
      </Card>

      {/* Key Improvements Card */}
      <Card className="bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl border-white/40 p-6">
        <h2 className="text-xl font-semibold mb-4 text-teal-700">Key Improvements</h2>
        <div className="space-y-3">
          {scoreData.overallImprovements.map((improvement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="mt-1.5 h-2 w-2 rounded-full bg-teal-500" />
              <p className="text-muted-foreground">{improvement}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Metrics Cards */}
      {Object.entries({
        Completeness: scoreData.completeness,
        "Impact Score": scoreData.impactScore,
        "Role Match": scoreData.roleMatch
      }).map(([title, metrics]) => (
        <MetricsCard key={title} title={title} metrics={metrics} />
      ))}
    </div>
  );
}

function MetricsCard({ title, metrics }: { title: string; metrics: Record<string, { score: number; reason: string }> }) {
  return (
    <Card className="bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-xl border-white/40 p-6">
      <h2 className="text-xl font-semibold mb-6 text-teal-700">{title}</h2>
      <div className="grid gap-8">
        {Object.entries(metrics).map(([label, data]) => (
          <ScoreItem key={label} label={label} {...data} />
        ))}
      </div>
    </Card>
  );
}

function ScoreItem({ label, score, reason }: { label: string; score: number; reason: string }) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-emerald-500";
    if (score >= 70) return "bg-teal-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={cn(
          "text-sm font-semibold px-2 py-1 rounded-full",
          score >= 70 ? "bg-teal-100 text-teal-700" : "bg-yellow-100 text-yellow-700"
        )}>
          {score}/100
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", getScoreColor(score))}
        />
      </div>
      <p className="text-sm text-muted-foreground">{reason}</p>
    </motion.div>
  );
}