import { Snake } from './snake';
import { Food } from './food';
import { PowerUp } from './power-up';

interface AISnakeOptions {
  x: number;
  y: number;
  color: string;
  headColor: string;
  initialLength: number;
  initialAngle: number;
  speed: number;
  behavior: 'passive' | 'aggressive' | 'territorial';
}

export class AISnake extends Snake {
  private behavior: 'passive' | 'aggressive' | 'territorial';
  private targetAngle: number = 0;
  private territoryCenter?: { x: number; y: number };
  private score: number = 0;

  constructor(options: AISnakeOptions) {
    super(options);
    this.behavior = options.behavior;
    
    if (this.behavior === 'territorial') {
      this.territoryCenter = { x: options.x, y: options.y };
    }
  }

  updateAI(
    food: Food[],
    playerSnake: Snake | null,
    otherSnakes: AISnake[],
    powerUps: PowerUp[],
    canvasWidth: number,
    canvasHeight: number
  ): void {
    // Find closest food or power-up
    let closestTarget = null;
    let closestDistance = Infinity;
    let isTargetPowerUp = false;

    // Check food
    for (const f of food) {
      const distance = Math.hypot(
        this.getHead().x - f.position.x,
        this.getHead().y - f.position.y
      );
      if (distance < closestDistance) {
        closestDistance = distance;
        closestTarget = f;
        isTargetPowerUp = false;
      }
    }

    // Check power-ups (prioritize them over food)
    for (const p of powerUps) {
      const distance = Math.hypot(
        this.getHead().x - p.position.x,
        this.getHead().y - p.position.y
      );
      // Power-ups are more attractive than food
      if (distance * 0.7 < closestDistance) {
        closestDistance = distance;
        closestTarget = p;
        isTargetPowerUp = true;
      }
    }

    if (closestTarget) {
      // Calculate angle to target
      const dx = closestTarget.position.x - this.getHead().x;
      const dy = closestTarget.position.y - this.getHead().y;
      const targetAngle = Math.atan2(dy, dx);

      // Turn towards target
      const angleDiff = targetAngle - this.angle;
      const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));

      if (normalizedDiff > 0.1) {
        this.turnRight();
      } else if (normalizedDiff < -0.1) {
        this.turnLeft();
      }

      // Boost if target is far or if it's a power-up
      if (closestDistance > 100 || isTargetPowerUp) {
        this.boost();
      } else {
        this.normalSpeed();
      }
    }
  }

  private passiveBehavior(
    food: Food[],
    playerSnake: Snake | null,
    otherSnakes: AISnake[]
  ): void {
    // Find nearest food while avoiding others
    const nearestFood = this.findNearestFood(food);
    if (nearestFood) {
      this.targetAngle = Math.atan2(
        nearestFood.position.y - this.getHead().y,
        nearestFood.position.x - this.getHead().x
      );
    }

    // Avoid collisions
    this.avoidCollisions(playerSnake, otherSnakes);
  }

  private aggressiveBehavior(
    playerSnake: Snake | null,
    otherSnakes: AISnake[]
  ): void {
    if (playerSnake) {
      // Chase player
      const playerHead = playerSnake.getHead();
      this.targetAngle = Math.atan2(
        playerHead.y - this.getHead().y,
        playerHead.x - this.getHead().x
      );
    }
  }

  private territorialBehavior(
    food: Food[],
    playerSnake: Snake | null,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    if (!this.territoryCenter) {
      this.territoryCenter = {
        x: canvasWidth / 2,
        y: canvasHeight / 2
      };
    }

    // Stay in territory while collecting food
    const head = this.getHead();
    const distanceToCenter = Math.hypot(
      head.x - this.territoryCenter.x,
      head.y - this.territoryCenter.y
    );

    if (distanceToCenter > 150) {
      // Return to territory
      this.targetAngle = Math.atan2(
        this.territoryCenter.y - head.y,
        this.territoryCenter.x - head.x
      );
    } else {
      // Look for food within territory
      const nearbyFood = food.filter(f => 
        Math.hypot(
          f.position.x - this.territoryCenter!.x,
          f.position.y - this.territoryCenter!.y
        ) < 150
      );

      if (nearbyFood.length > 0) {
        const nearest = this.findNearestFood(nearbyFood);
        if (nearest) {
          this.targetAngle = Math.atan2(
            nearest.position.y - head.y,
            nearest.position.x - head.x
          );
        }
      }
    }
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

  private avoidCollisions(
    playerSnake: Snake | null,
    otherSnakes: AISnake[]
  ): void {
    const head = this.getHead();
    const avoidanceRadius = 100;
    let needsToAvoid = false;

    // Check player snake
    if (playerSnake) {
      const playerHead = playerSnake.getHead();
      if (Math.hypot(playerHead.x - head.x, playerHead.y - head.y) < avoidanceRadius) {
        this.targetAngle = Math.atan2(
          head.y - playerHead.y,
          head.x - playerHead.x
        );
        needsToAvoid = true;
      }
    }

    // Check other AI snakes
    if (!needsToAvoid) {
      for (const snake of otherSnakes) {
        const otherHead = snake.getHead();
        if (Math.hypot(otherHead.x - head.x, otherHead.y - head.y) < avoidanceRadius) {
          this.targetAngle = Math.atan2(
            head.y - otherHead.y,
            head.x - otherHead.x
          );
          needsToAvoid = true;
          break;
        }
      }
    }
  }

  private turnTowardsTarget(): void {
    const angleDiff = this.targetAngle - this.angle;
    const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
    
    if (normalizedDiff > 0.1) {
      this.turnRight();
    } else if (normalizedDiff < -0.1) {
      this.turnLeft();
    }
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
