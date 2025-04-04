import { redirect } from "next/navigation";
import { getUserId } from "../auth/login/actions";
import UsersTable from "./components/users-table";

export default async function AdminPage() {
    // Get the current user ID
    const userId = await getUserId();
    
    // Check if user is authenticated and is the admin
    if (!userId || userId !== process.env.ADMIN_ID) {
        // Redirect to home page if not admin
        redirect('/');
    }
    
    return (
        <div className="container py-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            
            <div className="space-y-8">
                <section>
                    <h2 className="text-xl font-semibold mb-4">User Management</h2>
                    <UsersTable />
                </section>
            </div>
        </div>
    );
}