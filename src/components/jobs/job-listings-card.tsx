'use client';

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Building2, MapPin, Clock, DollarSign, Trash2 } from "lucide-react";
import { getJobListings, deleteJob } from "@/utils/actions";
import { createClient } from "@/utils/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";


type WorkLocationType = 'remote' | 'in_person' | 'hybrid';
type EmploymentType = 'full_time' | 'part_time' | 'co_op' | 'internship';

interface Job {
  id: string;
  company_name: string;
  position_title: string;
  location: string | null;
  work_location: WorkLocationType | null;
  employment_type: EmploymentType | null;
  salary_range: { min: number; max: number; currency: string } | null;
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

  const formatSalary = (salaryRange: Job['salary_range']) => {
    if (!salaryRange) return 'Salary not specified';
    const { min, max, currency = 'USD' } = salaryRange;
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  };

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

  const formatEmploymentType = (employmentType: Job['employment_type']) => {
    if (!employmentType) return 'Not specified';
    return employmentType.replace('_', ' ');
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
    <Card className="p-8 bg-gradient-to-br from-white/80 via-white/70 to-white/60 backdrop-blur-xl border-white/40 shadow-2xl">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h2 className="text-3xl font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Job Listings
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              value={workLocation}
              onValueChange={(value: WorkLocationType) => setWorkLocation(value)}
            >
              <SelectTrigger className="w-full sm:w-[140px] bg-white/50 backdrop-blur-sm border-white/40">
                <SelectValue placeholder="Work Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="in_person">In Person</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={employmentType}
              onValueChange={(value: EmploymentType) => setEmploymentType(value)}
            >
              <SelectTrigger className="w-full sm:w-[140px] bg-white/50 backdrop-blur-sm border-white/40">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_time">Full Time</SelectItem>
                <SelectItem value="part_time">Part Time</SelectItem>
                <SelectItem value="co_op">Co-op</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="p-6 space-y-4 animate-pulse bg-white/40 border-white/20">
                <div className="h-6 bg-gray-200/50 rounded-full w-3/4"></div>
                <div className="h-4 bg-gray-200/50 rounded-full w-1/2"></div>
                <div className="h-4 bg-gray-200/50 rounded-full w-2/3"></div>
              </Card>
            ))
          ) : jobs.map((job) => (
            <Card 
              key={job.id} 
              className="group p-6 space-y-5 hover:shadow-xl transition-all duration-500 ease-in-out bg-gradient-to-br from-white/60 to-white/40 hover:from-white/70 hover:to-white/50 border-white/30 hover:border-white/40 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2.5">
                  <h3 className="font-semibold text-lg line-clamp-1 text-gray-800">{job.position_title}</h3>
                  <div className="flex items-center text-gray-600">
                    <Building2 className="w-4 h-4 mr-2" />
                    <span className="line-clamp-1">{job.company_name}</span>
                  </div>
                </div>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50/50 transition-colors duration-300"
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
                <div className="flex items-center gap-2 group-hover:text-teal-600 transition-colors duration-300">
                  <Briefcase className="w-4 h-4" />
                  <span className="capitalize">{formatWorkLocation(job.work_location)}</span>
                </div>
                <div className="flex items-center gap-2 group-hover:text-teal-600 transition-colors duration-300">
                  <DollarSign className="w-4 h-4" />
                  <span>{formatSalary(job.salary_range)}</span>
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
                    className="text-xs bg-teal-50/50 text-teal-700 hover:bg-teal-100/50 transition-colors duration-300"
                  >
                    {keyword}
                  </Badge>
                ))}
                {job.keywords && job.keywords.length > 3 && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-purple-50/50 text-purple-700 hover:bg-purple-100/50 transition-colors duration-300"
                  >
                    +{job.keywords.length - 3} more
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-center gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
            className="bg-white/50 border-white/40 hover:bg-white/60 transition-colors duration-300"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || isLoading}
            className="bg-white/50 border-white/40 hover:bg-white/60 transition-colors duration-300"
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
} 