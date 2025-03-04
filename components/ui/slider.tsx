interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min: number
  max: number
  step?: number
  className?: string
  color?: "cyan" | "purple" | "blue" | "green" | "pink"
  label?: string
  showValue?: boolean
}

export function Slider({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  className = "",
  color = "cyan",
  label,
  showValue = false,
}: SliderProps) {
  const colorMap = {
    cyan: { base: "#06b6d4", glow: "rgba(6, 182, 212, 0.7)" },
    purple: { base: "#a855f7", glow: "rgba(168, 85, 247, 0.7)" },
    blue: { base: "#3b82f6", glow: "rgba(59, 130, 246, 0.7)" },
    green: { base: "#10b981", glow: "rgba(16, 185, 129, 0.7)" },
    pink: { base: "#ec4899", glow: "rgba(236, 72, 153, 0.7)" },
  }

  const percentage = Math.round((value[0] / max) * 100)

  return (
    <div className="space-y-3">
      {(label || showValue) && (
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
      )}
      <div className="relative h-7 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => onValueChange([Number(e.target.value)])}
          className={`w-full h-2 appearance-none cursor-pointer bg-black border border-gray-800 rounded-full ${className}`}
          style={{
            background: `linear-gradient(to right, ${colorMap[color].base} 0%, ${colorMap[color].base} ${percentage}%, #111 ${percentage}%, #111 100%)`,
            boxShadow: `0 0 10px ${colorMap[color].glow}`,
          }}
        />
        <style jsx>{`
          input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #000;
            border: 2px solid #fff;
            box-shadow: 0 0 10px ${colorMap[color].glow}, 0 0 20px ${colorMap[color].glow};
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          input[type=range]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
          }
          
          input[type=range]::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #000;
            border: 2px solid #fff;
            box-shadow: 0 0 10px ${colorMap[color].glow}, 0 0 20px ${colorMap[color].glow};
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          input[type=range]::-moz-range-thumb:hover {
            transform: scale(1.1);
          }
        `}</style>
      </div>
    </div>
  )
}

