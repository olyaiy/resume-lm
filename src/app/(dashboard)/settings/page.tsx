// src/app/settings/page.tsx

"use server"

import { SettingsContent } from '@/components/settings/settings-content'
import { createClient } from '@/utils/supabase/server'


export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();




  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <main className="pt-4 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <SettingsContent user={user}/>
      </main>
    </div>
  )
}