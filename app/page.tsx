"use client"

import React from 'react'
import SnakeGame from "@/components/game"
import { ErrorBoundary } from "@/utils/error-boundary"

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
            SNAPDRAGON
          </h1>
          <SnakeGame />
        </div>
      </main>
    </ErrorBoundary>
  );
}

