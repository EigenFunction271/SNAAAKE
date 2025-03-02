import { Food } from './food';

export class SnakeRemains extends Food {
  private pulsePhase: number = 0;
  private originalRadius: number;
  public scoreValue: number;

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
    this.radius = 20; // Larger than normal food
    this.originalRadius = this.radius;
    this.scoreValue = options.scoreValue;
  }

  update() {
    // Pulsing animation
    this.pulsePhase += 0.1;
    this.radius = this.originalRadius + Math.sin(this.pulsePhase) * 3;
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Glow effect
    ctx.save();
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

    ctx.restore();
  }
} 