import React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

interface NeonSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string
  color?: "blue" | "cyan" | "purple" | "green" | "pink"
  showValue?: boolean
}

const NeonSlider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, NeonSliderProps>(
  ({ className, label, color = "cyan", showValue = false, ...props }, ref) => {
    const glowColor = {
      blue: "rgb(0, 149, 255)",
      cyan: "rgb(0, 255, 255)",
      purple: "rgb(255, 0, 255)",
      green: "rgb(0, 255, 128)",
      pink: "rgb(255, 105, 180)",
    }[color]

    const value = props.value?.[0] || props.defaultValue?.[0] || 0
    const max = props.max || 100
    const percentage = Math.round((value / max) * 100)

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-300 tracking-wider uppercase">
              {label}
            </label>
          )}
          {showValue && (
            <span className="px-2 py-1 text-xs font-bold rounded-md bg-black/40 text-cyan-400 border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
              {percentage}%
            </span>
          )}
        </div>
        <SliderPrimitive.Root
          ref={ref}
          className={cn("relative flex w-full touch-none select-none items-center", className)}
          {...props}
        >
          <SliderPrimitive.Track
            className="relative h-2 w-full grow rounded-full bg-black border border-gray-800"
            style={{
              boxShadow: "inset 0 0 5px rgba(0, 0, 0, 0.5)",
            }}
          >
            <SliderPrimitive.Range
              className="absolute h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, 
                rgba(0,0,0,0.3) 0%, 
                ${glowColor} 50%, 
                rgba(0,0,0,0.3) 100%
              )`,
                boxShadow: `0 0 10px ${glowColor}, 
                         0 0 20px ${glowColor}`,
              }}
            />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            className="block h-5 w-5 rounded-full border-2 border-white bg-black 
                   ring-offset-background transition-colors focus-visible:outline-none 
                   focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
                   disabled:pointer-events-none disabled:opacity-50 hover:scale-110 transition-transform"
            style={{
              boxShadow: `0 0 10px ${glowColor}, 
                       0 0 20px ${glowColor}`,
            }}
          />
        </SliderPrimitive.Root>
      </div>
    )
  },
)

NeonSlider.displayName = "NeonSlider"

export { NeonSlider }

