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
    this.pulsePhase += 0.1;
    this.radius = this.originalRadius + Math.sin(this.pulsePhase) * 2;

    // Update rotation
    this.rotation += 0.03;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);

    // Enhanced glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20;

    // Draw outer ring
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw power-up symbol
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

    // Fill with semi-transparent color
    ctx.fillStyle = `${this.color}88`; // Add transparency
    ctx.fill();

    // Add text label
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.type.toUpperCase(), 0, this.radius + 20);

    ctx.restore();
  }

  private drawLightningBolt(ctx: CanvasRenderingContext2D) {
    const size = this.radius;
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fff';
    
    ctx.moveTo(-size/2, -size/2);
    ctx.lineTo(0, -size/4);
    ctx.lineTo(-size/4, 0);
    ctx.lineTo(size/2, size/2);
    ctx.stroke(); // Add white outline
  }

  private drawShield(ctx: CanvasRenderingContext2D) {
    const size = this.radius;
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fff';
    
    // Shield shape
    ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
    ctx.moveTo(-size/2, 0);
    ctx.lineTo(size/2, 0);
    ctx.moveTo(0, -size/2);
    ctx.lineTo(0, size/2);
    ctx.stroke(); // Add white outline
  }

  private drawSizeSymbol(ctx: CanvasRenderingContext2D) {
    const size = this.radius;
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fff';
    
    // Expand arrows
    ctx.moveTo(-size/2, 0);
    ctx.lineTo(size/2, 0);
    ctx.moveTo(size/3, -size/3);
    ctx.lineTo(size/2, 0);
    ctx.lineTo(size/3, size/3);
    ctx.moveTo(-size/3, -size/3);
    ctx.lineTo(-size/2, 0);
    ctx.lineTo(-size/3, size/3);
    ctx.stroke(); // Add white outline
  }

  applyEffect(snake: Snake): void {
    snake.applyPowerUp(this.type, this.duration);
  }
} 