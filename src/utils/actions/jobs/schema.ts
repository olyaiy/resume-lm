export interface JobListingParams {
    page: number;
    pageSize: number;
    filters?: {
      workLocation?: 'remote' | 'in_person' | 'hybrid';
      employmentType?: 'full_time' | 'part_time' | 'co_op' | 'internship';
      keywords?: string[];
    };
  }
  