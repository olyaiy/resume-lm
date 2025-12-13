import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, onKeyDown, ...props }, ref) => {
  const internalRef = React.useRef<HTMLTextAreaElement>(null)
  
  // Combine refs: use the forwarded ref if provided, otherwise use internal ref
  const textareaRef = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      internalRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    },
    [ref]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Cmd+A (Mac) or Ctrl+A (Windows/Linux) to select all text
    if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
      e.preventDefault()
      const textarea = internalRef.current
      if (textarea) {
        textarea.select()
      }
    }

    // Call original onKeyDown if provided
    onKeyDown?.(e)
  }

  return (
    <textarea
      className={cn(
        // Base styles
        "flex w-full rounded-xl border-2 bg-white/90 px-4 py-3 text-sm",
        "border-gray-300",
        "shadow-sm shadow-gray-200/50",
        "placeholder:text-gray-500/60",
        // Interactive states
        "hover:border-gray-400 hover:bg-white",
        "focus:border-primary/60 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:ring-offset-0",
        "focus-visible:outline-none",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white/90",
        // Custom scrollbar
        "custom-scrollbar",
        className
      )}
      ref={textareaRef}
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
