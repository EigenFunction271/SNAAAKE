export type PowerUpType = 'speed' | 'invulnerability' | 'ghost';

interface PowerUpOptions {
  x: number;
  y: number;
  type: PowerUpType;
}

export class PowerUp {
  position: { x: number; y: number };
  type: PowerUpType;
  radius: number = 15;
  duration: number;
  color: string;
  pulseAmount: number = 0;
  pulseDirection: number = 1;
  rotation: number = 0;

  constructor(options: PowerUpOptions) {
    this.position = { x: options.x, y: options.y };
    this.type = options.type;
    
    // Set properties based on type
    switch (this.type) {
      case 'speed':
        this.color = '#ff0';
        this.duration = 5000; // 5 seconds
        break;
      case 'invulnerability':
        this.color = '#f0f';
        this.duration = 7000; // 7 seconds
        break;
      case 'ghost':
        this.color = '#0ff';
        this.duration = 10000; // 10 seconds
        break;
    }
  }

  update(): void {
    // Update pulse effect
    this.pulseAmount += 0.05 * this.pulseDirection;
    if (this.pulseAmount > 1) this.pulseDirection = -1;
    if (this.pulseAmount < 0) this.pulseDirection = 1;

    // Update rotation
    this.rotation += 0.03;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);

    const pulseScale = 1 + this.pulseAmount * 0.2;
    const size = this.radius * pulseScale;

    // Draw power-up symbol based on type
    ctx.beginPath();
    switch (this.type) {
      case 'speed':
        this.drawLightning(ctx, size);
        break;
      case 'invulnerability':
        this.drawShield(ctx, size);
        break;
      case 'ghost':
        this.drawGhost(ctx, size);
        break;
    }

    // Add glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  private drawLightning(ctx: CanvasRenderingContext2D, size: number): void {
    // Lightning bolt shape
    ctx.moveTo(-size/2, -size/2);
    ctx.lineTo(0, 0);
    ctx.lineTo(-size/4, size/2);
    ctx.lineTo(size/2, -size/2);
  }

  private drawShield(ctx: CanvasRenderingContext2D, size: number): void {
    // Shield shape
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
  }

  private drawGhost(ctx: CanvasRenderingContext2D, size: number): void {
    // Ghost shape
    ctx.arc(0, -size/4, size/2, Math.PI, Math.PI * 2);
    ctx.lineTo(size/2, size/2);
    ctx.lineTo(-size/2, size/2);
    ctx.closePath();
  }

  applyEffect(snake: Snake): void {
    switch (this.type) {
      case 'speed':
        snake.speed *= 1.5;
        setTimeout(() => { snake.speed = snake.baseSpeed; }, this.duration);
        break;
      case 'invulnerability':
        snake.isInvulnerable = true;
        setTimeout(() => { snake.isInvulnerable = false; }, this.duration);
        break;
      case 'ghost':
        snake.isGhost = true;
        setTimeout(() => { snake.isGhost = false; }, this.duration);
        break;
    }
  }
} 