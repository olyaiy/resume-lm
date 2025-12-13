'use client'

import { useSyncExternalStore, useCallback } from 'react'
import type { CustomPrompts } from '@/lib/types'
import {
  WORK_EXPERIENCE_GENERATOR_MESSAGE,
  WORK_EXPERIENCE_IMPROVER_MESSAGE,
  PROJECT_GENERATOR_MESSAGE,
  PROJECT_IMPROVER_MESSAGE,
  TEXT_ANALYZER_SYSTEM_MESSAGE,
  RESUME_FORMATTER_SYSTEM_MESSAGE,
  AI_ASSISTANT_SYSTEM_MESSAGE,
} from '@/lib/prompts'

// Storage key for custom prompts
const CUSTOM_PROMPTS_STORAGE_KEY = 'resumelm-custom-prompts'

// Listener set for the store
const customPromptsListeners = new Set<() => void>()

// Cached server snapshot for SSR (MUST be cached to avoid infinite loops)
const EMPTY_PROMPTS: CustomPrompts = {}

// In-memory cache to keep snapshots stable between calls
let currentCustomPrompts: CustomPrompts = EMPTY_PROMPTS

// Track initialization status
let hasInitializedStore = false
let hasAttachedStorageListener = false

// Default prompts for each type
export const DEFAULT_PROMPTS: Required<CustomPrompts> = {
  aiAssistant: AI_ASSISTANT_SYSTEM_MESSAGE.content as string,
  workExperienceGenerator: WORK_EXPERIENCE_GENERATOR_MESSAGE.content as string,
  workExperienceImprover: WORK_EXPERIENCE_IMPROVER_MESSAGE.content as string,
  projectGenerator: PROJECT_GENERATOR_MESSAGE.content as string,
  projectImprover: PROJECT_IMPROVER_MESSAGE.content as string,
  textAnalyzer: TEXT_ANALYZER_SYSTEM_MESSAGE.content as string,
  resumeFormatter: RESUME_FORMATTER_SYSTEM_MESSAGE.content as string,
}

// Prompt metadata for UI display
export const PROMPT_METADATA: Record<keyof CustomPrompts, { name: string; description: string }> = {
  aiAssistant: {
    name: 'AI Chat Assistant',
    description: 'The system prompt used for the main chat assistant that helps you optimize your resume.',
  },
  workExperienceGenerator: {
    name: 'Work Experience Generator',
    description: 'Used when generating new bullet points for work experiences.',
  },
  workExperienceImprover: {
    name: 'Work Experience Improver',
    description: 'Used when improving existing work experience bullet points.',
  },
  projectGenerator: {
    name: 'Project Generator',
    description: 'Used when generating new bullet points for projects.',
  },
  projectImprover: {
    name: 'Project Improver',
    description: 'Used when improving existing project bullet points.',
  },
  textAnalyzer: {
    name: 'Text Analyzer',
    description: 'Used when importing text content and extracting professional information.',
  },
  resumeFormatter: {
    name: 'Resume Formatter',
    description: 'Used when formatting and structuring resume content from raw text.',
  },
}

// Emit changes to all subscribers
function emitCustomPromptsChange() {
  customPromptsListeners.forEach(listener => listener())
}

function ensureClientStoreInitialized() {
  if (typeof window === 'undefined') return

  if (!hasInitializedStore) {
    currentCustomPrompts = readStoredPrompts()
    hasInitializedStore = true
  }

  if (!hasAttachedStorageListener) {
    window.addEventListener('storage', handleStorageChange)
    hasAttachedStorageListener = true
  }
}

function handleStorageChange(event: StorageEvent) {
  if (event.key === CUSTOM_PROMPTS_STORAGE_KEY) {
    const parsed = parseCustomPrompts(event.newValue)
    if (!arePromptsEqual(currentCustomPrompts, parsed)) {
      currentCustomPrompts = parsed
      emitCustomPromptsChange()
    }
  }
}

function readStoredPrompts(): CustomPrompts {
  if (typeof window === 'undefined') return EMPTY_PROMPTS
  const stored = localStorage.getItem(CUSTOM_PROMPTS_STORAGE_KEY)
  return parseCustomPrompts(stored)
}

function parseCustomPrompts(raw: string | null): CustomPrompts {
  if (!raw) return EMPTY_PROMPTS
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return EMPTY_PROMPTS
    return validatePrompts(parsed as Record<string, unknown>)
  } catch {
    return EMPTY_PROMPTS
  }
}

function validatePrompts(obj: Record<string, unknown>): CustomPrompts {
  const result: CustomPrompts = {}
  const validKeys: Array<keyof CustomPrompts> = [
    'aiAssistant',
    'workExperienceGenerator',
    'workExperienceImprover',
    'projectGenerator',
    'projectImprover',
    'textAnalyzer',
    'resumeFormatter',
  ]

  for (const key of validKeys) {
    if (typeof obj[key] === 'string' && obj[key]) {
      result[key] = obj[key] as string
    }
  }

  return result
}

function arePromptsEqual(a: CustomPrompts, b: CustomPrompts): boolean {
  if (a === b) return true
  const aKeys = Object.keys(a) as Array<keyof CustomPrompts>
  const bKeys = Object.keys(b) as Array<keyof CustomPrompts>
  if (aKeys.length !== bKeys.length) return false
  
  for (const key of aKeys) {
    if (a[key] !== b[key]) return false
  }
  return true
}

// Subscribe function for useSyncExternalStore
function subscribeCustomPrompts(listener: () => void) {
  ensureClientStoreInitialized()
  customPromptsListeners.add(listener)
  return () => {
    customPromptsListeners.delete(listener)
  }
}

// Snapshot functions - return stable references
function getCustomPromptsSnapshot(): CustomPrompts {
  if (typeof window === 'undefined') return EMPTY_PROMPTS
  ensureClientStoreInitialized()
  return currentCustomPrompts
}

function getServerCustomPromptsSnapshot(): CustomPrompts {
  return EMPTY_PROMPTS
}

/**
 * Hook to manage custom AI prompts with real-time sync across components.
 * Uses useSyncExternalStore to ensure all consumers update instantly
 * when localStorage changes.
 */
export function useCustomPrompts() {
  const customPrompts = useSyncExternalStore(
    subscribeCustomPrompts,
    getCustomPromptsSnapshot,
    getServerCustomPromptsSnapshot
  )

  const setCustomPrompts = useCallback(
    (updater: CustomPrompts | ((prev: CustomPrompts) => CustomPrompts)) => {
      ensureClientStoreInitialized()

      const current = currentCustomPrompts
      const nextValue = typeof updater === 'function' ? updater(current) : updater
      const validated = validatePrompts(nextValue as Record<string, unknown>)

      if (arePromptsEqual(current, validated)) {
        return
      }

      currentCustomPrompts = validated

      if (typeof window !== 'undefined') {
        if (Object.keys(validated).length === 0) {
          localStorage.removeItem(CUSTOM_PROMPTS_STORAGE_KEY)
        } else {
          localStorage.setItem(CUSTOM_PROMPTS_STORAGE_KEY, JSON.stringify(currentCustomPrompts))
        }
      }

      emitCustomPromptsChange()
    },
    []
  )

  const setPrompt = useCallback(
    (key: keyof CustomPrompts, value: string | undefined) => {
      setCustomPrompts(prev => {
        if (value === undefined || value === DEFAULT_PROMPTS[key]) {
          // Remove the custom prompt if it matches default or is undefined
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [key]: _removed, ...rest } = prev
          return rest
        }
        return { ...prev, [key]: value }
      })
    },
    [setCustomPrompts]
  )

  const resetPrompt = useCallback(
    (key: keyof CustomPrompts) => {
      setCustomPrompts(prev => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [key]: _removed, ...rest } = prev
        return rest
      })
    },
    [setCustomPrompts]
  )

  const resetAllPrompts = useCallback(() => {
    setCustomPrompts({})
  }, [setCustomPrompts])

  const getPrompt = useCallback(
    (key: keyof CustomPrompts): string => {
      return customPrompts[key] ?? DEFAULT_PROMPTS[key]
    },
    [customPrompts]
  )

  const isCustomized = useCallback(
    (key: keyof CustomPrompts): boolean => {
      return key in customPrompts
    },
    [customPrompts]
  )

  return {
    customPrompts,
    setCustomPrompts,
    setPrompt,
    resetPrompt,
    resetAllPrompts,
    getPrompt,
    isCustomized,
  }
}

// Re-export storage key for consistency
export { CUSTOM_PROMPTS_STORAGE_KEY }

