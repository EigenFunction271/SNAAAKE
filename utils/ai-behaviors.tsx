export type AIBehaviorType = 'hunter' | 'survivor' | 'collector' | 'territorial' | 'aggressive' | 'passive' | 'mixed';

interface AIBehaviorRule {
  name: string;
  description: string;
  color: string;
  headColor: string;
  speed: number;
  turnRate: number;
  aggressiveness: number;
  foodPriority: number;
  territoryRadius: number;
}

export const AI_BEHAVIORS: Record<Exclude<AIBehaviorType, 'mixed'>, AIBehaviorRule> = {
  hunter: {
    name: "Hunter",
    description: "Actively hunts other snakes while collecting food",
    color: "#ff4444",
    headColor: "#ff0000",
    speed: 1.2,
    turnRate: 1.1,
    aggressiveness: 0.8,
    foodPriority: 0.4,
    territoryRadius: 0,
  },
  survivor: {
    name: "Survivor",
    description: "Prioritizes survival and avoiding others",
    color: "#44ff44",
    headColor: "#00ff00",
    speed: 1.0,
    turnRate: 1.2,
    aggressiveness: 0.2,
    foodPriority: 0.6,
    territoryRadius: 0,
  },
  collector: {
    name: "Collector",
    description: "Focuses on collecting food efficiently",
    color: "#4444ff",
    headColor: "#0000ff",
    speed: 1.1,
    turnRate: 1.0,
    aggressiveness: 0.3,
    foodPriority: 0.9,
    territoryRadius: 0,
  },
  territorial: {
    name: "Territorial",
    description: "Guards its territory and food within it",
    color: "#ffff44",
    headColor: "#ffff00",
    speed: 1.0,
    turnRate: 1.0,
    aggressiveness: 0.6,
    foodPriority: 0.7,
    territoryRadius: 150,
  },
  aggressive: {
    name: "Aggressive",
    description: "Highly aggressive, prioritizes eliminating others",
    color: "#ff44ff",
    headColor: "#ff00ff",
    speed: 1.3,
    turnRate: 1.2,
    aggressiveness: 1.5,
    foodPriority: 0.3,
    territoryRadius: 0,
  },
  passive: {
    name: "Passive",
    description: "Avoids conflict, focuses on steady growth",
    color: "#44ffff",
    headColor: "#00ffff",
    speed: 0.9,
    turnRate: 0.9,
    aggressiveness: 0.1,
    foodPriority: 0.8,
    territoryRadius: 0,
  },
};

export const getRandomBehavior = (): Exclude<AIBehaviorType, 'mixed'> => {
  const behaviors = Object.keys(AI_BEHAVIORS) as Exclude<AIBehaviorType, 'mixed'>[];
  return behaviors[Math.floor(Math.random() * behaviors.length)];
}; 