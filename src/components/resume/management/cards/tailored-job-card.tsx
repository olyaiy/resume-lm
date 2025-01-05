'use client';

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Building2, MapPin, Clock, DollarSign, Briefcase, Trash2, Loader2, Plus, Sparkles, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Job } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { createJob, deleteJob } from "@/utils/actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatJobListing } from "@/utils/ai";
import { toast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TailoredJobCardProps {
  jobId: string | null;
  onJobCreate?: (jobId: string) => void;
  onJobDelete?: () => void;
}

export function TailoredJobCard({ jobId, onJobCreate, onJobDelete }: TailoredJobCardProps) {
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [isFormatting, setIsFormatting] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      if (!jobId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
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
          setJob(null);
          return;
        }
        
        setJob(jobData);
      } catch (error) {
        console.error('Error fetching job:', error);
        if (error instanceof Error && error.message !== 'No rows returned') {
          setJob(null);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchJob();
  }, [jobId]);


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

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
        setJob(null);
        return;
      }
      
      setJob(jobData);
    } catch (error) {
      console.error('Error deleting job:', error);
      if (error instanceof Error && error.message !== 'No rows returned') {
        setJob(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateJobWithAI = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter a job description",
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

      // Create job in database
      setIsCreating(true);
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

  if (!jobId) {
    return (
      <Card className="relative p-6 bg-gradient-to-br from-pink-50/50 to-rose-50/50 border-pink-200/40 rounded-2xl overflow-hidden">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <h3 className="text-lg font-semibold text-gray-800">
            No job currently linked to this resume
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Create a new job listing to track the position you&apos;re applying for.
          </p>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Job Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-xl border-pink-200/40">
              <DialogTitle className="text-xl font-semibold text-pink-950">
                Create New Job Listing
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Paste the job description below. Our AI will format it automatically.
              </DialogDescription>

              <div className="space-y-4 mt-4">
                <Textarea
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[200px] bg-white/80 border-gray-200 focus:border-pink-500 focus:ring-pink-500/20"
                />

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateJobWithAI}
                    disabled={isFormatting || isCreating}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 transition-all duration-300"
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
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative p-4 bg-gradient-to-br from-pink-50/50 to-rose-50/50 hover:from-pink-50/60 hover:to-rose-50/60 border-pink-200/40 hover:border-pink-200/60 rounded-2xl overflow-hidden transition-all duration-500 ease-out group">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-rose-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="h-6 bg-gradient-to-r from-pink-200/50 to-rose-100/50 rounded-full w-3/4 animate-pulse" />
          <div className="h-4 bg-gradient-to-r from-pink-200/50 to-rose-100/50 rounded-full w-1/2 animate-pulse" />
          <div className="h-4 bg-gradient-to-r from-pink-200/50 to-rose-100/50 rounded-full w-2/3 animate-pulse" />
        </motion.div>
      ) : job ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-gray-800 group-hover:text-pink-700 transition-colors duration-300">
                {job.position_title}
              </h3>
              <div className="flex items-center text-gray-600">
                <Building2 className="w-3.5 h-3.5 mr-1.5 text-pink-500" />
                <span className="group-hover:text-pink-700 transition-colors duration-300">
                  {job.company_name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className="text-xs bg-gradient-to-r from-pink-50/80 to-rose-50/80 text-pink-700 border-pink-100/40"
              >
                {formatDate(job.created_at)}
              </Badge>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50/50 transition-all duration-300"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-600 mb-3">
            <div className="flex items-center gap-1.5 group-hover:text-pink-600 transition-colors duration-300">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{job.location || 'Location not specified'}</span>
            </div>
            <div className="flex items-center gap-1.5 group-hover:text-rose-600 transition-colors duration-300">
              <Briefcase className="w-3.5 h-3.5" />
              <span className="capitalize truncate">{formatWorkLocation(job.work_location)}</span>
            </div>
            <div className="flex items-center gap-1.5 group-hover:text-pink-600 transition-colors duration-300">
              <DollarSign className="w-3.5 h-3.5" />
              {/* <span className="">{job.salary_range}</span> */}
            </div>
            {job.employment_type && (
              <div className="flex items-center gap-1.5 group-hover:text-rose-600 transition-colors duration-300">
                <Clock className="w-3.5 h-3.5" />
                <span className="capitalize truncate">{job.employment_type.replace('_', ' ')}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {job.description && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="details" className="border-none">
                  <AccordionTrigger className="flex items-center justify-between py-2 hover:no-underline">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 line-clamp-2 text-left group-hover:text-pink-600/80 transition-colors duration-300">
                        {job.description}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 text-pink-500 transition-transform duration-200" />
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-2 pb-4 space-y-4">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {job.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {job.keywords?.map((keyword, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="text-xs py-0.5 bg-gradient-to-r from-pink-50/50 to-rose-50/50 text-pink-700 hover:from-pink-100/50 hover:to-rose-100/50 transition-all duration-300 border border-pink-100/20"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            
            <div className="flex flex-wrap gap-1.5">
              {job.keywords?.slice(0, 5).map((keyword, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs py-0.5 bg-gradient-to-r from-pink-50/50 to-rose-50/50 text-pink-700 hover:from-pink-100/50 hover:to-rose-100/50 transition-all duration-300 border border-pink-100/20"
                >
                  {keyword}
                </Badge>
              ))}
              {job.keywords && job.keywords.length > 5 && (
                <Badge 
                  variant="secondary" 
                  className="text-xs py-0.5 bg-gradient-to-r from-rose-50/50 to-red-50/50 text-rose-700 hover:from-rose-100/50 hover:to-red-100/50 transition-all duration-300 border border-rose-100/20"
                >
                  +{job.keywords.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="text-center text-gray-500 py-4">
          This job listing is no longer available
        </div>
      )}
    </Card>
  );
} 