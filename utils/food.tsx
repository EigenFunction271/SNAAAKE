interface FoodOptions {
  x: number;
  y: number;
  type: 'regular' | 'special';
}

export class Food {
  position: { x: number; y: number };
  type: 'regular' | 'special';
  radius: number;
  color: string;
  value: number;
  pulseAmount: number = 0;
  pulseDirection: number = 1;

  constructor(options: FoodOptions) {
    this.position = { x: options.x, y: options.y };
    this.type = options.type;
    
    if (this.type === 'special') {
      this.radius = 15;
      this.color = '#f0f';
      this.value = 3;
    } else {
      this.radius = 12;
      this.color = '#0ff';
      this.value = 1;
    }
  }

  update(): void {
    // Pulsing animation
    this.pulseAmount += 0.1 * this.pulseDirection;
    if (this.pulseAmount > 1) this.pulseDirection = -1;
    if (this.pulseAmount < 0) this.pulseDirection = 1;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const pulseScale = 1 + this.pulseAmount * 0.2;
    
    ctx.beginPath();
    ctx.arc(
      this.position.x,
      this.position.y,
      this.radius * pulseScale,
      0,
      Math.PI * 2
    );
    
    // Gradient fill
    const gradient = ctx.createRadialGradient(
      this.position.x,
      this.position.y,
      0,
      this.position.x,
      this.position.y,
      this.radius * pulseScale
    );
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(1, this.color);
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
