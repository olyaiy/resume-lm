import { redirect } from "next/navigation";
import { getUserId } from "../auth/login/actions";

export default async function AdminPage() {
    // Get the current user ID
    const userId = await getUserId();
    
    // Check if user is authenticated and is the admin
    if (!userId || userId !== process.env.ADMIN_ID) {
        // Redirect to home page if not admin
        redirect('/');
    }
    
    return (
        <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p>Welcome to the admin area.</p>
        </div>
    );
}