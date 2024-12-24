import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border-2 bg-white/90 px-4 py-2 text-base",
          "border-gray-300",
          "shadow-sm shadow-gray-200/50",
          "placeholder:text-gray-500/60",
          "transition-all duration-300 ease-in-out",
          "hover:border-gray-400 hover:bg-white",
          "focus:border-primary/60 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:ring-offset-0",
          "focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white/90",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
