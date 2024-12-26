"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full",
      "bg-gradient-to-r from-teal-100/20 to-cyan-100/20",
      "backdrop-blur-sm border border-gray-500/50",
      "shadow-[inset_0_0_8px_rgba(0,0,0,0.05)]",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 transition-transform duration-500 ease-out",
        "bg-gradient-to-r from-teal-600 to-cyan-600",
        "shadow-[0_0_8px_rgba(45,212,191,0.3)]"
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
