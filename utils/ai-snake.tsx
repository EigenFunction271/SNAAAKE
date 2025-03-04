import { Snake } from './snake';
import { Food } from './food';
import { PowerUp } from './power-up';
import { AIBehaviorType, AI_BEHAVIORS, AIBehaviorRule } from './ai-behaviors';

interface AISnakeOptions {
  x: number;
  y: number;
  color: string;
  headColor: string;
  initialLength: number;
  initialAngle: number;
  speed: number;
  behavior: AIBehaviorType;
}

export class AISnake extends Snake {
  private behavior: Exclude<AIBehaviorType, 'mixed'>;
  private targetAngle: number = 0;
  private territoryCenter?: { x: number; y: number };
  private score: number = 0;
  private behaviorTimer: number = 0;
  private readonly BEHAVIOR_SWITCH_INTERVAL = 600; // 10 seconds at 60fps
  private originalBehavior: AIBehaviorType;  // Store the original behavior

  constructor(options: AISnakeOptions) {
    super(options);
    this.originalBehavior = options.behavior;  // Save original behavior
    this.behavior = options.behavior === 'mixed' 
      ? this.getRandomBehavior()
      : options.behavior;
    
    if (this.behavior === 'territorial') {
      this.territoryCenter = { x: options.x, y: options.y };
    }
  }

  private getRandomBehavior(): Exclude<AIBehaviorType, 'mixed'> {
    const behaviors: Exclude<AIBehaviorType, 'mixed'>[] = [
      'hunter', 'survivor', 'collector', 'territorial', 'aggressive', 'passive'
    ];
    return behaviors[Math.floor(Math.random() * behaviors.length)];
  }

  updateAI(
    food: Food[],
    playerSnake: Snake | null,
    otherSnakes: AISnake[],
    powerUps: PowerUp[],
    canvasWidth: number,
    canvasHeight: number
  ): void {
    // For mixed behavior, we need to check the original options
    if (this.originalBehavior === 'mixed') {
      this.behaviorTimer++;
      if (this.behaviorTimer >= this.BEHAVIOR_SWITCH_INTERVAL) {
        this.behavior = this.getRandomBehavior();
        this.behaviorTimer = 0;
        console.log('Switching behavior to:', this.behavior);
      }
    }

    // Apply behavior rules
    const rules = AI_BEHAVIORS[this.behavior];
    this.currentSpeed = this.baseSpeed * rules.speed;
    this.turningSpeed = 0.1 * rules.turnRate;

    // Execute current behavior
    switch (this.behavior) {
      case 'hunter':
        this.hunterBehavior(food, playerSnake, otherSnakes, rules);
        break;
      case 'survivor':
        this.survivorBehavior(food, playerSnake, otherSnakes, rules);
        break;
      case 'collector':
        this.collectorBehavior(food, playerSnake, otherSnakes, rules);
        break;
      case 'territorial':
        this.territorialBehavior(food, playerSnake, otherSnakes, canvasWidth, canvasHeight, rules);
        break;
      case 'aggressive':
        this.aggressiveBehavior(playerSnake, otherSnakes, rules);
        break;
      case 'passive':
        this.passiveBehavior(food, playerSnake, otherSnakes, rules);
        break;
    }
  }

  private hunterBehavior(
    food: Food[],
    playerSnake: Snake | null,
    otherSnakes: AISnake[],
    rules: AIBehaviorRule
  ): void {
    const head = this.getHead();
    let target = null;
    let targetDistance = Infinity;

    // Look for closest snake to hunt
    if (playerSnake) {
      const distance = Math.hypot(
        playerSnake.getHead().x - head.x,
        playerSnake.getHead().y - head.y
      );
      if (distance < targetDistance) {
        target = playerSnake;
        targetDistance = distance;
      }
    }

    otherSnakes.forEach(snake => {
      const distance = Math.hypot(
        snake.getHead().x - head.x,
        snake.getHead().y - head.y
      );
      if (distance < targetDistance) {
        target = snake;
        targetDistance = distance;
      }
    });

    // If no snakes nearby or occasionally look for food based on foodPriority
    if (!target || Math.random() < rules.foodPriority) {
      const nearestFood = this.findNearestFood(food);
      if (nearestFood) {
        this.moveTowards(nearestFood.position);
        return;
      }
    }

    if (target) {
      this.moveTowards(target.getHead());
      if (targetDistance < 150) this.boost();
    }
  }

  private survivorBehavior(
    food: Food[],
    playerSnake: Snake | null,
    otherSnakes: AISnake[],
    rules: AIBehaviorRule
  ): void {
    const head = this.getHead();
    const nearbyThreats = this.findNearbyThreats(playerSnake, otherSnakes, 200);
    
    if (nearbyThreats.length > 0) {
      // Run away from threats
      const avgThreatX = nearbyThreats.reduce((sum, t) => sum + t.x, 0) / nearbyThreats.length;
      const avgThreatY = nearbyThreats.reduce((sum, t) => sum + t.y, 0) / nearbyThreats.length;
      
      // Move in opposite direction of threats
      this.moveTowards({
        x: head.x * 2 - avgThreatX,
        y: head.y * 2 - avgThreatY
      });
      this.boost();
    } else {
      // If safe, look for food
      const nearestFood = this.findNearestFood(food);
      if (nearestFood) {
        this.moveTowards(nearestFood.position);
      }
    }
  }

  private collectorBehavior(
    food: Food[],
    playerSnake: Snake | null,
    otherSnakes: AISnake[],
    rules: AIBehaviorRule
  ): void {
    const head = this.getHead();
    let bestTarget = null;
    let bestScore = -Infinity;

    // Evaluate each food item based on distance and safety
    food.forEach(f => {
      const distance = Math.hypot(f.position.x - head.x, f.position.y - head.y);
      let score = 1000 / distance; // Base score on distance

      // Reduce score if near threats
      const nearbyThreats = this.findNearbyThreats(playerSnake, otherSnakes, 150);
      nearbyThreats.forEach(threat => {
        const threatToFood = Math.hypot(f.position.x - threat.x, f.position.y - threat.y);
        score -= 500 / threatToFood;
      });

      if (score > bestScore) {
        bestScore = score;
        bestTarget = f;
      }
    });

    if (bestTarget) {
      this.moveTowards(bestTarget.position);
      // Boost if far from target and path seems safe
      if (bestScore < 5 && bestScore > 2) this.boost();
    }
  }

  private territorialBehavior(
    food: Food[],
    playerSnake: Snake | null,
    otherSnakes: AISnake[],
    canvasWidth: number,
    canvasHeight: number,
    rules: AIBehaviorRule
  ): void {
    const head = this.getHead();
    
    // Initialize territory center if not set
    if (!this.territoryCenter) {
      this.territoryCenter = { x: head.x, y: head.y };
    }

    const distanceToCenter = Math.hypot(
      head.x - this.territoryCenter.x,
      head.y - this.territoryCenter.y
    );

    // If too far from territory, return to it
    if (distanceToCenter > rules.territoryRadius) {
      this.moveTowards(this.territoryCenter);
      this.boost();
      return;
    }

    // Check for intruders in territory
    const intruders = this.findNearbyThreats(playerSnake, otherSnakes, rules.territoryRadius);
    if (intruders.length > 0) {
      // Chase closest intruder
      const closest = intruders[0];
      this.moveTowards(closest);
      if (Math.hypot(closest.x - head.x, closest.y - head.y) < 100) {
        this.boost();
      }
    } else {
      // Collect food in territory
      const nearestFood = this.findNearestFood(food);
      if (nearestFood) {
        this.moveTowards(nearestFood.position);
      }
    }
  }

  private aggressiveBehavior(
    playerSnake: Snake | null,
    otherSnakes: AISnake[],
    rules: AIBehaviorRule
  ): void {
    const head = this.getHead();
    let nearestTarget = null;
    let shortestDistance = Infinity;

    // Always target the nearest snake
    if (playerSnake) {
      const playerHead = playerSnake.getHead();
      const distance = Math.hypot(playerHead.x - head.x, playerHead.y - head.y);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestTarget = playerHead;
      }
    }

    otherSnakes.forEach(snake => {
      const snakeHead = snake.getHead();
      const distance = Math.hypot(snakeHead.x - head.x, snakeHead.y - head.y);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestTarget = snakeHead;
      }
    });

    if (nearestTarget) {
      this.moveTowards(nearestTarget);
      // Boost when close to target
      if (shortestDistance < 150) this.boost();
    }
  }

  private passiveBehavior(
    food: Food[],
    playerSnake: Snake | null,
    otherSnakes: AISnake[],
    rules: AIBehaviorRule
  ): void {
    const head = this.getHead();
    const nearbyThreats = this.findNearbyThreats(playerSnake, otherSnakes, 150);

    if (nearbyThreats.length > 0) {
      // Run away from threats
      const avgThreatX = nearbyThreats.reduce((sum, t) => sum + t.x, 0) / nearbyThreats.length;
      const avgThreatY = nearbyThreats.reduce((sum, t) => sum + t.y, 0) / nearbyThreats.length;
      
      this.moveTowards({
        x: head.x * 2 - avgThreatX,
        y: head.y * 2 - avgThreatY
      });
      this.boost();
    } else {
      // Look for safest food
      const nearestFood = this.findNearestFood(food);
      if (nearestFood) {
        this.moveTowards(nearestFood.position);
      }
    }
  }

  // Helper methods
  private moveTowards(target: { x: number; y: number }): void {
    const head = this.getHead();
    const dx = target.x - head.x;
    const dy = target.y - head.y;
    const targetAngle = Math.atan2(dy, dx);
    
    const angleDiff = targetAngle - this.angle;
    const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
    
    if (normalizedDiff > 0.1) {
      this.turnRight();
    } else if (normalizedDiff < -0.1) {
      this.turnLeft();
    }
  }

  private findNearbyThreats(
    playerSnake: Snake | null,
    otherSnakes: AISnake[],
    radius: number
  ): Array<{x: number, y: number}> {
    const threats = [];
    const head = this.getHead();

    if (playerSnake) {
      const playerHead = playerSnake.getHead();
      if (Math.hypot(playerHead.x - head.x, playerHead.y - head.y) < radius) {
        threats.push(playerHead);
      }
    }

    otherSnakes.forEach(snake => {
      if (snake !== this) {
        const snakeHead = snake.getHead();
        if (Math.hypot(snakeHead.x - head.x, snakeHead.y - head.y) < radius) {
          threats.push(snakeHead);
        }
      }
    });

    return threats;
  }

  private findNearestFood(food: Food[]): Food | null {
    let nearest: Food | null = null;
    let minDistance = Infinity;
    const head = this.getHead();

    for (const f of food) {
      const distance = Math.hypot(
        f.position.x - head.x,
        f.position.y - head.y
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = f;
      }
    }

    return nearest;
  }

  checkCollisionWith(point: { x: number; y: number; radius: number }): boolean {
    return super.checkCollisionWithPoint(point);
  }

  grow(amount: number) {
    super.grow(amount);
    this.score += amount * 10; // Increase score when growing
  }

  getScore(): number {
    return this.score;
  }
}

