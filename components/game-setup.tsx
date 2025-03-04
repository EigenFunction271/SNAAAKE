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
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 animate-pulse drop-shadow-[0_0_15px_rgba(6,182,212,0.7)]">
            SNAPDRAGON
          </h1>
          <p className="text-cyan-400 text-xl tracking-wider uppercase">Configure Your Game</p>
        </div>

        <Card glowColor="cyan" intensity="medium" className="overflow-hidden">
          <CardHeader className="text-center border-b border-cyan-500/20">
            <CardTitle className="text-2xl">AI Opponents</CardTitle>
            <CardDescription>Select the number of AI snakes and their behaviors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-sm text-cyan-400">
                  Number of AI Opponents: {aiCount}
                </label>
                <NeonSlider
                  label={`Number of AI Snakes: ${aiCount}`}
                  value={[aiCount]}
                  onValueChange={([value]) => setAICount(value)}
                  min={1}
                  max={10}
                  step={1}
                  color="cyan"
                  showValue={true}
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm text-cyan-400">AI Behaviors</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: aiCount }).map((_, index) => (
                    <Card
                      key={index}
                      className="bg-black/30 border-cyan-500/20"
                    >
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm">
                          AI Snake {index + 1}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(AI_BEHAVIORS).map(([key, behavior]) => (
                            <Button
                              key={key}
                              variant={
                                selectedBehaviors[index] === key
                                  ? "default"
                                  : "outline"
                              }
                              className="w-full"
                              style={{
                                borderColor:
                                  selectedBehaviors[index] === key
                                    ? behavior.color
                                    : undefined,
                              }}
                              onClick={() =>
                                handleBehaviorChange(index, key as AIBehaviorType)
                              }
                            >
                              {behavior.name}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          color="gradient"
          glow="high"
          size="lg"
          className="w-full py-6 text-lg font-bold tracking-wider"
          onClick={handleStart}
        >
          START GAME
        </Button>
      </div>
    </div>
  );
} 