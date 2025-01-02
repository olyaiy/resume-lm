
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SecurityForm } from "./security-form"
import { ApiKeysForm } from "./api-keys-form"
import { SubscriptionSection } from "./subscription-section"
import { DangerZone } from "./danger-zone"
import { User } from "@supabase/supabase-js"


interface SettingsContentProps {
  user: User | null;

}

export function SettingsContent({ user }: SettingsContentProps) {
  return (
    <div className="space-y-8">
        

      {/* Security Settings */}
      <Card className="border-white/40 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl">Security</CardTitle>
          <CardDescription>Manage your email and password settings</CardDescription>
        </CardHeader>
        <CardContent>
          <SecurityForm user={user} />
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card className="border-white/40 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl">API Keys</CardTitle>
          <CardDescription>Manage your API keys for different AI providers</CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeysForm />
        </CardContent>
      </Card>

      {/* Subscription Management */}
      <Card className="border-white/40 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl">Subscription</CardTitle>
          <CardDescription>Manage your subscription and billing settings</CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionSection />
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50 shadow-xl shadow-black/5 bg-white/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <DangerZone />
        </CardContent>
      </Card>
    </div>
  )
} 