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
    turningSpeed = 0.05
    color: string
    headColor: string
    targetLength: number
    history: { x: number; y: number }[] = []
    isInvulnerable: boolean = false
    isGhost: boolean = false
    activePowerUps: Map<PowerUpType, number> = new Map()
  
    constructor(options: SnakeOptions) {
      this.angle = options.initialAngle
      this.speed = options.speed
      this.baseSpeed = options.speed
      this.color = options.color
      this.headColor = options.headColor
  
      // Create head segment
      this.segments = [
        {
          x: options.x,
          y: options.y,
          radius: 10,
        },
      ]
  
      // Set initial target length
      this.targetLength = options.initialLength
  
      // Initialize velocity based on angle
      this.velocity = {
        x: Math.cos(this.angle) * this.speed,
        y: Math.sin(this.angle) * this.speed,
      }
  
      // Initialize history with head position
      for (let i = 0; i < 1000; i++) {
        this.history.push({ x: options.x, y: options.y })
      }
    }
  
    update(canvasWidth: number, canvasHeight: number) {
      // Update velocity based on current angle
      this.velocity = {
        x: Math.cos(this.angle) * this.speed,
        y: Math.sin(this.angle) * this.speed,
      }
  
      // Move head
      const head = this.segments[0]
      const newX = head.x + this.velocity.x
      const newY = head.y + this.velocity.y
  
      // Handle wrapping around edges (periodic boundary conditions)
      let wrappedX = newX
      let wrappedY = newY
  
      if (newX < 0) wrappedX = canvasWidth
      if (newX > canvasWidth) wrappedX = 0
      if (newY < 0) wrappedY = canvasHeight
      if (newY > canvasHeight) wrappedY = 0
  
      // Add new position to history
      this.history.unshift({ x: wrappedX, y: wrappedY })
      this.history = this.history.slice(0, 1000) // Limit history length
  
      // Update head position
      head.x = wrappedX
      head.y = wrappedY
  
      // Grow snake if needed
      this.grow(0)
    }
  
    draw(ctx: CanvasRenderingContext2D) {
      ctx.save()
      
      // Apply visual effects based on power-ups
      if (this.isInvulnerable) {
        ctx.shadowColor = '#f0f'
        ctx.shadowBlur = 20
      }
      
      if (this.isGhost) {
        ctx.globalAlpha = 0.6
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
      this.angle -= this.turningSpeed
    }
  
    turnRight() {
      this.angle += this.turningSpeed
    }
  
    boost() {
      this.speed = this.baseSpeed * 1.5
    }
  
    normalSpeed() {
      this.speed = this.baseSpeed
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
  
    checkCollisionWithPoint(point: { x: number; y: number; radius: number }) {
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
  }
  
  