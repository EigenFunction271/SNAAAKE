import type React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link"
  size?: "default" | "lg" | "sm" | "icon"
  children: React.ReactNode
  className?: string
  color?: "cyan" | "purple" | "blue" | "green" | "pink" | "gradient"
  glow?: "none" | "low" | "medium" | "high"
}

export function Button({
  variant = "default",
  size = "default",
  children,
  className = "",
  color = "cyan",
  glow = "medium",
  ...props
}: ButtonProps) {
  const baseStyles =
    "rounded-md font-medium transition-all duration-200 focus:outline-none inline-flex items-center justify-center"

  const colorMap = {
    cyan: {
      bg: "bg-cyan-600",
      text: "text-white",
      border: "border-cyan-500",
      hover: "hover:bg-cyan-700",
      glow: "rgba(6, 182, 212, VAR)",
    },
    purple: {
      bg: "bg-purple-600",
      text: "text-white",
      border: "border-purple-500",
      hover: "hover:bg-purple-700",
      glow: "rgba(168, 85, 247, VAR)",
    },
    blue: {
      bg: "bg-blue-600",
      text: "text-white",
      border: "border-blue-500",
      hover: "hover:bg-blue-700",
      glow: "rgba(59, 130, 246, VAR)",
    },
    green: {
      bg: "bg-green-600",
      text: "text-white",
      border: "border-green-500",
      hover: "hover:bg-green-700",
      glow: "rgba(16, 185, 129, VAR)",
    },
    pink: {
      bg: "bg-pink-600",
      text: "text-white",
      border: "border-pink-500",
      hover: "hover:bg-pink-700",
      glow: "rgba(236, 72, 153, VAR)",
    },
    gradient: {
      bg: "bg-gradient-to-r from-cyan-500 to-purple-600",
      text: "text-white",
      border: "border-transparent",
      hover: "hover:from-cyan-600 hover:to-purple-700",
      glow: "rgba(6, 182, 212, VAR)",
    },
  }

  const glowIntensity = {
    none: "0",
    low: "0.3",
    medium: "0.5",
    high: "0.7",
  }

  const variants = {
    default: `${colorMap[color].bg} ${colorMap[color].text} ${colorMap[color].hover}`,
    outline: `bg-transparent ${colorMap[color].text} border-2 ${colorMap[color].border} hover:bg-black/30`,
    ghost: `bg-transparent ${colorMap[color].text} hover:bg-black/30`,
    link: `bg-transparent ${colorMap[color].text} underline-offset-4 hover:underline`,
  }

  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-6 py-3 text-base",
    sm: "h-8 px-3 py-1 text-xs",
    icon: "h-10 w-10",
  }

  const glowStyle =
    glow !== "none"
      ? {
          boxShadow: `0 0 15px ${colorMap[color].glow.replace("VAR", glowIntensity[glow])}`,
        }
      : {}

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`

  return (
    <button className={classes} style={glowStyle} {...props}>
      {children}
    </button>
  )
}

