'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"
import { useFormStatus } from 'react-dom'
import { deleteUserAccount } from "@/app/auth/login/actions"

interface DangerZoneProps {
  subscriptionStatus?: string;
}

interface SubmitButtonProps {
  isEnabled: boolean;
}

function SubmitButton({ isEnabled }: SubmitButtonProps) {
  const { pending } = useFormStatus()
  const isDisabled = pending || !isEnabled

  return (
    <AlertDialogAction
      type="submit"
      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      disabled={isDisabled}
    >
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Delete Account
    </AlertDialogAction>
  )
}

export function DangerZone({ subscriptionStatus }: DangerZoneProps) {
  const [confirmation, setConfirmation] = useState("")
  const isConfirmed = confirmation === "DELETE"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/50 bg-destructive/5">
        <div>
          <h3 className="font-medium text-destructive">Delete Account</h3>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all of your data
          </p>
          {subscriptionStatus === 'active' && (
            <p className="text-sm text-muted-foreground mt-2">
              You currently have an active subscription. Cancel above to avoid future charges before deleting your account.
            </p>
          )}
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive"
              className="bg-rose-500 hover:bg-rose-600"
            >
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <form action={deleteUserAccount}>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="confirm">Type &ldquo;DELETE&rdquo; to confirm</Label>
                  <Input
                    id="confirm"
                    name="confirm"
                    placeholder="DELETE"
                    className="bg-white/50"
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value.toUpperCase())}
                    required
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <SubmitButton isEnabled={isConfirmed} />
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
} 