// Removed getUserId import
import UsersTable from "./components/users-table";
import {
    getTotalUserCount,
    getTotalResumeCount,
    getTotalSubscriptionCount,
    getBaseResumeCount,
    getTailoredResumeCount,
    getProUserCount, // Import new action
    ensureAdmin // Import the new admin check function
} from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CreditCard, FileCheck, FilePlus, Star } from "lucide-react"; // Import Star, remove UsersRound

export default async function AdminPage() {
    try {
        // Ensure the current user is an admin, redirect if not
        await ensureAdmin();

        // Fetch all stats concurrently
        const [
            totalUsers,
            totalResumes,
            totalSubscriptions, // This might represent total *ever* subscriptions depending on the table
            baseResumes,
            tailoredResumes,
            proUsers // Fetch pro user count
        ] = await Promise.all([
            getTotalUserCount(),
            getTotalResumeCount(),
            getTotalSubscriptionCount(), // Keep or remove based on whether it's distinct from proUsers
            getBaseResumeCount(),
            getTailoredResumeCount(),
            getProUserCount() // Call the new action
        ]);

        // Removed averageResumesPerUser calculation

        return (
            <div className="container mx-auto py-10 px-4 md:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Overview of platform usage and user management.</p>
                </div>

                {/* Stats Section */}
                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Platform Statistics</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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

                        {/* Pro Users Card */}
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Pro Users
                                </CardTitle>
                                <Star className="h-4 w-4 text-muted-foreground" /> {/* Changed Icon */}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{proUsers.toLocaleString()}</div> {/* Display pro users */}
                            </CardContent>
                        </Card>

                        {/* Total Subscriptions Card - Keep or remove? Depends if it's different from Pro Users */}
                        {/* If getTotalSubscriptionCount counts *all* subscriptions (active/inactive), keep it. */}
                        {/* If it's the same as getProUserCount, remove this card. */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Subscriptions
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
    } catch (error) {
        console.error("Error during AdminPage server rendering:", error);
        // Fallback UI to display the error and prevent crashing the client context
        return (
            <div className="container mx-auto py-10 px-4 md:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-red-600">Admin Page Server Error</h1>
                <p className="text-muted-foreground mt-1">An unexpected error occurred while trying to render the admin dashboard on the server.</p>
                <div className="mt-4 p-4 border border-red-300 bg-red-50 rounded-md">
                    <h2 className="text-lg font-semibold text-red-700">Error Details:</h2>
                    <pre className="mt-2 text-sm text-red-700 whitespace-pre-wrap">
                        {error instanceof Error ? error.message : String(error)}
                        {error instanceof Error && error.stack ? `\n\nStack Trace:\n${error.stack}` : ''}
                    </pre>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                    Please check the server logs for more information. The client-side portion of the page may not function correctly.
                </p>
            </div>
        );
    }
}