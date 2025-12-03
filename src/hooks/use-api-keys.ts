'use client'

import { useSyncExternalStore, useCallback } from 'react'
import type { ApiKey } from '@/lib/ai-models'

// Storage keys - must match existing keys for backwards compatibility
const API_KEYS_STORAGE_KEY = 'resumelm-api-keys'
const MODEL_STORAGE_KEY = 'resumelm-default-model'

// Listener sets for each store
const apiKeysListeners = new Set<() => void>()
const modelListeners = new Set<() => void>()

// Cached server snapshots for SSR (MUST be cached to avoid infinite loops)
const EMPTY_API_KEYS: ApiKey[] = []
const EMPTY_MODEL = ''

// In-memory caches to keep snapshots stable between calls
let currentApiKeys: ApiKey[] = EMPTY_API_KEYS
let currentDefaultModel = EMPTY_MODEL

// Track initialization status
let hasInitializedStores = false
let hasAttachedStorageListener = false

// Emit changes to all subscribers
function emitApiKeysChange() {
  apiKeysListeners.forEach(listener => listener())
}

function emitModelChange() {
  modelListeners.forEach(listener => listener())
}

function ensureClientStoresInitialized() {
  if (typeof window === 'undefined') return

  if (!hasInitializedStores) {
    currentApiKeys = readStoredApiKeys()
    currentDefaultModel = readStoredModel()
    hasInitializedStores = true
  }

  if (!hasAttachedStorageListener) {
    window.addEventListener('storage', handleStorageChange)
    hasAttachedStorageListener = true
  }
}

function handleStorageChange(event: StorageEvent) {
  if (event.key === API_KEYS_STORAGE_KEY) {
    const parsed = parseApiKeys(event.newValue)
    if (!areApiKeysEqual(currentApiKeys, parsed)) {
      currentApiKeys = parsed
      emitApiKeysChange()
    }
  }

  if (event.key === MODEL_STORAGE_KEY) {
    const nextModel = event.newValue ?? EMPTY_MODEL
    if (nextModel !== currentDefaultModel) {
      currentDefaultModel = nextModel
      emitModelChange()
    }
  }
}

function readStoredApiKeys(): ApiKey[] {
  if (typeof window === 'undefined') return EMPTY_API_KEYS
  const stored = localStorage.getItem(API_KEYS_STORAGE_KEY)
  return parseApiKeys(stored)
}

function readStoredModel(): string {
  if (typeof window === 'undefined') return EMPTY_MODEL
  return localStorage.getItem(MODEL_STORAGE_KEY) ?? EMPTY_MODEL
}

function parseApiKeys(raw: string | null): ApiKey[] {
  if (!raw) return EMPTY_API_KEYS
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return EMPTY_API_KEYS
    return parsed.filter(isValidApiKey).map(cloneApiKey)
  } catch {
    return EMPTY_API_KEYS
  }
}

function isValidApiKey(value: any): value is ApiKey {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.service === 'string' &&
    typeof value.key === 'string' &&
    typeof value.addedAt === 'string'
  )
}

function cloneApiKey(value: ApiKey): ApiKey {
  return {
    service: value.service,
    key: value.key,
    addedAt: value.addedAt,
  }
}

function areApiKeysEqual(a: ApiKey[], b: ApiKey[]): boolean {
  if (a === b) return true
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    const ai = a[i]
    const bi = b[i]
    if (
      ai.service !== bi.service ||
      ai.key !== bi.key ||
      ai.addedAt !== bi.addedAt
    ) {
      return false
    }
  }
  return true
}

function normalizeApiKeys(value: ApiKey[]): ApiKey[] {
  return value.map(cloneApiKey)
}

// Subscribe functions for useSyncExternalStore
function subscribeApiKeys(listener: () => void) {
  ensureClientStoresInitialized()
  apiKeysListeners.add(listener)
  return () => {
    apiKeysListeners.delete(listener)
  }
}

function subscribeModel(listener: () => void) {
  ensureClientStoresInitialized()
  modelListeners.add(listener)
  return () => {
    modelListeners.delete(listener)
  }
}

// Snapshot functions - return stable references
function getApiKeysSnapshot(): ApiKey[] {
  if (typeof window === 'undefined') return EMPTY_API_KEYS
  ensureClientStoresInitialized()
  return currentApiKeys
}

function getModelSnapshot(): string {
  if (typeof window === 'undefined') return EMPTY_MODEL
  ensureClientStoresInitialized()
  return currentDefaultModel
}

function getServerApiKeysSnapshot(): ApiKey[] {
  return EMPTY_API_KEYS
}

function getServerModelSnapshot(): string {
  return EMPTY_MODEL
}

/**
 * Hook to manage API keys with real-time sync across components.
 * Uses useSyncExternalStore to ensure all consumers update instantly
 * when localStorage changes.
 */
export function useApiKeys() {
  const apiKeys = useSyncExternalStore(
    subscribeApiKeys,
    getApiKeysSnapshot,
    getServerApiKeysSnapshot
  )

  const setApiKeys = useCallback(
    (updater: ApiKey[] | ((prev: ApiKey[]) => ApiKey[])) => {
      ensureClientStoresInitialized()

      const current = currentApiKeys
      const nextValue =
        typeof updater === 'function' ? updater(current) : updater
      const normalized = Array.isArray(nextValue)
        ? normalizeApiKeys(nextValue)
        : EMPTY_API_KEYS

      if (areApiKeysEqual(current, normalized)) {
        return
      }

      currentApiKeys = normalized

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          API_KEYS_STORAGE_KEY,
          JSON.stringify(currentApiKeys)
        )
      }

      emitApiKeysChange()
    },
    []
  )

  return { apiKeys, setApiKeys }
}

/**
 * Hook to manage the default AI model selection with real-time sync.
 * Uses useSyncExternalStore to ensure all consumers update instantly
 * when localStorage changes.
 */
export function useDefaultModel() {
  const defaultModel = useSyncExternalStore(
    subscribeModel,
    getModelSnapshot,
    getServerModelSnapshot
  )

  const setDefaultModel = useCallback((model: string) => {
    ensureClientStoresInitialized()

    const nextModel = model ?? EMPTY_MODEL
    if (nextModel === currentDefaultModel) {
      return
    }

    currentDefaultModel = nextModel

    if (typeof window !== 'undefined') {
      localStorage.setItem(MODEL_STORAGE_KEY, currentDefaultModel)
    }

    emitModelChange()
  }, [])

  return { defaultModel, setDefaultModel }
}

// Re-export storage keys for consistency
export { API_KEYS_STORAGE_KEY, MODEL_STORAGE_KEY }

