"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type AIBehaviorType, AI_BEHAVIORS } from "@/utils/ai-behaviors";
import { NeonSlider } from "@/components/ui/neon-slider";

interface GameSetupProps {
  onStart: (config: GameConfig) => void;
}

export interface GameConfig {
  aiCount: number;
  aiBehaviors: AIBehaviorType[];
}

export function GameSetup({ onStart }: GameSetupProps) {
  const [aiCount, setAICount] = useState(3);
  const [selectedBehaviors, setSelectedBehaviors] = useState<AIBehaviorType[]>(
    Array(10).fill('survivor')
  );

  const handleBehaviorChange = (index: number, behavior: AIBehaviorType) => {
    const newBehaviors = [...selectedBehaviors];
    newBehaviors[index] = behavior;
    setSelectedBehaviors(newBehaviors);
  };

  const handleStart = () => {
    onStart({
      aiCount,
      aiBehaviors: selectedBehaviors.slice(0, aiCount),
    });
  };

  const getBehaviorColor = (behavior: AIBehaviorType): "cyan" | "purple" | "blue" | "green" | "pink" => {
    const colorMap: Record<string, "cyan" | "purple" | "blue" | "green" | "pink"> = {
      survivor: "cyan",
      aggressive: "pink",
      territorial: "purple",
      hunter: "green",
      mixed: "blue",
    }
    return colorMap[behavior] || "cyan"
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-6 bg-black bg-opacity-90 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)]">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 animate-pulse drop-shadow-[0_0_15px_rgba(6,182,212,0.7)] font-orbitron">
            SNAPDRAGON
          </h1>
          <h2 className="text-2xl text-cyan-400 font-orbitron">Game Settings</h2>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <div className="w-full max-w-md space-y-4">
            <p className="text-center text-cyan-400 font-orbitron text-xl">
              Number of AI Opponents
            </p>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <input
                type="range"
                min={1}
                max={10}
                value={aiCount}
                onChange={(e) => setAICount(parseInt(e.target.value))}
                className="w-full h-full appearance-none bg-gradient-to-r from-cyan-500 to-purple-600 cursor-pointer"
                style={{
                  boxShadow: "0 0 10px rgba(6,182,212,0.5)",
                }}
              />
            </div>
            <div className="flex justify-center space-x-4">
              {[1, 2, 3, 4].map(num => (
                <span key={num} className={`text-sm ${aiCount === num ? 'text-cyan-400' : 'text-cyan-400/50'} font-orbitron`}>
                  {num}
                </span>
              ))}
            </div>
          </div>

          <div className="w-full space-y-6">
            {Array.from({ length: aiCount }).map((_, index) => (
              <Card
                key={index}
                glowColor={getBehaviorColor(selectedBehaviors[index])}
                intensity="low"
                variant="outline"
                className="overflow-hidden bg-black/30 max-w-2xl mx-auto"
              >
                <CardHeader className="p-4 border-b border-cyan-500/10">
                  <CardTitle className="text-lg font-orbitron flex items-center justify-between text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                    <span>AI Snake {index + 1}</span>
                    <span className="text-sm px-3 py-1 rounded-full bg-black/40 border border-cyan-500/20">
                      {AI_BEHAVIORS[selectedBehaviors[index]]?.name || "Unknown"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(AI_BEHAVIORS).map(([key, behavior]) => (
                      <Button
                        key={key}
                        variant={selectedBehaviors[index] === key ? "default" : "outline"}
                        color={getBehaviorColor(key as AIBehaviorType)}
                        glow={selectedBehaviors[index] === key ? "high" : "low"}
                        className="w-full py-4 text-base font-orbitron rounded-lg transition-all duration-300 bg-black/50"
                        onClick={() => handleBehaviorChange(index, key as AIBehaviorType)}
                      >
                        {behavior.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            color="gradient"
            glow="high"
            size="lg"
            className="w-full max-w-md py-6 text-lg font-bold tracking-wider font-orbitron mt-8"
            onClick={handleStart}
          >
            START GAME
          </Button>

          <div className="text-center text-cyan-400/70 text-sm space-y-2 font-orbitron mt-8">
            <p>Use ARROW KEYS or WASD to control</p>
            <p>Press UP or W for speed boost</p>
            <p>Press ESC to pause</p>
          </div>
        </div>
      </div>
    </div>
  );
} 