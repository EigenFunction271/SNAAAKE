import type React from "react"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: "cyan" | "purple" | "blue" | "green" | "pink"
  intensity?: "low" | "medium" | "high"
  variant?: "filled" | "outline"
}

export function Card({
  className = "",
  children,
  glowColor = "cyan",
  intensity = "medium",
  variant = "filled",
  ...props
}: CardProps) {
  const colorMap = {
    cyan: "rgba(6, 182, 212, VAR)",
    purple: "rgba(168, 85, 247, VAR)",
    blue: "rgba(59, 130, 246, VAR)",
    green: "rgba(16, 185, 129, VAR)",
    pink: "rgba(236, 72, 153, VAR)",
  }

  const intensityMap = {
    low: { border: "0.2", shadow: "0.3" },
    medium: { border: "0.3", shadow: "0.5" },
    high: { border: "0.5", shadow: "0.7" },
  }

  const borderColor = colorMap[glowColor].replace("VAR", intensityMap[intensity].border)
  const shadowColor = colorMap[glowColor].replace("VAR", intensityMap[intensity].shadow)

  const baseStyles = "rounded-lg backdrop-blur-sm"
  const variantStyles = variant === "filled" ? "bg-gray-900/70" : "bg-black/30 border border-" + glowColor + "-500/30"

  const styles = {
    boxShadow: `0 0 15px ${shadowColor}`,
    borderColor: borderColor,
  }

  return (
    <div className={`${baseStyles} ${variantStyles} ${className}`} style={styles} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className = "", children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-lg font-semibold leading-none tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-300 ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ className = "", children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-cyan-400/80 ${className}`} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  )
}

