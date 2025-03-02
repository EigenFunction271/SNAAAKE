import { PowerUpType } from './power-up';
import { AudioSystem } from './audio-system';

interface PowerUp {
  type: PowerUpType;
  duration: number;
  applyEffect: (snake: Snake) => void;
}

// Snake segment interface
interface SnakeSegment {
    x: number
    y: number
    radius: number
  }
  
  // Snake options interface
  interface SnakeOptions {
    x: number
    y: number
    color: string
    headColor: string
    initialLength: number
    initialAngle: number
    speed: number
  }
  
  export class Snake {
    segments: SnakeSegment[] = []
    velocity = { x: 0, y: 0 }
    angle: number
    speed: number
    baseSpeed: number
    turningSpeed = 0.1
    color: string
    headColor: string
    targetLength: number
    history: { x: number; y: number }[] = []
    isInvulnerable: boolean = false
    isGhost: boolean = false
    activePowerUps: Map<PowerUpType, number> = new Map()
    protected isInvincible: boolean = false;
    private invincibleTimer: number = 0;
    private glowPhase: number = 0;
    protected baseSpeed: number;
    protected currentSpeed: number;
    protected baseSize: number = 12; // Base segment size
    private powerUpTimers: Map<PowerUpType, number> = new Map();
  
    constructor(options: SnakeOptions) {
      this.angle = options.initialAngle
      this.speed = options.speed
      this.baseSpeed = options.speed
      this.currentSpeed = options.speed
      this.color = options.color
      this.headColor = options.headColor
      this.targetLength = options.initialLength
  
      // Initialize first segment (head)
      this.segments.push({
        x: options.x,
        y: options.y,
        radius: 15  // Increased head radius for better collision detection
      })
  
      // Add initial body segments
      for (let i = 1; i < options.initialLength; i++) {
        this.segments.push({
          x: options.x - i * Math.cos(options.initialAngle) * 20,
          y: options.y - i * Math.sin(options.initialAngle) * 20,
          radius: 12  // Slightly larger body segments
        })
      }
  
      // Initialize history with head position
      for (let i = 0; i < 1000; i++) {
        this.history.push({ x: options.x, y: options.y })
      }
    }
  
    update(canvasWidth: number, canvasHeight: number) {
      // Update power-up timers
      this.powerUpTimers.forEach((timer, type) => {
        if (timer > 0) {
          this.powerUpTimers.set(type, timer - 1);
          if (this.powerUpTimers.get(type) <= 0) {
            this.removePowerUp(type);
          }
        }
      });

      // Update visual effects
      this.glowPhase += 0.1;

      // Update velocity based on current angle
      this.velocity = {
        x: Math.cos(this.angle) * this.speed,
        y: Math.sin(this.angle) * this.speed,
      }
  
      // Move head
      const head = this.segments[0];
      const newX = head.x + this.velocity.x;
      const newY = head.y + this.velocity.y;
  
      // Handle wrapping around edges
      let wrappedX = newX;
      let wrappedY = newY;
  
      if (wrappedX < 0) wrappedX = canvasWidth;
      if (wrappedX > canvasWidth) wrappedX = 0;
      if (wrappedY < 0) wrappedY = canvasHeight;
      if (wrappedY > canvasHeight) wrappedY = 0;
  
      // Update head position
      head.x = wrappedX;
      head.y = wrappedY;
  
      // Add new position to history
      this.history.unshift({ x: wrappedX, y: wrappedY });
      this.history = this.history.slice(0, 1000); // Keep last 1000 positions
  
      // Update body segments
      const spacing = 20; // Distance between segments
      for (let i = 1; i < this.segments.length; i++) {
        const segment = this.segments[i];
        const historyIndex = i * 5; // Use history to create smooth following
        
        if (this.history[historyIndex]) {
          segment.x = this.history[historyIndex].x;
          segment.y = this.history[historyIndex].y;
        }
      }
  
      // Update invincibility
      if (this.isInvincible) {
        this.invincibleTimer--;
        if (this.invincibleTimer <= 0) {
          this.isInvincible = false;
        }
      }
    }
  
    draw(ctx: CanvasRenderingContext2D) {
      ctx.save()
      
      // Apply visual effects based on active power-ups
      if (this.isInvincible) {
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20 + Math.sin(this.glowPhase) * 5;
      }
      
      if (this.isGhost) {
        ctx.globalAlpha = 0.6;
        ctx.shadowColor = '#0ff';
        ctx.shadowBlur = 15;
      }
  
      // Draw body segments
      for (let i = this.segments.length - 1; i > 0; i--) {
        const segment = this.segments[i]
  
        ctx.beginPath()
        ctx.arc(segment.x, segment.y, segment.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
  
        // Add glow effect
        ctx.shadowColor = this.color
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
      }
  
      // Draw head
      const head = this.segments[0]
      ctx.beginPath()
      ctx.arc(head.x, head.y, head.radius, 0, Math.PI * 2)
      ctx.fillStyle = this.headColor
      ctx.fill()
  
      // Add glow effect to head
      ctx.shadowColor = this.headColor
      ctx.shadowBlur = 15
      ctx.fill()
      ctx.shadowBlur = 0
  
      // Draw eyes
      const eyeOffset = 3
      const eyeRadius = 2
  
      // Calculate eye positions based on angle
      const leftEyeX = head.x + Math.cos(this.angle - 0.3) * eyeOffset
      const leftEyeY = head.y + Math.sin(this.angle - 0.3) * eyeOffset
      const rightEyeX = head.x + Math.cos(this.angle + 0.3) * eyeOffset
      const rightEyeY = head.y + Math.sin(this.angle + 0.3) * eyeOffset
  
      // Draw left eye
      ctx.beginPath()
      ctx.arc(leftEyeX, leftEyeY, eyeRadius, 0, Math.PI * 2)
      ctx.fillStyle = "#fff"
      ctx.fill()
  
      // Draw right eye
      ctx.beginPath()
      ctx.arc(rightEyeX, rightEyeY, eyeRadius, 0, Math.PI * 2)
      ctx.fillStyle = "#fff"
      ctx.fill()
  
      ctx.restore()
    }
  
    turnLeft() {
      this.angle -= this.turningSpeed;
      console.log('Snake turning left:', {
        angle: this.angle,
        velocity: this.velocity,
        position: { x: this.segments[0].x, y: this.segments[0].y }
      });
    }
  
    turnRight() {
      this.angle += this.turningSpeed;
      console.log('Snake turning right:', {
        angle: this.angle,
        velocity: this.velocity,
        position: { x: this.segments[0].x, y: this.segments[0].y }
      });
    }
  
    boost() {
      this.speed = this.baseSpeed * 2;
      console.log('Snake boosting, speed:', this.speed);
    }
  
    normalSpeed() {
      this.speed = this.baseSpeed;
    }
  
    grow(amount: number) {
      // Increase target length
      this.targetLength += amount
  
      // Add segments if needed
      while (this.segments.length < this.targetLength) {
        const lastIndex = this.segments.length - 1
        const historyIndex = Math.min(lastIndex * 5, this.history.length - 1)
  
        // Get position from history
        const position = this.history[historyIndex]
  
        // Add new segment
        this.segments.push({
          x: position.x,
          y: position.y,
          radius: 8 - Math.min(3, this.segments.length * 0.1), // Gradually decrease size
        })
      }
    }
  
    getHead() {
      return this.segments[0]
    }
  
    checkSelfCollision() {
      const head = this.getHead()
  
      // Skip the first few segments to prevent false collisions
      for (let i = 10; i < this.segments.length; i++) {
        const segment = this.segments[i]
        const distance = Math.hypot(head.x - segment.x, head.y - segment.y)
  
        if (distance < head.radius + segment.radius * 0.5) {
          return true
        }
      }
  
      return false
    }
  
    checkCollisionWithPoint(point: { x: number; y: number; radius: number }): boolean {
      if (this.isInvincible || this.isGhost) return false;
      // Skip the head
      for (let i = 1; i < this.segments.length; i++) {
        const segment = this.segments[i]
        const distance = Math.hypot(point.x - segment.x, point.y - segment.y)
  
        if (distance < point.radius + segment.radius * 0.8) {
          return true
        }
      }
  
      return false
    }
  
    collectPowerUp(powerUp: PowerUp) {
      this.activePowerUps.set(powerUp.type, Date.now() + powerUp.duration)
      powerUp.applyEffect(this)
      AudioSystem.getInstance().playSound('powerup')
    }
  
    makeInvincible(duration: number) {
      this.isInvincible = true;
      this.invincibleTimer = duration;
    }
  
    // Power-up methods
    applyPowerUp(type: PowerUpType, duration: number) {
      switch (type) {
        case 'speed':
          this.currentSpeed = this.baseSpeed * 1.5;
          break;
        case 'invincible':
          this.isInvincible = true;
          break;
        case 'size':
          this.grow(5); // Instant size increase
          break;
      }
      this.powerUpTimers.set(type, duration);
    }
  
    private removePowerUp(type: PowerUpType) {
      switch (type) {
        case 'speed':
          this.currentSpeed = this.baseSpeed;
          break;
        case 'invincible':
          this.isInvincible = false;
          break;
        case 'size':
          this.isGhost = false;
          break;
      }
      this.powerUpTimers.delete(type);
    }
  }
  
  