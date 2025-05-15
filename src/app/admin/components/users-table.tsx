'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { getUsersWithProfilesAndSubscriptions } from '../actions';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { SortDescriptor } from '@/lib/types';

interface UserData {
  user: {
    id: string;
    email?: string;
    created_at: string;
    last_sign_in_at?: string;
    [key: string]: unknown;
  };
  profile: {
    user_id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    location?: string;
    website?: string;
    linkedin_url?: string;
    github_url?: string;
    work_experience?: Array<{
      company?: string;
      title?: string;
      start_date?: string;
      end_date?: string;
      description?: string;
      location?: string;
      [key: string]: unknown;
    }>;
    education?: Array<{
      institution?: string;
      degree?: string;
      field_of_study?: string;
      start_date?: string;
      end_date?: string;
      description?: string;
      [key: string]: unknown;
    }>;
    skills?: Array<{
      category?: string;
      items?: string[];
      [key: string]: unknown;
    }>;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
  } | null;
  subscription: {
    user_id?: string;
    stripe_customer_id?: string;
    subscription_plan?: string;
    subscription_status?: string;
    current_period_end?: string;
    [key: string]: unknown;
  } | null;
  resume_count: number;
}

type SortableColumns =
  | 'email'
  | 'created_at'
  | 'last_sign_in_at'
  | 'name'
  | 'subscription_plan'
  | 'location'
  | 'work_experience_count'
  | 'education_count'
  | 'skills_count'
  | 'subscription_status'
  | 'current_period_end'
  | 'resume_count'; // Added resume_count

export default function UsersTable() {
  const router = useRouter(); // Initialize router
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor<SortableColumns>>({
    column: 'created_at',
    direction: 'descending',
  });

  // Dynamically get unique plans and statuses for filter dropdowns (Moved before conditional returns)
  const uniquePlans = useMemo(() => {
    const plans = new Set(users.map(u => u.subscription?.subscription_plan || 'none'));
    return ['all', ...Array.from(plans)];
  }, [users]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(users.map(u => u.subscription?.subscription_status || 'none'));
    return ['all', ...Array.from(statuses)];
  }, [users]);
  
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const data = await getUsersWithProfilesAndSubscriptions();
        setUsers(data as unknown as UserData[]);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  function formatDate(dateString?: string) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  
    const handleSort = (column: SortableColumns) => {
      setSortDescriptor((prev) => ({
        column,
        direction:
          prev.column === column && prev.direction === 'ascending'
            ? 'descending'
            : 'ascending',
      }));
    };
  
    const filteredUsers = useMemo(() => {
      return users.filter((item) => {
        // Subscription Plan Filter
        const plan = item.subscription?.subscription_plan || 'none';
        if (filterPlan !== 'all' && plan !== filterPlan) {
          return false;
        }
        
        // Subscription Status Filter
        const status = item.subscription?.subscription_status || 'none';
         if (filterStatus !== 'all' && status !== filterStatus) {
          return false;
        }

        // Search Term Filter (if searchTerm is present)
        if (searchTerm) {
          const lowerSearchTerm = searchTerm.toLowerCase();
          const name = item.profile?.first_name && item.profile?.last_name
            ? `${item.profile.first_name} ${item.profile.last_name}`.toLowerCase()
            : '';
          const email = item.user.email?.toLowerCase() || '';
          const location = item.profile?.location?.toLowerCase() || '';
          // Plan and status already checked above, but include in search text
          const planText = item.subscription?.subscription_plan?.toLowerCase() || '';
          const statusText = item.subscription?.subscription_status?.toLowerCase() || '';

          return (
            email.includes(lowerSearchTerm) ||
            name.includes(lowerSearchTerm) ||
            location.includes(lowerSearchTerm) ||
            planText.includes(lowerSearchTerm) || // Allow searching plan/status text too
            statusText.includes(lowerSearchTerm)
          );
        }
        
        // If no search term and passed plan/status filters, include the user
        return true;
      });
    }, [users, searchTerm, filterPlan, filterStatus]);
  
    const sortedUsers = useMemo(() => {
      return [...filteredUsers].sort((a, b) => {
        const { column, direction } = sortDescriptor;
        let valA: string | number | null = null;
        let valB: string | number | null = null;
  
        // Helper to handle null/undefined dates for sorting
        const getDateValue = (dateStr?: string | null): number => {
          return dateStr ? new Date(dateStr).getTime() : 0;
        };
  
        switch (column) {
          case 'email':
            valA = a.user.email || '';
            valB = b.user.email || '';
            break;
          case 'created_at':
            valA = getDateValue(a.user.created_at);
            valB = getDateValue(b.user.created_at);
            break;
          case 'last_sign_in_at':
            valA = getDateValue(a.user.last_sign_in_at);
            valB = getDateValue(b.user.last_sign_in_at);
            break;
          case 'name':
            valA = `${a.profile?.first_name || ''} ${a.profile?.last_name || ''}`.trim().toLowerCase();
            valB = `${b.profile?.first_name || ''} ${b.profile?.last_name || ''}`.trim().toLowerCase();
            break;
          case 'subscription_plan':
            valA = a.subscription?.subscription_plan || '';
            valB = b.subscription?.subscription_plan || '';
            break;
          case 'location':
            valA = a.profile?.location || '';
            valB = b.profile?.location || '';
            break;
          case 'work_experience_count':
            valA = a.profile?.work_experience?.length || 0;
            valB = b.profile?.work_experience?.length || 0;
            break;
          case 'education_count':
            valA = a.profile?.education?.length || 0;
            valB = b.profile?.education?.length || 0;
            break;
          case 'skills_count':
             valA = a.profile?.skills?.length || 0;
             valB = b.profile?.skills?.length || 0;
             break;
          case 'subscription_status':
            valA = a.subscription?.subscription_status || '';
            valB = b.subscription?.subscription_status || '';
            break;
          case 'current_period_end':
            valA = getDateValue(a.subscription?.current_period_end);
            valB = getDateValue(b.subscription?.current_period_end);
            break;
          case 'resume_count':
             valA = a.resume_count || 0;
             valB = b.resume_count || 0;
             break;
          default:
            // Should not happen if all SortableColumns are handled
            console.warn(`Unhandled sort column: ${column}`);
            return 0;
        }
  
        const comparison = valA < valB ? -1 : valA > valB ? 1 : 0;
        return direction === 'ascending' ? comparison : -comparison;
      });
    }, [filteredUsers, sortDescriptor]);

  // Moved uniquePlans and uniqueStatuses calculation above these checks

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline" 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  const renderSortIcon = (column: SortableColumns) => {
    if (sortDescriptor.column !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
    }
    return sortDescriptor.direction === 'ascending' ?
      <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-180" /> :
      <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-4 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex space-x-2">
           <Select value={filterPlan} onValueChange={setFilterPlan}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by plan" />
            </SelectTrigger>
            <SelectContent>
              {uniquePlans.map(plan => (
                <SelectItem key={plan} value={plan}>
                  {plan === 'all' ? 'All Plans' : plan === 'none' ? 'No Plan' : plan.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {uniqueStatuses.map(status => (
                <SelectItem key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status === 'none' ? 'N/A' : status.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <div className="px-4">
          {/* Updated grid columns and removed Subscriptions trigger */}
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview & Subscriptions</TabsTrigger>
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="p-0">
          <div className="rounded-md border-t">
            <Table>
              <TableCaption>
                {`Showing ${sortedUsers.length} of ${users.length} users.`}
                { (filterPlan !== 'all' || filterStatus !== 'all' || searchTerm) &&
                  ` (Filtered from ${users.length} total)`
                }
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('email')} className="px-0 hover:bg-transparent">
                      Email {renderSortIcon('email')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('created_at')} className="px-0 hover:bg-transparent">
                      Created {renderSortIcon('created_at')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('last_sign_in_at')} className="px-0 hover:bg-transparent">
                      Last Sign In {renderSortIcon('last_sign_in_at')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('name')} className="px-0 hover:bg-transparent">
                      Name {renderSortIcon('name')}
                    </Button>
                  </TableHead>
                  {/* Moved Subscription columns here */}
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('subscription_plan')} className="px-0 hover:bg-transparent">
                      Plan {renderSortIcon('subscription_plan')}
                    </Button>
                  </TableHead>
                   <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('subscription_status')} className="px-0 hover:bg-transparent">
                      Status {renderSortIcon('subscription_status')}
                    </Button>
                  </TableHead>
                   <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('current_period_end')} className="px-0 hover:bg-transparent">
                      Expires {renderSortIcon('current_period_end')}
                    </Button>
                  </TableHead>
                   {/* Added Resume Count column */}
                   <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('resume_count')} className="px-0 hover:bg-transparent">
                      Resumes {renderSortIcon('resume_count')}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.map((item) => (
                  <TableRow
                    key={item.user.id}
                    onClick={() => router.push(`/admin/${item.user.id}`)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">{item.user.email || 'N/A'}</TableCell>
                    <TableCell>{formatDate(item.user.created_at)}</TableCell>
                    <TableCell>{formatDate(item.user.last_sign_in_at)}</TableCell>
                    <TableCell>
                      {item.profile?.first_name && item.profile?.last_name 
                        ? `${item.profile.first_name} ${item.profile.last_name}`
                        : 'Not set'}
                    </TableCell>
                    {/* Moved Subscription cells here */}
                    <TableCell>
                      {item.subscription?.subscription_plan ? (
                        <Badge className={
                          item.subscription.subscription_plan === 'pro'
                            ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }>
                          {item.subscription.subscription_plan.toUpperCase()}
                        </Badge>
                      ) : (
                        <Badge variant="outline">No Plan</Badge>
                      )}
                    </TableCell>
                     <TableCell>
                      {item.subscription?.subscription_status ? (
                        <Badge className={
                          item.subscription.subscription_status === 'active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                        }>
                          {item.subscription.subscription_status.toUpperCase()}
                        </Badge>
                      ) : (
                        <Badge variant="outline">N/A</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(item.subscription?.current_period_end)}</TableCell>
                    {/* Added Resume Count cell */}
                    <TableCell className="text-center">{item.resume_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="profiles" className="p-0">
          <div className="rounded-md border-t">
            <Table>
               <TableCaption>
                 {`Showing ${sortedUsers.filter(u => u.profile).length} profiles from ${sortedUsers.length} filtered users.`}
                 { (filterPlan !== 'all' || filterStatus !== 'all' || searchTerm) &&
                  ` (Filtered from ${users.length} total)`
                 }
              </TableCaption>
              <TableHeader>
                <TableRow>
                   <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('email')} className="px-0 hover:bg-transparent">
                      Email {renderSortIcon('email')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('name')} className="px-0 hover:bg-transparent">
                      Name {renderSortIcon('name')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('location')} className="px-0 hover:bg-transparent">
                      Location {renderSortIcon('location')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('work_experience_count')} className="px-0 hover:bg-transparent">
                      Work Exp {renderSortIcon('work_experience_count')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('education_count')} className="px-0 hover:bg-transparent">
                      Education {renderSortIcon('education_count')}
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => handleSort('skills_count')} className="px-0 hover:bg-transparent">
                      Skills {renderSortIcon('skills_count')}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.map((item) => (
                  <TableRow
                    key={item.user.id}
                    onClick={() => router.push(`/admin/${item.user.id}`)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">{item.user.email || 'N/A'}</TableCell>
                    <TableCell>
                      {item.profile?.first_name && item.profile?.last_name 
                        ? `${item.profile.first_name} ${item.profile.last_name}`
                        : 'Not set'}
                    </TableCell>
                    <TableCell>{item.profile?.location || 'Not set'}</TableCell>
                    <TableCell>
                      {item.profile?.work_experience && Array.isArray(item.profile.work_experience) ? (
                        <Badge variant="outline">{item.profile.work_experience.length} entries</Badge>
                      ) : (
                        <Badge variant="outline">0</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.profile?.education && Array.isArray(item.profile.education) ? (
                        <Badge variant="outline">{item.profile.education.length} entries</Badge>
                      ) : (
                        <Badge variant="outline">0</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.profile?.skills && Array.isArray(item.profile.skills) ? (
                        <Badge variant="outline">{item.profile.skills.length} entries</Badge>
                      ) : (
                        <Badge variant="outline">0</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Removed TabsContent for "subscriptions" */}
      </Tabs>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-20" />
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      ))}
    </Card>
  );
}