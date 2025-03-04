interface ParticleSystemOptions {
  x: number;
  y: number;
  color: string;
  particleCount: number;
  lifetime: number;
  speed?: number;
  size?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export default class ParticleSystem {
  private particles: Particle[] = [];
  private lifetime: number;
  private size: number;

  constructor(options: ParticleSystemOptions) {
    this.lifetime = options.lifetime;
    this.size = options.size || 2;
    
    for (let i = 0; i < options.particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (options.speed || 2) * (0.5 + Math.random());
      
      this.particles.push({
        x: options.x,
        y: options.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: this.lifetime,
        color: options.color,
      });
    }
  }

  update(): void {
    for (const particle of this.particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const particle of this.particles) {
      const alpha = particle.life / this.lifetime;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  isDead(): boolean {
    return this.particles.every(p => p.life <= 0);
  }
}
