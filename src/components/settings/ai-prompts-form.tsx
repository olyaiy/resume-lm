'use client'

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RotateCcw, ChevronDown, ChevronUp, AlertCircle, Check } from "lucide-react"
import { useState, useCallback } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { 
  useCustomPrompts, 
  DEFAULT_PROMPTS, 
  PROMPT_METADATA 
} from "@/hooks/use-custom-prompts"
import type { CustomPrompts } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const PROMPT_KEYS: Array<keyof CustomPrompts> = [
  'aiAssistant',
  'workExperienceGenerator',
  'workExperienceImprover',
  'projectGenerator',
  'projectImprover',
  'textAnalyzer',
  'resumeFormatter',
]

export function AiPromptsForm() {
  const { 
    getPrompt, 
    setPrompt, 
    resetPrompt, 
    resetAllPrompts, 
    isCustomized 
  } = useCustomPrompts()
  
  const [expandedPrompts, setExpandedPrompts] = useState<Set<keyof CustomPrompts>>(new Set())
  const [editingValues, setEditingValues] = useState<Partial<CustomPrompts>>({})
  const [hasChanges, setHasChanges] = useState<Set<keyof CustomPrompts>>(new Set())

  const toggleExpanded = useCallback((key: keyof CustomPrompts) => {
    setExpandedPrompts(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
        // Initialize editing value when expanding
        if (!(key in editingValues)) {
          setEditingValues(prev => ({ ...prev, [key]: getPrompt(key) }))
        }
      }
      return next
    })
  }, [editingValues, getPrompt])

  const handlePromptChange = useCallback((key: keyof CustomPrompts, value: string) => {
    setEditingValues(prev => ({ ...prev, [key]: value }))
    const currentSaved = getPrompt(key)
    setHasChanges(prev => {
      const next = new Set(prev)
      if (value !== currentSaved) {
        next.add(key)
      } else {
        next.delete(key)
      }
      return next
    })
  }, [getPrompt])

  const handleSavePrompt = useCallback((key: keyof CustomPrompts) => {
    const value = editingValues[key]
    if (value !== undefined) {
      setPrompt(key, value)
      setHasChanges(prev => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
      toast.success(`${PROMPT_METADATA[key].name} prompt saved`)
    }
  }, [editingValues, setPrompt])

  const handleResetPrompt = useCallback((key: keyof CustomPrompts) => {
    resetPrompt(key)
    setEditingValues(prev => ({ ...prev, [key]: DEFAULT_PROMPTS[key] }))
    setHasChanges(prev => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })
    toast.success(`${PROMPT_METADATA[key].name} prompt reset to default`)
  }, [resetPrompt])

  const handleResetAll = useCallback(() => {
    resetAllPrompts()
    setEditingValues({})
    setHasChanges(new Set())
    setExpandedPrompts(new Set())
    toast.success('All prompts reset to defaults')
  }, [resetAllPrompts])

  const customizedCount = PROMPT_KEYS.filter(key => isCustomized(key)).length

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/50 to-orange-50/50 border border-amber-200/50">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-900">Advanced Feature</p>
            <p className="text-sm text-amber-800/80">
              Customize the AI system prompts to change how the AI assists you with your resume. 
              This is an advanced feature - incorrect prompts may lead to unexpected results.
              Your custom prompts are stored locally in your browser.
            </p>
          </div>
        </div>
      </div>

      {/* Customization Status */}
      {customizedCount > 0 && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50/50 border border-purple-200/50">
          <span className="text-sm text-purple-800">
            {customizedCount} prompt{customizedCount > 1 ? 's' : ''} customized
          </span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-100/50"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Reset All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all prompts?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all {customizedCount} customized prompt{customizedCount > 1 ? 's' : ''} back to their default values. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetAll}>
                  Reset All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Prompts List */}
      <div className="space-y-3">
        {PROMPT_KEYS.map(key => {
          const isExpanded = expandedPrompts.has(key)
          const isPromptCustomized = isCustomized(key)
          const hasUnsavedChanges = hasChanges.has(key)
          const currentValue = editingValues[key] ?? getPrompt(key)
          const charCount = currentValue.length

          return (
            <div
              key={key}
              className={cn(
                "rounded-xl border transition-all",
                isExpanded 
                  ? "bg-white/60 border-purple-200/60 shadow-sm" 
                  : "bg-white/40 border-white/40 hover:bg-white/50"
              )}
            >
              {/* Header */}
              <button
                type="button"
                onClick={() => toggleExpanded(key)}
                className="w-full px-4 py-3 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-800">
                        {PROMPT_METADATA[key].name}
                      </span>
                      {isPromptCustomized && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-purple-100 text-purple-700">
                          Customized
                        </span>
                      )}
                      {hasUnsavedChanges && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-100 text-amber-700">
                          Unsaved
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {PROMPT_METADATA[key].description}
                    </span>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">
                        System Prompt
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {charCount.toLocaleString()} characters
                      </span>
                    </div>
                    <Textarea
                      value={currentValue}
                      onChange={(e) => handlePromptChange(key, e.target.value)}
                      className={cn(
                        "min-h-[200px] font-mono text-xs bg-white/60",
                        "border-gray-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-500/10",
                        "resize-y"
                      )}
                      placeholder="Enter custom system prompt..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResetPrompt(key)}
                      disabled={!isPromptCustomized && !hasUnsavedChanges}
                      className="text-muted-foreground hover:text-gray-900"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                      Reset to Default
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSavePrompt(key)}
                      disabled={!hasUnsavedChanges}
                      className={cn(
                        "transition-colors",
                        hasUnsavedChanges
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                          : ""
                      )}
                    >
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      Save Prompt
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

