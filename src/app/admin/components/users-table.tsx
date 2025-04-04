'use client';

import { useState, useEffect } from 'react';
import { getUsersWithProfilesAndSubscriptions } from '../actions';
import { Card } from '@/components/ui/card';
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

interface UserData {
  user: {
    id: string;
    email?: string;
    created_at: string;
    last_sign_in_at?: string;
  };
  profile: {
    first_name?: string;
    last_name?: string;
    location?: string;
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
  } | null;
  subscription: {
    subscription_plan?: string;
    subscription_status?: string;
    current_period_end?: string;
    stripe_customer_id?: string;
  } | null;
}

export default function UsersTable() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const data = await getUsersWithProfilesAndSubscriptions();
        setUsers(data);
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

  return (
    <Card className="p-0 overflow-hidden">
      <Tabs defaultValue="overview" className="w-full">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableCaption>List of all users ({users.length})</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Sign In</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Subscription</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((item) => (
                  <TableRow key={item.user.id}>
                    <TableCell className="font-medium">{item.user.email || 'N/A'}</TableCell>
                    <TableCell>{formatDate(item.user.created_at)}</TableCell>
                    <TableCell>{formatDate(item.user.last_sign_in_at)}</TableCell>
                    <TableCell>
                      {item.profile?.first_name && item.profile?.last_name 
                        ? `${item.profile.first_name} ${item.profile.last_name}`
                        : 'Not set'}
                    </TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="profiles" className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableCaption>User Profiles ({users.filter(u => u.profile).length} of {users.length})</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Work Experience</TableHead>
                  <TableHead>Education</TableHead>
                  <TableHead>Skills</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((item) => (
                  <TableRow key={item.user.id}>
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

        <TabsContent value="subscriptions" className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableCaption>User Subscriptions ({users.filter(u => u.subscription).length} of {users.length})</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Stripe Customer ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((item) => (
                  <TableRow key={item.user.id}>
                    <TableCell className="font-medium">{item.user.email || 'N/A'}</TableCell>
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
                    <TableCell className="max-w-[200px] truncate">{item.subscription?.stripe_customer_id || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
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