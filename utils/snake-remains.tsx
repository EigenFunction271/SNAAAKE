import { Food } from './food';

export class SnakeRemains extends Food {
  private pulsePhase: number = 0;
  private originalRadius: number;
  public scoreValue: number;
  private lifetime: number = 600; // 10 seconds at 60fps

  constructor(options: {
    x: number;
    y: number;
    color: string;
    scoreValue: number;
  }) {
    super({
      x: options.x,
      y: options.y,
      type: 'special',
    });

    this.color = options.color;
    this.radius = 20;
    this.originalRadius = this.radius;
    this.scoreValue = options.scoreValue;
  }

  update() {
    // Pulsing animation
    this.pulsePhase += 0.1;
    this.radius = this.originalRadius + Math.sin(this.pulsePhase) * 3;
    
    // Decrease lifetime
    this.lifetime--;
    
    return this.lifetime > 0; // Return false when expired
  }

  draw(ctx: CanvasRenderingContext2D) {
    const alpha = Math.min(1, this.lifetime / 60); // Fade out in last second
    
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // Outer glow
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20;

    // Main circle
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    // Inner circle
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Score text
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText(`+${this.scoreValue}`, this.position.x, this.position.y + 5);

    ctx.restore();
  }

  public isExpired(): boolean {
    return this.lifetime <= 0;
  }
} 