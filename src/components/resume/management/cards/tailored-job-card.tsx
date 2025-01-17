'use client';

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Building2, MapPin, Clock, DollarSign, Briefcase, Trash2, Loader2, Plus, Sparkles, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Job } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { createJob, deleteJob } from "@/utils/actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatJobListing } from "@/utils/ai";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface TailoredJobCardProps {
  jobId: string | null;
  onJobCreate?: (jobId: string) => void;
  onJobDelete?: () => void;
  job?: Job | null;
  isLoading?: boolean;
}

export function TailoredJobCard({ 
  jobId, 
  onJobCreate, 
  onJobDelete,
  job: externalJob,
  isLoading: externalIsLoading 
}: TailoredJobCardProps) {
  const router = useRouter();

  // Only use internal state if external job is not provided
  const [internalJob, setInternalJob] = useState<Job | null>(null);
  const [internalIsLoading, setInternalIsLoading] = useState(true);
  
  const effectiveJob = externalJob ?? internalJob;
  const effectiveIsLoading = externalIsLoading ?? internalIsLoading;

  // Only fetch if external job is not provided
  useEffect(() => {
    if (externalJob !== undefined) return;

    async function fetchJob() {
      if (!jobId) {
        setInternalJob(null);
        setInternalIsLoading(false);
        return;
      }

      try {
        setInternalIsLoading(true);
        const supabase = createClient();
        const { data: jobData, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') {
            throw error;
          }
          setInternalJob(null);
          return;
        }
        
        setInternalJob(jobData);
      } catch (error) {
        console.error('Error fetching job:', error);
        if (error instanceof Error && error.message !== 'No rows returned') {
          setInternalJob(null);
        }
      } finally {
        setInternalIsLoading(false);
      }
    }

    fetchJob();
  }, [jobId, externalJob]);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [isFormatting, setIsFormatting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    jobDescription?: string;
  }>({});

  const formatWorkLocation = (workLocation: Job['work_location']) => {
    if (!workLocation) return 'Not specified';
    return workLocation.replace('_', ' ');
  };

  const handleDelete = async () => {
    if (!jobId) return;
    
    try {
      setIsDeleting(true);
      await deleteJob(jobId);
      
      onJobDelete?.();
      
      router.refresh();
      
      const supabase = createClient();
      const { data: jobData, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          throw error;
        }
        setInternalJob(null);
        return;
      }
      
      setInternalJob(jobData);
    } catch (error) {
      console.error('Error deleting job:', error);
      if (error instanceof Error && error.message !== 'No rows returned') {
        setInternalJob(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const validateJobDescription = (value: string) => {
    const errors: { jobDescription?: string } = {};
    if (!value.trim()) {
      errors.jobDescription = "Job description is required";
    } else if (value.trim().length < 50) {
      errors.jobDescription = "Job description should be at least 50 characters";
    }
    return errors;
  };

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJobDescription(value);
    setValidationErrors(validateJobDescription(value));
  };

  const handleCreateJobWithAI = async () => {
    const errors = validateJobDescription(jobDescription);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: errors.jobDescription,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsFormatting(true);

      // Get model and API key from local storage
      const MODEL_STORAGE_KEY = 'resumelm-default-model';
      const LOCAL_STORAGE_KEY = 'resumelm-api-keys';

      const selectedModel = localStorage.getItem(MODEL_STORAGE_KEY);
      const storedKeys = localStorage.getItem(LOCAL_STORAGE_KEY);
      let apiKeys = [];

      try {
        apiKeys = storedKeys ? JSON.parse(storedKeys) : [];
      } catch (error) {
        console.error('Error parsing API keys:', error);
      }

      // Format job listing using AI
      const formattedJob = await formatJobListing(jobDescription, {
        model: selectedModel || '',
        apiKeys
      });

      setIsFormatting(false);
      setIsCreating(true);

      // Create job in database
      const newJob = await createJob(formattedJob);
      
      // Close dialog and refresh
      setCreateDialogOpen(false);
      router.refresh();
      onJobCreate?.(newJob.id);

    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create job",
        variant: "destructive",
      });
    } finally {
      setIsFormatting(false);
      setIsCreating(false);
      setJobDescription('');
    }
  };

  // Enhanced loading skeleton with proper ARIA and animations
  const LoadingSkeleton = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
      role="status"
      aria-label="Loading job details"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-3 w-3/4">
          <div className="h-6 bg-gradient-to-r from-pink-200/50 via-rose-200/50 to-pink-200/50 rounded-xl animate-pulse" />
          <div className="h-4 bg-gradient-to-r from-pink-100/50 via-rose-100/50 to-pink-100/50 rounded-lg w-2/3 animate-pulse" />
        </div>
        <div className="h-8 w-8 bg-gradient-to-r from-pink-200/50 via-rose-200/50 to-pink-200/50 rounded-xl animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-gradient-to-r from-pink-200/50 via-rose-200/50 to-pink-200/50 animate-pulse" />
            <div className="h-4 flex-1 bg-gradient-to-r from-pink-100/50 via-rose-100/50 to-pink-100/50 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 w-20 bg-gradient-to-r from-pink-100/50 via-rose-100/50 to-pink-100/50 rounded-full animate-pulse" />
        ))}
      </div>
    </motion.div>
  );

  // Enhanced error state with proper ARIA and animations
  const ErrorState = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 space-y-4"
      role="alert"
      aria-live="polite"
    >
      <div className="p-3 rounded-xl bg-red-50/80 backdrop-blur-sm border border-red-100">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-red-900">Unable to Load Job</h3>
        <p className="text-sm text-red-600/90">
          This job listing is no longer available or there was an error loading it.
        </p>
        <Button 
          variant="outline" 
          onClick={() => router.refresh()}
          className="mt-4 bg-white/80 border-red-200 hover:bg-red-50/80 hover:border-red-300 text-red-700"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 0.5 }}
          >
            Try Again
          </motion.div>
        </Button>
      </div>
    </motion.div>
  );

  if (!jobId) {
    return (
      <Card className="relative group">
        {/* Animated background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-rose-50/50 rounded-xl transition-opacity duration-500 group-hover:opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,192,203,0.1),transparent_70%)] rounded-xl" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-400/10 via-rose-400/10 to-red-400/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-rose-400/10 via-pink-400/10 to-red-400/10 blur-3xl rounded-full -translate-x-1/3 translate-y-1/3" />

        <div className="relative p-8 flex flex-col items-center justify-center space-y-6 text-center">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500/5 to-rose-500/5 border border-pink-200/20 group-hover:scale-110 transition-transform duration-500">
            <Plus className="w-8 h-8 text-pink-500" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              No Job Currently Linked
            </h3>
            <p className="text-sm text-gray-500/90 max-w-sm">
              Create a new job listing to track the position you&apos;re applying for and tailor your resume accordingly.
            </p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className={cn(
                  "relative overflow-hidden",
                  "bg-gradient-to-r from-pink-500 to-rose-500",
                  "text-white font-medium",
                  "border border-pink-400/20",
                  "shadow-lg shadow-pink-500/10",
                  "hover:shadow-xl hover:shadow-pink-500/20",
                  "hover:scale-105",
                  "transition-all duration-500"
                )}
                aria-label="Create new job listing"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Job Listing
              </Button>
            </DialogTrigger>

            <DialogContent 
              className={cn(
                "sm:max-w-[600px]",
                "bg-gradient-to-b from-white/95 to-white/90",
                "backdrop-blur-xl",
                "border-pink-200/40",
                "shadow-xl shadow-pink-500/10"
              )}
            >
              <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                Create New Job Listing
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Paste the job description below and let our AI format it automatically.
              </DialogDescription>

              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={handleJobDescriptionChange}
                    className={cn(
                      "min-h-[200px]",
                      "bg-white/80 backdrop-blur-sm",
                      "border transition-all duration-300",
                      "placeholder:text-gray-400",
                      validationErrors.jobDescription 
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
                        : "border-gray-200 focus:border-pink-500 focus:ring-pink-500/20"
                    )}
                    aria-invalid={!!validationErrors.jobDescription}
                    aria-describedby="job-description-error"
                  />
                  {validationErrors.jobDescription && (
                    <Alert variant="destructive" className="mt-2" role="alert">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription id="job-description-error">
                        {validationErrors.jobDescription}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <DialogFooter className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    className={cn(
                      "border-gray-200",
                      "hover:bg-gray-50",
                      "transition-colors duration-300"
                    )}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateJobWithAI}
                    disabled={isFormatting || isCreating || !!validationErrors.jobDescription}
                    className={cn(
                      "relative overflow-hidden",
                      "bg-gradient-to-r from-pink-500 to-rose-500",
                      "hover:from-pink-600 hover:to-rose-600",
                      "text-white font-medium",
                      "shadow-lg hover:shadow-xl",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "disabled:hover:from-pink-500 disabled:hover:to-rose-500",
                      "transition-all duration-300"
                    )}
                    aria-busy={isFormatting || isCreating}
                  >
                    {isFormatting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Formatting...
                      </>
                    ) : isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create with AI
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "relative group",
      "bg-gradient-to-br from-pink-50/50 to-rose-50/50",
      "hover:from-pink-50/60 hover:to-rose-50/60",
      "border-2 border-pink-200/40",
      "hover:border-pink-200/60",
      "rounded-xl",
      "overflow-hidden",
      "transition-all duration-500 ease-out",
      "hover:shadow-lg hover:shadow-pink-500/10"
    )}>
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-rose-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,192,203,0.1),transparent_70%)]" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-400/10 via-rose-400/10 to-red-400/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-rose-400/10 via-pink-400/10 to-red-400/10 blur-3xl rounded-full -translate-x-1/3 translate-y-1/3" />
      
      <div className="relative">
        <AnimatePresence mode="wait">
          {effectiveIsLoading ? (
            <LoadingSkeleton />
          ) : effectiveJob ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
           
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details" className="border-none">
                  <div className="flex items-center px-3 py-2">
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
                          <span className="font-medium truncate text-sm text-gray-600 group-hover:text-pink-700 transition-colors duration-300">
                            {effectiveJob.company_name}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold bg-gradient-to-r from-pink-700 to-rose-700 bg-clip-text text-transparent truncate mt-0.5">
                          {effectiveJob.position_title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className={cn(
                            "h-6 w-6",
                            "text-gray-400",
                            "hover:text-red-500",
                            "hover:bg-red-50/50",
                            "transition-all duration-300",
                            "rounded-lg"
                          )}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                        <AccordionTrigger 
                          className={cn(
                            "p-0 hover:no-underline",
                            "group/accordion"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <AccordionContent>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6 px-4 pb-4"
                    >
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        {[
                          { icon: MapPin, text: effectiveJob.location || 'Location not specified', color: 'pink' },
                          { icon: Briefcase, text: formatWorkLocation(effectiveJob.work_location), color: 'rose' },
                          { icon: DollarSign, text: typeof effectiveJob.salary_range === 'string' ? effectiveJob.salary_range : 
                            effectiveJob.salary_range ? `${effectiveJob.salary_range.currency}${effectiveJob.salary_range.min}-${effectiveJob.salary_range.max}` : 
                            'Salary not specified', 
                            color: 'pink' 
                          },
                          { icon: Clock, text: effectiveJob.employment_type?.replace('_', ' ') || 'Employment type not specified', color: 'rose' }
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                            className={cn(
                              "flex items-center gap-2",
                              "text-sm text-gray-600",
                              `group-hover:text-${item.color}-600`,
                              "transition-colors duration-300"
                            )}
                          >
                            <item.icon className="w-4 h-4" />
                            <span className="capitalize truncate">{item.text}</span>
                          </motion.div>
                        ))}
                      </div>

                      {effectiveJob.description && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">Description</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            {effectiveJob.description}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {effectiveJob.keywords?.map((keyword, index) => (
                          <motion.div
                            key={keyword}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "text-xs py-0.5",
                                "bg-gradient-to-r from-pink-50/50 to-rose-50/50",
                                "hover:from-pink-100/50 hover:to-rose-100/50",
                                "text-pink-700",
                                "border border-pink-100/20",
                                "transition-all duration-300",
                                "cursor-default"
                              )}
                            >
                              {keyword}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          ) : (
            <ErrorState />
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
} 