import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
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
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
