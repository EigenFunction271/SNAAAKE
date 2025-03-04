import React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

interface NeonSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string;
  color?: 'blue' | 'cyan' | 'purple';
}

const NeonSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  NeonSliderProps
>(({ className, label, color = 'blue', ...props }, ref) => {
  const glowColor = {
    blue: 'rgb(0, 149, 255)',
    cyan: 'rgb(0, 255, 255)',
    purple: 'rgb(255, 0, 255)'
  }[color];

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-white">
          {label}
        </label>
      )}
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track
          className="relative h-1 w-full grow rounded-full bg-black"
        >
          <SliderPrimitive.Range
            className="absolute h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, 
                rgba(0,0,0,0) 0%, 
                ${glowColor} 50%, 
                rgba(0,0,0,0) 100%
              )`,
              boxShadow: `0 0 10px ${glowColor}, 
                         0 0 20px ${glowColor}, 
                         0 0 30px ${glowColor}`,
            }}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block h-4 w-4 rounded-full border-2 border-white bg-black 
                   ring-offset-background transition-colors focus-visible:outline-none 
                   focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
                   disabled:pointer-events-none disabled:opacity-50"
          style={{
            boxShadow: `0 0 10px ${glowColor}, 
                       0 0 20px ${glowColor}`,
          }}
        />
      </SliderPrimitive.Root>
    </div>
  );
});

NeonSlider.displayName = "NeonSlider";

export { NeonSlider }; 