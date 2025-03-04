"use client"

import type React from "react"

import { useState } from "react"

interface TouchControlsProps {
  onDirectionChange: (direction: { x: number; y: number }) => void
  onBoostStart: () => void
  onBoostEnd: () => void
}

export function TouchControls({ onDirectionChange, onBoostStart, onBoostEnd }: TouchControlsProps) {
  const [touchActive, setTouchActive] = useState(false)
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 })
  const [touchCurrent, setTouchCurrent] = useState({ x: 0, y: 0 })
  const [boostActive, setBoostActive] = useState(false)

  // Handle touch events for directional control
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
    setTouchCurrent({ x: touch.clientX, y: touch.clientY })
    setTouchActive(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (!touchActive) return
    const touch = e.touches[0]
    setTouchCurrent({ x: touch.clientX, y: touch.clientY })

    // Calculate direction vector
    const dx = touch.clientX - touchStart.x
    const dy = touch.clientY - touchStart.y

    // Normalize
    const length = Math.sqrt(dx * dx + dy * dy)
    if (length > 0) {
      onDirectionChange({
        x: dx / length,
        y: dy / length,
      })
    }
  }

  const handleTouchEnd = () => {
    setTouchActive(false)
    onDirectionChange({ x: 0, y: 0 })
  }

  // Handle boost button
  const handleBoostStart = () => {
    setBoostActive(true)
    onBoostStart()
  }

  const handleBoostEnd = () => {
    setBoostActive(false)
    onBoostEnd()
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-between px-4 z-20">
      {/* Joystick area */}
      <div
        className="w-32 h-32 rounded-full bg-black/30 border-2 border-cyan-500/50 relative touch-none shadow-[0_0_15px_rgba(6,182,212,0.4)]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {touchActive && (
          <div
            className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 shadow-[0_0_10px_rgba(6,182,212,0.7)]"
            style={{
              left: `calc(50% + ${Math.min(Math.max((touchCurrent.x - touchStart.x) / 2, -32), 32)}px)`,
              top: `calc(50% + ${Math.min(Math.max((touchCurrent.y - touchStart.y) / 2, -32), 32)}px)`,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center text-cyan-400 opacity-70 pointer-events-none">
          MOVE
        </div>
      </div>

      {/* Boost button */}
      <div
        className={`w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-xl touch-none transition-all duration-200 ${
          boostActive
            ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-[0_0_20px_rgba(168,85,247,0.7)]"
            : "bg-gradient-to-r from-cyan-800 to-purple-800 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
        }`}
        onTouchStart={handleBoostStart}
        onTouchEnd={handleBoostEnd}
      >
        BOOST
      </div>
    </div>
  )
}

