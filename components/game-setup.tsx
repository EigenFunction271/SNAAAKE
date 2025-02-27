import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AIBehaviorType, AI_BEHAVIORS } from "@/utils/ai-behaviors";

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

  return (
    <div className="w-full max-w-4xl p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
          NEON SNAKE
        </h1>
        <p className="text-cyan-400">Configure your game</p>
      </div>

      <Card className="bg-black/50 border-cyan-500/30">
        <CardHeader>
          <CardTitle>AI Opponents</CardTitle>
          <CardDescription>
            Select the number of AI snakes and their behaviors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm text-cyan-400">
                Number of AI Snakes: {aiCount}
              </label>
              <Slider
                value={[aiCount]}
                onValueChange={([value]) => setAICount(value)}
                min={1}
                max={10}
                step={1}
                className="w-full"
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
        className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
        size="lg"
        onClick={handleStart}
      >
        Start Game
      </Button>
    </div>
  );
} 