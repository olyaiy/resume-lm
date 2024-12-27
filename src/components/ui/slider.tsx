"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center cursor-pointer",
      className
    )}
    step={1}
    minStepsBetweenThumbs={1}
    {...props}
  >
    <SliderPrimitive.Track 
      className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-200/50 hover:bg-slate-200/70 transition-colors duration-200"
    >
      <SliderPrimitive.Range 
        className="absolute h-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 transition-colors duration-200" 
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb 
      className="block h-5 w-5 rounded-full border-2 border-teal-500 bg-white ring-offset-2 
        shadow-lg shadow-teal-500/20 
        transition-all duration-200 
        hover:scale-110 hover:border-teal-400 hover:shadow-xl hover:shadow-teal-500/30
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 
        active:scale-105 active:shadow-teal-500/40
        disabled:pointer-events-none disabled:opacity-50
        cursor-grab active:cursor-grabbing
        data-[dragging=true]:cursor-grabbing" 
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
