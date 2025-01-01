// src/app/settings/page.tsx

"use server"

import { SettingsHeader } from '@/components/settings/settings-header'
import { SettingsContent } from '@/components/settings/settings-content'
import { createClient } from '@/utils/supabase/server'
import { getApiKeys } from '@/utils/actions'


export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const apiKeys = await getApiKeys();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <SettingsHeader />
      <main className="pt-28 pb-16 px-4 md:px-8 max-w-[2000px] mx-auto">
        <SettingsContent user={user} apiKeys={apiKeys} />
      </main>
    </div>
  )
}