'use client';

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Building2, MapPin, Clock, DollarSign, Trash2} from "lucide-react";
import { getJobListings, deleteJob } from "@/utils/actions/jobs/actions";
import { createClient } from "@/utils/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";


type WorkLocationType = 'remote' | 'in_person' | 'hybrid';
type EmploymentType = 'full_time' | 'part_time' | 'co_op' | 'internship';

interface Job {
  id: string;
  company_name: string;
  position_title: string;
  location: string | null;
  work_location: WorkLocationType | null;
  employment_type: EmploymentType | null;
  salary_range: string | null;
  created_at: string;
  keywords: string[] | null;
}

export function JobListingsCard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [workLocation, setWorkLocation] = useState<WorkLocationType | undefined>();
  const [employmentType, setEmploymentType] = useState<EmploymentType | undefined>();

  // Fetch admin status
  useEffect(() => {
    async function checkAdminStatus() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', user.id)
          .single();
        
        setIsAdmin(profile?.is_admin ?? false);
      }
    }
    
    checkAdminStatus();
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getJobListings({
        page: currentPage,
        pageSize: 6,
        filters: {
          workLocation,
          employmentType
        }
      });
      setJobs(result.jobs);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, workLocation, employmentType]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);



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

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteJob(jobId);
      // Refetch jobs after deletion
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  return (
    <div className="relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-teal-50/20 to-rose-50/30 rounded-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff20_1px,transparent_1px),linear-gradient(to_bottom,#ffffff20_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      <Card className="relative p-8 bg-white/60 backdrop-blur-2xl border-white/40 shadow-2xl rounded-3xl overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-teal-400/10 via-purple-400/10 to-pink-400/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-rose-400/10 via-violet-400/10 to-cyan-400/10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex flex-col space-y-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold bg-gradient-to-r from-teal-600 via-purple-600 to-rose-600 bg-clip-text text-transparent"
            >
              Job Listings
            </motion.h2>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="relative group">
                <Select
                  value={workLocation}
                  onValueChange={(value: WorkLocationType) => setWorkLocation(value)}
                >
                  <SelectTrigger className="w-full sm:w-[180px] bg-white/80 backdrop-blur-xl border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-teal-200">
                    <MapPin className="w-4 h-4 mr-2 text-teal-500" />
                    <SelectValue placeholder="Work Location" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/90 backdrop-blur-xl border-white/40">
                    <SelectItem value="remote">🌍 Remote</SelectItem>
                    <SelectItem value="in_person">🏢 In Person</SelectItem>
                    <SelectItem value="hybrid">🔄 Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-teal-500/20 to-purple-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="relative group">
                <Select
                  value={employmentType}
                  onValueChange={(value: EmploymentType) => setEmploymentType(value)}
                >
                  <SelectTrigger className="w-full sm:w-[180px] bg-white/80 backdrop-blur-xl border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-purple-200">
                    <Briefcase className="w-4 h-4 mr-2 text-purple-500" />
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/90 backdrop-blur-xl border-white/40">
                    <SelectItem value="full_time">⭐ Full Time</SelectItem>
                    <SelectItem value="part_time">⌛ Part Time</SelectItem>
                    <SelectItem value="co_op">🤝 Co-op</SelectItem>
                    <SelectItem value="internship">🎓 Internship</SelectItem>
                  </SelectContent>
                </Select>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-500/20 to-rose-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="p-6 space-y-4 animate-pulse bg-white/40 border-white/20 rounded-2xl">
                    <div className="h-6 bg-gradient-to-r from-gray-200/50 to-gray-100/50 rounded-full w-3/4" />
                    <div className="h-4 bg-gradient-to-r from-gray-200/50 to-gray-100/50 rounded-full w-1/2" />
                    <div className="h-4 bg-gradient-to-r from-gray-200/50 to-gray-100/50 rounded-full w-2/3" />
                  </Card>
                </motion.div>
              ))
            ) : jobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="group relative p-6 space-y-5 hover:shadow-2xl transition-all duration-500 ease-out bg-gradient-to-br from-white/80 to-white/60 hover:from-white/90 hover:to-white/70 border-white/40 hover:border-white/60 rounded-2xl overflow-hidden hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-purple-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="flex justify-between items-start">
                    <div className="space-y-2.5">
                      <h3 className="font-semibold text-lg line-clamp-1 text-gray-800 group-hover:text-teal-700 transition-colors duration-300">
                        {job.position_title}
                      </h3>
                      <div className="flex items-center text-gray-600">
                        <Building2 className="w-4 h-4 mr-2 text-purple-500" />
                        <span className="line-clamp-1 group-hover:text-purple-700 transition-colors duration-300">
                          {job.company_name}
                        </span>
                      </div>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50/50 transition-all duration-300"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2 group-hover:text-teal-600 transition-colors duration-300">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2 group-hover:text-purple-600 transition-colors duration-300">
                      <Briefcase className="w-4 h-4" />
                      <span className="capitalize">{formatWorkLocation(job.work_location)}</span>
                    </div>
                    <div className="flex items-center gap-2 group-hover:text-rose-600 transition-colors duration-300">
                      <DollarSign className="w-4 h-4" />
                      <span>{job.salary_range}</span>
                    </div>
                    <div className="flex items-center gap-2 group-hover:text-teal-600 transition-colors duration-300">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(job.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {job.keywords?.slice(0, 3).map((keyword, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs bg-gradient-to-r from-teal-50/50 to-purple-50/50 text-teal-700 hover:from-teal-100/50 hover:to-purple-100/50 transition-all duration-300 border border-teal-100/20"
                      >
                        {keyword}
                      </Badge>
                    ))}
                    {job.keywords && job.keywords.length > 3 && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs bg-gradient-to-r from-purple-50/50 to-rose-50/50 text-purple-700 hover:from-purple-100/50 hover:to-rose-100/50 transition-all duration-300 border border-purple-100/20"
                      >
                        +{job.keywords.length - 3} more
                      </Badge>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center gap-4 mt-6"
          >
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
              className="bg-white/70 border-white/40 hover:bg-white/80 hover:border-teal-200 transition-all duration-300 disabled:opacity-50 px-6"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="bg-white/70 border-white/40 hover:bg-white/80 hover:border-purple-200 transition-all duration-300 disabled:opacity-50 px-6"
            >
              Next
            </Button>
          </motion.div>
        </div>
      </Card>
    </div>
  );
} 