// Removed unused redirect import
import Link from 'next/link';
// Removed getUserId import
import { getUserDetailsById, getResumeCountForUser, getResumesForUser, ensureAdmin } from '../actions'; // Import getResumesForUser and ensureAdmin
import UserResumeList from '../components/user-resume-list'; // Import the new component
import EditSubscriptionPlanForm from '../components/edit-subscription-plan-form'; // Import the new component
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation'; // Import notFound

interface AdminUserDetailPageProps {
  params: Promise<{
    'user-id': string;
  }>;
}

// Helper function to format dates
function formatDate(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  } catch { // Removed unused 'e'
    return 'Invalid Date';
  }
}

// Helper to render JSON data nicely
function JsonDisplay({ data }: { data: unknown }) { // Changed any to unknown
  if (!data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0)) {
    return <span className="text-muted-foreground italic">Not set</span>;
  }
  return (
    <pre className="mt-2 w-full overflow-x-auto rounded-md bg-slate-950 p-4">
      <code className="text-white">{JSON.stringify(data, null, 2)}</code>
    </pre>
  );
}


export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const targetUserId = (await params)['user-id'];

  // 1. Admin Check - Ensure the current user is an admin
  await ensureAdmin();

  // 2. Fetch User Data
  const userData = await getUserDetailsById(targetUserId);

  // 3. Handle User Not Found
  if (!userData) {
    notFound(); // Use Next.js notFound function
  }

  const { user, profile, subscription } = userData;

  // 4. Fetch Resume Count (in parallel potentially, or after user data)
  // 4. Fetch Resume Count & List (can run in parallel)
  const [resumeCount, resumes] = await Promise.all([
      getResumeCountForUser(targetUserId),
      getResumesForUser(targetUserId)
  ]);

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center gap-4">
         <Button variant="outline" size="icon" asChild>
           <Link href="/admin">
             <ArrowLeft className="h-4 w-4" />
             <span className="sr-only">Back to Admin Dashboard</span>
           </Link>
         </Button>
        <h1 className="text-2xl font-bold">User Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Auth Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Authentication Info</CardTitle>
            <CardDescription>User account details from Supabase Auth.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailItem label="User ID" value={user.id} isCode />
            <DetailItem label="Email" value={user.email || 'N/A'} />
            <DetailItem label="Created At" value={formatDate(user.created_at)} />
            <DetailItem label="Last Sign In" value={formatDate(user.last_sign_in_at)} />
            <DetailItem label="Email Confirmed" value={user.email_confirmed_at ? `Yes (${formatDate(user.email_confirmed_at)})` : 'No'} />
            <Separator className="my-2" />
            <DetailItem label="Resume Count" value={resumeCount.toString()} />
          </CardContent>
        </Card>

        {/* Profile Info Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Info</CardTitle>
             <CardDescription>Data from the &apos;profiles&apos; table.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile ? (
              <>
                <DetailItem label="First Name" value={profile.first_name} />
                <DetailItem label="Last Name" value={profile.last_name} />
                <DetailItem label="Location" value={profile.location} />
                <Separator className="my-4" />
                <h4 className="font-semibold text-muted-foreground">Work Experience</h4>
                <JsonDisplay data={profile.work_experience} />
                 <Separator className="my-4" />
                <h4 className="font-semibold text-muted-foreground">Education</h4>
                 <JsonDisplay data={profile.education} />
                 <Separator className="my-4" />
                 <h4 className="font-semibold text-muted-foreground">Skills</h4>
                 <JsonDisplay data={profile.skills} />
                 <Separator className="my-4" />
                 <h4 className="font-semibold text-muted-foreground">Projects</h4>
                 <JsonDisplay data={profile.projects} />
                 <Separator className="my-4" />
                 <h4 className="font-semibold text-muted-foreground">Certifications</h4>
                 <JsonDisplay data={profile.certifications} />
              </>
            ) : (
              <p className="text-muted-foreground italic">No profile data found for this user.</p>
            )}
          </CardContent>
        </Card>

        {/* Subscription Info Card */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Subscription Info</CardTitle>
             <CardDescription>Data from the &apos;subscriptions&apos; table.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscription ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  <DetailItem label="Plan" value={subscription.subscription_plan}>
                    {subscription.subscription_plan && <Badge variant={subscription.subscription_plan === 'pro' ? 'default' : 'secondary'}>{subscription.subscription_plan.toUpperCase()}</Badge>}
                  </DetailItem>
                  <DetailItem label="Status" value={subscription.subscription_status}>
                    {subscription.subscription_status && <Badge variant={subscription.subscription_status === 'active' ? 'default' : 'secondary'}>{subscription.subscription_status.toUpperCase()}</Badge>}
                  </DetailItem>
                  <DetailItem label="Current Period End" value={formatDate(subscription.current_period_end)} />
                  <DetailItem label="Stripe Customer ID" value={subscription.stripe_customer_id} isCode />
                  {/* Add other relevant subscription fields */}
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="text-md font-semibold mb-2">Change Subscription Plan</h3>
                  <EditSubscriptionPlanForm 
                    userId={targetUserId} 
                    currentPlan={subscription.subscription_plan}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground italic mb-4">No subscription data found for this user.</p>
                
                <div>
                  <h3 className="text-md font-semibold mb-2">Create Subscription</h3>
                  <EditSubscriptionPlanForm 
                    userId={targetUserId} 
                    currentPlan={null}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Resume List Card */}
        <Card className="lg:col-span-3">
           <CardHeader>
            <CardTitle>Resumes ({resumeCount})</CardTitle>
             <CardDescription>List of resumes created by this user.</CardDescription>
          </CardHeader>
           <CardContent>
             <UserResumeList resumes={resumes} />
           </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper component for displaying detail items
function DetailItem({ label, value, isCode = false, children }: { label: string; value?: string | null; isCode?: boolean; children?: React.ReactNode }) {
  const displayValue = value ?? <span className="text-muted-foreground italic">Not set</span>;
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {isCode ? (
        <code className="text-sm font-mono bg-muted px-1 py-0.5 rounded">{displayValue}</code>
      ) : (
        <p className="text-sm">{displayValue}</p>
      )}
      {children && <div className="mt-1">{children}</div>}
    </div>
  );
}