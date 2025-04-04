import { redirect } from "next/navigation";
import { getUserId } from "../auth/login/actions";
import UsersTable from "./components/users-table";
import {
    getTotalUserCount,
    getTotalResumeCount,
    getTotalSubscriptionCount, // Import new action
    getBaseResumeCount,        // Import new action
    getTailoredResumeCount     // Import new action
} from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CreditCard, FileCheck, FilePlus, UsersRound } from "lucide-react"; // Import new icons

export default async function AdminPage() {
    // Get the current user ID
    const userId = await getUserId();

    // Check if user is authenticated and is the admin
    if (!userId || userId !== process.env.ADMIN_ID) {
        // Redirect to home page if not admin
        redirect('/');
    }

    // Fetch all stats concurrently
    const [
        totalUsers,
        totalResumes,
        totalSubscriptions,
        baseResumes,
        tailoredResumes
    ] = await Promise.all([
        getTotalUserCount(),
        getTotalResumeCount(),
        getTotalSubscriptionCount(),
        getBaseResumeCount(),
        getTailoredResumeCount()
    ]);

    // Calculate average resumes per user (handle division by zero)
    const averageResumesPerUser = totalUsers > 0 ? (totalResumes / totalUsers).toFixed(1) : 0;

    return (
        <div className="container mx-auto py-10 px-4 md:px-6 lg:px-8"> {/* Consistent padding */}
            <div className="mb-8"> {/* Increased margin bottom */}
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Overview of platform usage and user management.</p>
            </div>

            {/* Stats Section */}
            <section className="mb-10"> {/* Increased margin bottom */}
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Platform Statistics</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"> {/* Adjusted grid for more stats */}
                    {/* Total Users Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Users
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    {/* Total Resumes Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Resumes
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalResumes.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    {/* Base Resumes Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Base Resumes
                            </CardTitle>
                            <FileCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{baseResumes.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    {/* Tailored Resumes Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Tailored Resumes
                            </CardTitle>
                            <FilePlus className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{tailoredResumes.toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    {/* Average Resumes Per User Card */}
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Avg Resumes/User
                            </CardTitle>
                            <UsersRound className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{averageResumesPerUser}</div>
                        </CardContent>
                    </Card>

                    {/* Total Subscriptions Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Subscriptions
                            </CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalSubscriptions.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* User Management Section */}
            <section>
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">User Management</h2>
                <UsersTable />
            </section>
        </div>
    );
}