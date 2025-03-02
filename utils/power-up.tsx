export type PowerUpType = 'speed' | 'invincible' | 'size';

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
  private pulsePhase: number = 0;
  private originalRadius: number;

  constructor(options: PowerUpOptions) {
    this.position = { x: options.x, y: options.y };
    this.type = options.type;
    this.radius = 15;
    this.originalRadius = this.radius;
    
    // Set properties based on type
    switch (this.type) {
      case 'speed':
        this.color = '#ff0';
        this.duration = 300; // 5 seconds at 60fps
        break;
      case 'invincible':
        this.color = '#f0f';
        this.duration = 420; // 7 seconds at 60fps
        break;
      case 'size':
        this.color = '#0ff';
        this.duration = 600; // 10 seconds at 60fps
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

    this.pulsePhase += 0.1;
    this.radius = this.originalRadius + Math.sin(this.pulsePhase) * 2;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);

    // Add glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;

    // Draw power-up symbol based on type
    ctx.beginPath();
    switch (this.type) {
      case 'speed':
        this.drawLightningBolt(ctx);
        break;
      case 'invincible':
        this.drawShield(ctx);
        break;
      case 'size':
        this.drawSizeSymbol(ctx);
        break;
    }

    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  private drawLightningBolt(ctx: CanvasRenderingContext2D) {
    const size = this.radius;
    ctx.moveTo(-size/2, -size/2);
    ctx.lineTo(0, -size/4);
    ctx.lineTo(-size/4, 0);
    ctx.lineTo(size/2, size/2);
  }

  private drawShield(ctx: CanvasRenderingContext2D) {
    const size = this.radius;
    // Draw shield shape
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.moveTo(0, -size/2);
    ctx.lineTo(size/2, size/2);
    ctx.lineTo(-size/2, size/2);
    ctx.closePath();
  }

  private drawSizeSymbol(ctx: CanvasRenderingContext2D) {
    const size = this.radius;
    // Draw expand arrows
    ctx.moveTo(-size/2, 0);
    ctx.lineTo(size/2, 0);
    ctx.moveTo(size/3, -size/3);
    ctx.lineTo(size/2, 0);
    ctx.lineTo(size/3, size/3);
    ctx.moveTo(-size/3, -size/3);
    ctx.lineTo(-size/2, 0);
    ctx.lineTo(-size/3, size/3);
  }

  applyEffect(snake: Snake): void {
    snake.applyPowerUp(this.type, this.duration);
  }
} 