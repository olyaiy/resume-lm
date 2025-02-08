'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { User } from "@supabase/supabase-js"
import { useState } from "react"
import { updateEmail, updatePassword } from "@/app/(dashboard)/settings/actions"
import { toast } from "sonner"
// import { testApiKey } from "@/app/settings/page"

interface SecurityFormProps {
  user: User | null;
}

export function SecurityForm({ user }: SecurityFormProps) {
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleEmailUpdate = async () => {
    try {
      setIsUpdatingEmail(true);
      const formData = new FormData();
      formData.append('email', newEmail);
      formData.append('currentPassword', emailCurrentPassword);
      
      const result = await updateEmail(formData);
      
      if (!result.success) {
        toast.error(result.error || "Failed to update email");
        return;
      }
      
      toast.success("Please check your new email to confirm the change");
      setNewEmail("");
      setEmailCurrentPassword("");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      setIsUpdatingPassword(true);
      const formData = new FormData();
      formData.append('currentPassword', currentPassword);
      formData.append('newPassword', newPassword);
      
      const result = await updatePassword(formData);
      
      if (!result.success) {
        toast.error(result.error || "Failed to update password");
        return;
      }
      
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    
    <div className="space-y-8">
    {/* <Button onClick={handleTestApiKey}>Test API Key</Button> */}
    
      {/* Email Change Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Email Address</Label>
          <p className="text-sm text-muted-foreground">Current email: {user?.email}</p>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter new email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="bg-white/50 flex-1"
              />
              <Input
                type="password"
                placeholder="Current password"
                value={emailCurrentPassword}
                onChange={(e) => setEmailCurrentPassword(e.target.value)}
                className="bg-white/50 flex-1"
              />
              <Button 
                variant="outline"
                className="bg-white/50 border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                onClick={handleEmailUpdate}
                disabled={isUpdatingEmail || !newEmail || !emailCurrentPassword}
              >
                <Loader2 className={`mr-2 h-4 w-4 animate-spin ${!isUpdatingEmail && "opacity-0"}`} />
                {isUpdatingEmail ? "Updating..." : "Change Email"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Password</Label>
          <div className="flex gap-4">
            <Input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-white/50"
            />
            <Input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-white/50"
            />
            <Button 
              variant="outline"
              className="bg-white/50 border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 whitespace-nowrap"
              onClick={handlePasswordUpdate}
              disabled={isUpdatingPassword || !currentPassword || !newPassword}
            >
              <Loader2 className={`mr-2 h-4 w-4 animate-spin ${!isUpdatingPassword && "opacity-0"}`} />
              {isUpdatingPassword ? "Updating..." : "Change Password"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 