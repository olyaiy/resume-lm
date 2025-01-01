// src/app/settings/page.tsx
'use server'

import { SettingsHeader } from '@/components/settings/settings-header'
import { SettingsContent } from '@/components/settings/settings-content'
import { createClient } from '@/utils/supabase/server'
import { getApiKeys } from '@/utils/actions'

export async function testApiKey() {
  try {
    const supabase = await createClient()
    
    // Get the API key from vault
    const { data: apiKey, error: keyError } = await supabase
      .rpc('get_api_key', {
        p_service_name: 'openai'
      })

    if (keyError || !apiKey) {
      console.error('Error fetching API key:', keyError)
      return { error: 'No API key found for OpenAI' }
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Say this is a test!' }],
        temperature: 0.7
      })
    });

    const data = await response.json();

    console.log(data);
    console.dir(data);
    
    if (data.error) {
      return { error: data.error.message || 'API request failed' }
    }

    return {
      success: true,
      message: data.choices?.[0]?.message?.content || 'No response content'
    }
  } catch (error) {
    console.error('Error testing API key:', error)
    return { 
      error: error instanceof Error ? error.message : 'Failed to test API key'
    }
  }
}

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