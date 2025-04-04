import { redirect } from "next/navigation";
import { getUserId } from "../auth/login/actions";
import UsersTable from "./components/users-table";
import { getTotalUserCount, getTotalResumeCount } from "./actions"; // Import new actions
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components
import { Users, FileText } from "lucide-react"; // Import icons
export default async function AdminPage() {
    // Get the current user ID
    const userId = await getUserId();
    
    // Check if user is authenticated and is the admin
    if (!userId || userId !== process.env.ADMIN_ID) {
        // Redirect to home page if not admin
        redirect('/');
    }

    // Fetch stats concurrently
    const [totalUsers, totalResumes] = await Promise.all([
        getTotalUserCount(),
        getTotalResumeCount()
    ]);
    
    return (
        <div className="container py-8 space-y-8"> {/* Increased spacing */}
            <div className="flex justify-between items-center mb-6"> {/* Added margin bottom */}
                <h1 className="text-3xl font-bold">Admin Dashboard</h1> {/* Increased size */}
            </div>

            {/* Stats Section */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Overview</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Users
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
                            {/* <p className="text-xs text-muted-foreground">
                                +20.1% from last month
                            </p> */}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Resumes
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalResumes.toLocaleString()}</div>
                             {/* <p className="text-xs text-muted-foreground">
                                +180 since last hour
                            </p> */}
                        </CardContent>
                    </Card>
                     {/* Add more stats cards here if needed */}
                </div>
            </section>
            
            <div className="space-y-8">
                <section>
                    <h2 className="text-xl font-semibold mb-4">User Management</h2>
                    <UsersTable />
                </section>
            </div>
        </div>
    );
}