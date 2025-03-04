"use client"

import React from 'react'
import SnakeGame from "@/components/game"
import { ErrorBoundary } from "@/utils/error-boundary"

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-black">
        <SnakeGame />
      </main>
    </ErrorBoundary>
  );
}

