"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RefreshCw } from "lucide-react"
import ParticleSystem from "@/utils/particle-system"
import { Snake } from "@/utils/snake"
import { Food } from "@/utils/food"
import { AISnake } from "@/utils/ai-snake"
import { SettingsManager } from "@/utils/settings"
import { AudioSystem } from "@/utils/audio-system"
import { PowerUp, type PowerUpType } from "@/utils/power-up"
import { AssetManager } from "@/utils/asset-manager"
import { Transitions } from "@/utils/transitions"
import { LoadingScreen } from "@/components/loading-screen"
import { TouchControls } from "@/components/touch-controls"
import { useMediaQuery } from "@/hooks/use-media-query"
import { type AIBehaviorType, AI_BEHAVIORS, getRandomBehavior } from "@/utils/ai-behaviors"
import { SnakeRemains } from "@/utils/snake-remains"
import { GameSetup } from "@/components/game-setup"

// Game states
type GameState = "menu" | "playing" | "paused" | "gameOver"

// Add these constants near the top of the component
const MIN_FOOD_COUNT = 3
const MAX_FOOD_COUNT = 15

// Add this constant at the top of the file with other constants
const BEHAVIOR_OPTIONS: AIBehaviorType[] = ["passive", "aggressive", "territorial", "mixed"]

// Add this type near the top with other types
type LeaderboardEntry = {
  name: string
  score: number
  isPlayer?: boolean
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<GameState>("menu")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Game loop reference to store animation frame ID
  const gameLoopRef = useRef<number>(0)

  // Game objects references
  const playerSnakeRef = useRef<Snake | null>(null)
  const foodRef = useRef<Food[]>([])
  const aiSnakesRef = useRef<AISnake[]>([])
  const particleSystemsRef = useRef<ParticleSystem[]>([])
  const powerUpsRef = useRef<PowerUp[]>([])
  const settingsRef = useRef<SettingsManager>(SettingsManager.getInstance())
  const audioRef = useRef<AudioSystem>(AudioSystem.getInstance())
  const assetManagerRef = useRef<AssetManager>(AssetManager.getInstance())

  // Input state
  const keysPressed = useRef<Set<string>>(new Set())

  // Canvas dimensions
  const [dimensions, setDimensions] = useState({
    width: 800, // Default size
    height: 600,
  })

  // Initialize dimensions on mount
  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      setDimensions({
        width: Math.max(800, Math.min(window.innerWidth * 0.9, 1600)),
        height: Math.max(600, Math.min(window.innerHeight * 0.8, 1000)),
      })
    }
  }, [])

  // Add responsive state
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [touchDirection, setTouchDirection] = useState({ x: 0, y: 0 })
  const [isBoosting, setIsBoosting] = useState(false)

  // Add at the top with other state
  const [aiSnakeCount, setAiSnakeCount] = useState(2)
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [aiBehavior, setAiBehavior] = useState<AIBehaviorType>("mixed")

  // Update the state to track individual snake behaviors
  const [aiSnakes, setAiSnakes] = useState<
    Array<{
      behavior: Exclude<AIBehaviorType, "mixed">
      color: string
    }>
  >([
    { behavior: "passive", color: "#0f0" },
    { behavior: "aggressive", color: "#f00" },
  ])

  // Add new state for remains
  const remainsRef = useRef<SnakeRemains[]>([])

  // Add this to the state declarations
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  // At the top of the component, add a ref to track the current score
  const currentScoreRef = useRef(0)

  // Modify the score state to update our ref
  useEffect(() => {
    currentScoreRef.current = score
    console.log("Score updated - State:", score, "Ref:", currentScoreRef.current)
  }, [score])

  // Initialize game
  useEffect(() => {
    console.log("Component mounted")
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = dimensions.width
    canvas.height = dimensions.height
    console.log("Canvas initialized:", { width: dimensions.width, height: dimensions.height })

    // Load high score from localStorage
    const savedHighScore = localStorage.getItem("snakeHighScore")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }

    // Load settings
    const settings = settingsRef.current.getSettings()

    // Start background music
    if (settings.soundEnabled) {
      audioRef.current.playMusic()
    }

    // Set up event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      console.log("Key pressed:", key)

      // Prevent default behavior for game control keys
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
        e.preventDefault()
        keysPressed.current.add(key)
      }

      // Game control keys
      if (key === "escape" && gameState === "playing") {
        setGameState("paused")
      } else if (key === "escape" && gameState === "paused") {
        setGameState("playing")
      } else if ((key === " " || key === "enter") && gameState === "menu") {
        startGame()
      } else if (key === "r" && gameState === "gameOver") {
        startGame()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      console.log("Key released:", key)
      keysPressed.current.delete(key)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    // Draw initial grid
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "#000"
      ctx.fillRect(0, 0, dimensions.width, dimensions.height)
      drawGrid(ctx)
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      cancelAnimationFrame(gameLoopRef.current)
    }
  }, [gameState])

  // Add loading effect
  useEffect(() => {
    const loadAssets = async () => {
      try {
        await assetManagerRef.current.loadAll()
        setLoading(false)
      } catch (error) {
        console.error("Failed to load assets:", error)
        // Handle error appropriately
      }
    }

    const updateProgress = () => {
      setLoadingProgress(assetManagerRef.current.getLoadingProgress())
      if (loading) {
        requestAnimationFrame(updateProgress)
      }
    }

    loadAssets()
    updateProgress()
  }, [])

  // Add to the top of the component
  useEffect(() => {
    console.log("Game state changed:", gameState)
  }, [gameState])

  // Start a new game
  const startGame = () => {
    console.log("Starting new game...", { aiSnakeCount, aiDifficulty })

    try {
      // Reset game objects
      playerSnakeRef.current = new Snake({
        x: dimensions.width / 2,
        y: dimensions.height / 2,
        color: "#0ff",
        headColor: "#f0f",
        initialLength: 5,
        initialAngle: Math.PI / 2,
        speed: 2.5,
        size: Math.min(dimensions.width, dimensions.height) / 50,
      })

      // Clear existing food
      foodRef.current = []

      // Spawn initial food
      for (let i = 0; i < 3; i++) {
        spawnFood()
      }
      console.log("Initial food spawned:", foodRef.current)

      // Initialize canvas dimensions
      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = dimensions.width
        canvas.height = dimensions.height
        console.log("Canvas dimensions set:", { width: dimensions.width, height: dimensions.height })
      }

      // Initialize AI snakes with individual settings
      aiSnakesRef.current = aiSnakes.map(({ behavior, color }) => {
        const speed = {
          easy: 1.2,
          medium: 1.5,
          hard: 1.8,
        }[aiDifficulty]

        return new AISnake({
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
          color: color,
          headColor: "#fff",
          initialLength: 3,
          initialAngle: Math.random() * Math.PI * 2,
          speed: speed + Math.random() * 0.3,
          behavior: behavior,
        })
      })
      console.log("AI snakes created:", aiSnakesRef.current)

      particleSystemsRef.current = []
      powerUpsRef.current = []

      // Reset score
      setScore(0)

      // Clear existing power-ups
      powerUpsRef.current = []

      // Spawn initial power-up
      spawnPowerUp()

      // Start game
      console.log("Setting game state to playing")
      setGameState("playing")

      // Add a small delay to ensure state is updated before starting game loop
      setTimeout(() => {
        console.log("Starting game loop")
        if (canvasRef.current) {
          gameLoopRef.current = requestAnimationFrame(gameLoop)
        }
      }, 0)

      // Play start sound
      audioRef.current.playSound("collect")
      console.log("Game started successfully")
    } catch (error) {
      console.error("Error in startGame:", error)
    }
  }

  // Main game loop
  const gameLoop = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (gameState === "playing") {
      console.log("Game loop tick - State score:", score, "Ref score:", currentScoreRef.current)
      inputSystem()
      physicsSystem()
      collisionSystem()
      aiSystem(ctx)
      updateLeaderboard()

      // Update power-ups
      powerUpsRef.current.forEach((powerUp) => powerUp.update())
      checkPowerUpCollisions()

      updateRemains()
      renderSystem(ctx)
      particleSystem(ctx)
      hudSystem(ctx)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }

  // 1. Rendering System
  const renderSystem = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, dimensions.width, dimensions.height)

    // Draw grid
    drawGrid(ctx)

    // Draw remains before snakes
    remainsRef.current.forEach((remains) => {
      remains.update() // Update animation
      remains.draw(ctx)
    })

    // Draw food
    foodRef.current.forEach((food) => food.draw(ctx))

    // Draw power-ups
    powerUpsRef.current.forEach((powerUp) => {
      powerUp.draw(ctx)
    })

    // Draw snakes
    if (playerSnakeRef.current) {
      playerSnakeRef.current.draw(ctx)
    }

    // Draw AI snakes
    for (const aiSnake of aiSnakesRef.current) {
      aiSnake.draw(ctx)
    }

    // Draw particles
    for (const particles of particleSystemsRef.current) {
      particles.draw(ctx)
    }
  }

  // 3. Physics System
  const physicsSystem = () => {
    // Update player snake
    if (playerSnakeRef.current) {
      playerSnakeRef.current.update(dimensions.width, dimensions.height)
    }

    // Update AI snakes
    for (const aiSnake of aiSnakesRef.current) {
      aiSnake.update(dimensions.width, dimensions.height)
    }

    // Update food animations
    for (const food of foodRef.current) {
      food.update()
    }

    // Update power-ups
    for (const powerUp of powerUpsRef.current) {
      powerUp.update()
    }

    // Update particles
    particleSystemsRef.current = particleSystemsRef.current.filter((system) => {
      system.update()
      return !system.isDead()
    })
  }

  // 4. Collision System
  const collisionSystem = () => {
    checkFoodCollisions()
    checkSnakeCollisions()
    checkPowerUpCollisions()
  }

  // 5. AI System
  const aiSystem = (ctx: CanvasRenderingContext2D) => {
    updateAISnakes(ctx)
  }

  // 6. Particle System
  const particleSystem = (ctx: CanvasRenderingContext2D) => {
    updateParticles(ctx)
  }

  // 7. HUD System
  const hudSystem = (ctx: CanvasRenderingContext2D) => {
    drawHUD(ctx)
  }

  // Draw grid lines for futuristic effect
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "rgba(0, 255, 255, 0.1)"
    ctx.lineWidth = 1

    // Scale grid size based on canvas dimensions
    const gridSize = Math.min(dimensions.width, dimensions.height) / 20

    // Vertical lines
    for (let x = 0; x <= dimensions.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, dimensions.height)
      ctx.stroke()
    }

    // Horizontal lines
    for (let y = 0; y <= dimensions.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(dimensions.width, y)
      ctx.stroke()
    }
  }

  // Update the inputSystem function
  const inputSystem = () => {
    if (!playerSnakeRef.current) return

    // Add touch controls handling
    if (isMobile) {
      if (touchDirection.x < 0) {
        playerSnakeRef.current.turnLeft()
      } else if (touchDirection.x > 0) {
        playerSnakeRef.current.turnRight()
      }
      if (isBoosting) {
        playerSnakeRef.current.boost()
      } else {
        playerSnakeRef.current.normalSpeed()
      }
    }

    // Debug current key state
    const currentKeys = Array.from(keysPressed.current)
    console.log("Input state:", {
      keys: currentKeys,
      left: keysPressed.current.has("a") || keysPressed.current.has("arrowleft"),
      right: keysPressed.current.has("d") || keysPressed.current.has("arrowright"),
      boost: keysPressed.current.has("w") || keysPressed.current.has("arrowup"),
    })

    // Stop automatic movement
    let movementMade = false

    // Handle keyboard controls
    if (keysPressed.current.has("a") || keysPressed.current.has("arrowleft")) {
      playerSnakeRef.current.turnLeft()
      movementMade = true
    }
    if (keysPressed.current.has("d") || keysPressed.current.has("arrowright")) {
      playerSnakeRef.current.turnRight()
      movementMade = true
    }
    if (keysPressed.current.has("w") || keysPressed.current.has("arrowup")) {
      playerSnakeRef.current.boost()
      movementMade = true
    } else {
      playerSnakeRef.current.normalSpeed()
    }

    // If no movement keys are pressed, maintain current direction
    if (!movementMade) {
      playerSnakeRef.current.normalSpeed()
    }
  }

  // Check for food collisions
  const checkFoodCollisions = () => {
    if (!playerSnakeRef.current) return

    const playerHead = playerSnakeRef.current.getHead()
    const initialFoodCount = foodRef.current.length

    foodRef.current = foodRef.current.filter((food) => {
      const distance = Math.hypot(playerHead.x - food.position.x, playerHead.y - food.position.y)

      if (distance < playerHead.radius + food.radius) {
        const scoreIncrease = food.type === "special" ? 30 : 10
        console.log("Food collision - Current scores:", {
          state: score,
          ref: currentScoreRef.current,
          increase: scoreIncrease,
        })

        setScore((prevScore) => {
          const newScore = prevScore + scoreIncrease
          console.log("Updating score to:", newScore)
          return newScore
        })

        // Create particle effect
        particleSystemsRef.current.push(
          new ParticleSystem({
            x: food.position.x,
            y: food.position.y,
            color: food.color,
            particleCount: Math.floor(Math.min(dimensions.width, dimensions.height) / 20),
            lifetime: 25,
            size: Math.min(dimensions.width, dimensions.height) / 150,
          }),
        )

        // Grow snake
        playerSnakeRef.current?.grow(food.value)

        // Play sound
        audioRef.current.playSound("collect")

        // Spawn new food
        spawnFood()

        return false // Remove food
      }
      return true
    })

    // Check remains collisions
    remainsRef.current = remainsRef.current.filter((remains) => {
      const distance = Math.hypot(playerHead.x - remains.position.x, playerHead.y - remains.position.y)

      if (distance < playerHead.radius + remains.radius) {
        // Update score based on remains value
        setScore((prevScore) => {
          const newScore = prevScore + remains.scoreValue
          if (newScore > highScore) {
            setHighScore(newScore)
            localStorage.setItem("snakeHighScore", newScore.toString())
          }
          return newScore
        })

        // Create special particle effect
        particleSystemsRef.current.push(
          new ParticleSystem({
            x: remains.position.x,
            y: remains.position.y,
            color: remains.color,
            particleCount: Math.floor(Math.min(dimensions.width, dimensions.height) / 20),
            lifetime: 40,
            speed: 2,
            size: Math.min(dimensions.width, dimensions.height) / 150,
          }),
        )

        // Grow snake proportionally to the score
        playerSnakeRef.current?.grow(Math.ceil(remains.scoreValue / 20))

        // Play special sound
        audioRef.current.playSound("collect")

        return false // Remove remains
      }
      return true // Keep remains
    })

    const finalFoodCount = foodRef.current.length
    if (initialFoodCount !== finalFoodCount) {
      console.log("Food count changed:", {
        before: initialFoodCount,
        after: finalFoodCount,
      })
    }
  }

  // Check for snake collisions
  const checkSnakeCollisions = () => {
    if (!playerSnakeRef.current) return

    const playerHead = playerSnakeRef.current.getHead()

    // Check collision with player's own body
    if (playerSnakeRef.current.checkSelfCollision()) {
      gameOver()
      return
    }

    // Check collision with AI snakes
    for (const aiSnake of aiSnakesRef.current) {
      // Player collision with AI snake
      if (aiSnake.checkCollisionWith(playerHead)) {
        gameOver()
        return
      }

      // AI snake head collision with player body
      const aiHead = aiSnake.getHead()
      if (playerSnakeRef.current.checkCollisionWithPoint(aiHead)) {
        createSnakeExplosion(aiSnake)
        removeAndRespawnAISnake(aiSnake)
        continue
      }

      // NEW: Check AI snake collisions with other AI snakes
      for (const otherAI of aiSnakesRef.current) {
        if (aiSnake === otherAI) continue // Skip self

        // Check if this AI snake's head hits other AI snake's body
        if (otherAI.checkCollisionWith(aiHead)) {
          console.log("AI snake collision detected")
          createSnakeExplosion(aiSnake)
          removeAndRespawnAISnake(aiSnake)
          break
        }

        // Check if other AI snake's head hits this AI snake's body
        const otherHead = otherAI.getHead()
        if (aiSnake.checkCollisionWith(otherHead)) {
          console.log("AI snake collision detected")
          createSnakeExplosion(otherAI)
          removeAndRespawnAISnake(otherAI)
          break
        }
      }
    }
  }

  // Helper function to create explosion effect
  const createSnakeExplosion = (snake: AISnake) => {
    particleSystemsRef.current.push(
      new ParticleSystem({
        x: snake.getHead().x,
        y: snake.getHead().y,
        color: snake.color,
        particleCount: Math.floor(Math.min(dimensions.width, dimensions.height) / 20),
        lifetime: 40,
        speed: 3,
        size: Math.min(dimensions.width, dimensions.height) / 150,
      }),
    )
  }

  // Helper function to remove and respawn AI snake
  const removeAndRespawnAISnake = (snake: AISnake) => {
    // Create remains at snake's head position
    const head = snake.getHead()
    const remains = new SnakeRemains({
      x: head.x,
      y: head.y,
      color: snake.color,
      scoreValue: snake.getScore(),
    })
    remainsRef.current.push(remains)

    // Remove the snake
    aiSnakesRef.current = aiSnakesRef.current.filter((s) => s !== snake)

    // Spawn new AI snake after delay
    setTimeout(() => {
      if (gameState === "playing") {
        spawnAISnake()
      }
    }, 5000)
  }

  // Update and draw AI snakes
  const updateAISnakes = (ctx: CanvasRenderingContext2D) => {
    for (const aiSnake of aiSnakesRef.current) {
      // Update AI behavior
      aiSnake.updateAI(
        foodRef.current,
        playerSnakeRef.current,
        aiSnakesRef.current.filter((snake) => snake !== aiSnake),
        powerUpsRef.current,
        dimensions.width,
        dimensions.height,
      )

      // Update position
      aiSnake.update(dimensions.width, dimensions.height)

      // Check for food collision
      const aiHead = aiSnake.getHead()
      foodRef.current = foodRef.current.filter((food) => {
        const distance = Math.hypot(aiHead.x - food.position.x, aiHead.y - food.position.y)

        if (distance < aiHead.radius + food.radius) {
          // Create particle effect
          particleSystemsRef.current.push(
            new ParticleSystem({
              x: food.position.x,
              y: food.position.y,
              color: food.color,
              particleCount: Math.floor(Math.min(dimensions.width, dimensions.height) / 20),
              lifetime: 25,
              size: Math.min(dimensions.width, dimensions.height) / 150,
            }),
          )

          // Grow snake
          aiSnake.grow(food.value)

          // Spawn new food
          spawnFood()

          return false // Remove this food
        }
        return true // Keep this food
      })

      // Check for power-up collisions
      powerUpsRef.current = powerUpsRef.current.filter((powerUp) => {
        const distance = Math.hypot(aiHead.x - powerUp.position.x, aiHead.y - powerUp.position.y)

        if (distance < aiHead.radius + powerUp.radius) {
          // Apply power-up effect
          powerUp.applyEffect(aiSnake)

          // Create particle effect
          particleSystemsRef.current.push(
            new ParticleSystem({
              x: powerUp.position.x,
              y: powerUp.position.y,
              color: powerUp.color,
              particleCount: Math.floor(Math.min(dimensions.width, dimensions.height) / 20),
              lifetime: 60,
              speed: 3,
              size: Math.min(dimensions.width, dimensions.height) / 150,
            }),
          )

          // Play sound
          audioRef.current.playSound("powerup")

          return false // Remove this power-up
        }
        return true // Keep this power-up
      })

      // Draw snake
      aiSnake.draw(ctx)
    }
  }

  // Spawn new food
  const spawnFood = () => {
    // Spawn 2-4 food items at once
    const foodCount = 2 + Math.floor(Math.random() * 3)

    for (let i = 0; i < foodCount; i++) {
      if (foodRef.current.length >= MAX_FOOD_COUNT) break

      // Random position away from snakes
      let validPosition = false
      let x, y
      let attempts = 0
      const maxAttempts = 10

      while (!validPosition && attempts < maxAttempts) {
        x = Math.random() * (dimensions.width - 40) + 20
        y = Math.random() * (dimensions.height - 40) + 20
        validPosition = true
        attempts++

        // Check distance from player snake
        if (playerSnakeRef.current) {
          const distance = Math.hypot(playerSnakeRef.current.getHead().x - x, playerSnakeRef.current.getHead().y - y)
          if (distance < 50) {
            validPosition = false
            continue
          }
        }

        // Check distance from AI snakes
        for (const aiSnake of aiSnakesRef.current) {
          const distance = Math.hypot(aiSnake.getHead().x - x, aiSnake.getHead().y - y)
          if (distance < 50) {
            validPosition = false
            break
          }
        }
      }

      // Create new food
      const newFood = new Food({
        x: x!,
        y: y!,
        type: Math.random() < 0.1 ? "special" : "regular",
      })

      foodRef.current.push(newFood)
    }
  }

  // Spawn new AI snake
  const spawnAISnake = () => {
    // Random position at the edge of the canvas
    let x, y, angle

    const side = Math.floor(Math.random() * 4)

    switch (side) {
      case 0: // Top
        x = Math.random() * dimensions.width
        y = 20
        angle = Math.PI / 2
        break
      case 1: // Right
        x = dimensions.width - 20
        y = Math.random() * dimensions.height
        angle = Math.PI
        break
      case 2: // Bottom
        x = Math.random() * dimensions.width
        y = dimensions.height - 20
        angle = -Math.PI / 2
        break
      case 3: // Left
        x = 20
        y = Math.random() * dimensions.height
        angle = 0
        break
    }

    // Random behavior
    const behaviors: ("passive" | "aggressive" | "territorial")[] = ["passive", "aggressive", "territorial"]
    const behavior = behaviors[Math.floor(Math.random() * behaviors.length)]

    // Random color (neon)
    const colors = ["#0f0", "#f00", "#ff0", "#f0f", "#0ff"]
    const color = colors[Math.floor(Math.random() * colors.length)]

    // Create new AI snake
    aiSnakesRef.current.push(
      new AISnake({
        x: x!,
        y: y!,
        color,
        headColor: "#fff",
        initialLength: 3,
        initialAngle: angle!,
        speed: 1.5 + Math.random() * 0.5,
        behavior,
      }),
    )
  }

  // Update and draw particle systems
  const updateParticles = (ctx: CanvasRenderingContext2D) => {
    particleSystemsRef.current = particleSystemsRef.current.filter((system) => {
      system.update()
      system.draw(ctx)
      return !system.isDead()
    })
  }

  // Draw HUD (score, etc.)
  const drawHUD = (ctx: CanvasRenderingContext2D) => {
    // Save context state
    ctx.save()

    // Draw score panel background with glow effect
    const gradient = ctx.createLinearGradient(10, 10, 210, 110)
    gradient.addColorStop(0, "rgba(8, 47, 73, 0.8)")
    gradient.addColorStop(1, "rgba(17, 24, 39, 0.8)")

    ctx.fillStyle = gradient
    ctx.shadowColor = "rgba(6, 182, 212, 0.5)"
    ctx.shadowBlur = 15
    ctx.beginPath()
    ctx.roundRect(10, 10, 200, 100, 10)
    ctx.fill()

    // Reset shadow for text
    ctx.shadowBlur = 0

    // Draw futuristic border
    ctx.strokeStyle = "rgba(6, 182, 212, 0.7)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(10, 10, 200, 100, 10)
    ctx.stroke()

    // Draw scores and stats with glow
    ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif'
    ctx.textAlign = "left"

    // Draw current score with glow
    ctx.fillStyle = "rgba(6, 182, 212, 0.3)"
    ctx.shadowColor = "rgba(6, 182, 212, 0.7)"
    ctx.shadowBlur = 8
    ctx.fillText(`SCORE: ${score}`, 20, 40)

    ctx.fillStyle = "#fff"
    ctx.shadowBlur = 0
    ctx.fillText(`SCORE: ${score}`, 20, 40)

    // Draw high score with glow
    ctx.fillStyle = "rgba(168, 85, 247, 0.3)"
    ctx.shadowColor = "rgba(168, 85, 247, 0.7)"
    ctx.shadowBlur = 8
    ctx.fillText(`HIGH: ${highScore}`, 20, 65)

    ctx.fillStyle = "#fff"
    ctx.shadowBlur = 0
    ctx.fillText(`HIGH: ${highScore}`, 20, 65)

    // AI Snake info with glow
    const aliveAI = aiSnakesRef.current.length
    const totalAI = aiSnakes.length

    ctx.fillStyle = "rgba(6, 182, 212, 0.3)"
    ctx.shadowColor = "rgba(6, 182, 212, 0.7)"
    ctx.shadowBlur = 8
    ctx.fillText(`AI: ${aliveAI}/${totalAI}`, 20, 90)

    ctx.fillStyle = "#fff"
    ctx.shadowBlur = 0
    ctx.fillText(`AI: ${aliveAI}/${totalAI}`, 20, 90)

    // Draw leaderboard
    if (leaderboard.length > 0) {
      const startY = 120;
      const lineHeight = 25;
      
      // Add gradient background for leaderboard
      const leaderboardHeight = lineHeight * leaderboard.length;
      const leaderboardGradient = ctx.createLinearGradient(10, startY - 15, 10, startY + leaderboardHeight);
      leaderboardGradient.addColorStop(0, "rgba(8, 47, 73, 0.6)");
      leaderboardGradient.addColorStop(1, "rgba(17, 24, 39, 0.6)");
      
      ctx.fillStyle = leaderboardGradient;
      ctx.beginPath();
      ctx.roundRect(10, startY - 15, 200, leaderboardHeight + 10, 5);
      ctx.fill();
      
      // Draw title
      ctx.fillStyle = "rgba(6, 182, 212, 0.8)";
      ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
      ctx.fillText("LEADERBOARD", 20, startY - 5);
      
      // Draw entries
      ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
      leaderboard.forEach((entry, index) => {
        const y = startY + 20 + (index * lineHeight);
        
        if (entry.isPlayer) {
          // Player entry highlight
          ctx.fillStyle = "rgba(6, 182, 212, 0.2)";
          ctx.fillRect(10, y - 15, 200, lineHeight);
          
          // Add glow effect
          ctx.shadowColor = "rgba(6, 182, 212, 0.5)";
          ctx.shadowBlur = 10;
        } else {
          ctx.shadowBlur = 0;
        }
        
        ctx.fillStyle = entry.isPlayer ? "#fff" : "rgba(255, 255, 255, 0.7)";
        ctx.fillText(
          `${index + 1}. ${entry.name}: ${entry.score}`,
          20,
          y
        );
      });
    }

    ctx.restore()
  }

  // Game over
  const gameOver = () => {
    setGameState("gameOver")
    cancelAnimationFrame(gameLoopRef.current)
    audioRef.current.playSound("gameover")

    // Create explosion effect at player head
    if (playerSnakeRef.current) {
      const head = playerSnakeRef.current.getHead()
      particleSystemsRef.current.push(
        new ParticleSystem({
          x: head.x,
          y: head.y,
          color: playerSnakeRef.current.headColor,
          particleCount: Math.floor(Math.min(dimensions.width, dimensions.height) / 16),
          lifetime: 60,
          speed: 3,
          size: Math.min(dimensions.width, dimensions.height) / 100,
        }),
      )
    }
  }

  // Update the renderMenu function
  const renderMenu = () => {
    return (
      <GameSetup
        onStart={(config) => {
          // Update AI settings based on config
          setAiSnakeCount(config.aiCount)
          setAiSnakes(
            config.aiBehaviors.map((behavior) => ({
              behavior: behavior as Exclude<AIBehaviorType, "mixed">,
              color: AI_BEHAVIORS[behavior].color,
            }))
          )
          // Start the game
          startGame()
        }}
      />
    )
  }

  // Now let's update the pause screen with the same aesthetic
  const renderPauseScreen = () => {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-10">
        <h2 className="text-4xl font-bold mb-8 text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.7)]">PAUSED</h2>
        <div className="space-y-4 w-64">
          <Button
            className="w-full py-5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.7)] transition-all duration-300 border border-cyan-400/30"
            onClick={() => {
              setGameState("playing")
              gameLoopRef.current = requestAnimationFrame(gameLoop)
            }}
          >
            <Play className="mr-2 h-4 w-4" />
            RESUME
          </Button>
          <Button
            variant="outline"
            className="w-full py-5 border-cyan-500 text-cyan-400 hover:bg-cyan-950/50 shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-300"
            onClick={() => setGameState("menu")}
          >
            MAIN MENU
          </Button>
        </div>
      </div>
    )
  }

  // Update the game over screen with the same aesthetic
  const renderGameOverScreen = () => {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-10">
        <h2 className="text-5xl font-bold mb-2 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse">
          GAME OVER
        </h2>
        <p className="text-3xl mb-8 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.7)]">SCORE: {score}</p>
        <div className="space-y-4 w-64">
          <Button
            className="w-full py-5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.7)] transition-all duration-300 border border-cyan-400/30"
            onClick={startGame}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            PLAY AGAIN
          </Button>
          <Button
            variant="outline"
            className="w-full py-5 border-cyan-500 text-cyan-400 hover:bg-cyan-950/50 shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-300"
            onClick={() => setGameState("menu")}
          >
            MAIN MENU
          </Button>
        </div>
      </div>
    )
  }

  // Update the game controls with the same aesthetic
  const renderGameControls = () => {
    if (gameState !== "playing") return null

    return (
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="icon"
          className="border-cyan-500 text-cyan-400 hover:bg-cyan-950/50 shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-300"
          onClick={() => {
            setGameState("paused")
            cancelAnimationFrame(gameLoopRef.current)
          }}
        >
          <Pause className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Update the showPopupText function to make it more sci-fi and glowy
  const showPopupText = (text: string, x: number, y: number, color: string) => {
    let opacity = 1
    let yOffset = 0
    let scale = 1

    const animate = () => {
      const ctx = canvasRef.current?.getContext("2d")
      if (!ctx || opacity <= 0) return

      ctx.save()
      ctx.globalAlpha = opacity
      ctx.font = `bold ${20 * scale}px "Segoe UI", Arial, sans-serif`

      // Create glow effect
      ctx.shadowColor = color
      ctx.shadowBlur = 15
      ctx.fillStyle = color
      ctx.textAlign = "center"

      // Draw text with glow
      ctx.fillText(text, x, y - yOffset)

      // Draw outline
      ctx.lineWidth = 1
      ctx.strokeStyle = "#fff"
      ctx.strokeText(text, x, y - yOffset)

      ctx.restore()

      opacity -= 0.015
      yOffset += 1.2
      scale += 0.01

      requestAnimationFrame(animate)
    }

    animate()
  }

  // Update state transitions
  const changeGameState = async (newState: GameState) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Exit transition
    await Transitions.fade(ctx, "out", 300)

    setGameState(newState)

    // Enter transition
    await Transitions.fade(ctx, "in", 300)
  }

  // Handle touch controls
  const handleDirectionChange = (direction: { x: number; y: number }) => {
    setTouchDirection(direction)
  }

  // Add this function near the top of the component
  const getCanvasDimensions = () => {
    if (isMobile) {
      return {
        width: Math.min(window.innerWidth - 32, 600),
        height: Math.min(window.innerHeight - 200, 800),
      }
    }
    return {
      width: 800,
      height: 600,
    }
  }

  // Update game loop on game state change
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      canvas.width = dimensions.width
      canvas.height = dimensions.height

      // Start game loop
      if (gameState === "playing") {
        gameLoopRef.current = requestAnimationFrame(gameLoop)
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState])

  // Add near the top of the component
  useEffect(() => {
    // Verify all required functions exist
    const requiredFunctions = {
      renderSystem,
      inputSystem,
      physicsSystem,
      collisionSystem,
      aiSystem,
      particleSystem,
      hudSystem,
      checkFoodCollisions,
      checkSnakeCollisions,
      updateAISnakes,
      updateParticles,
      drawHUD,
      drawGrid,
    }

    Object.entries(requiredFunctions).forEach(([name, func]) => {
      if (!func) {
        console.error(`Missing required function: ${name}`)
      }
    })
  }, [])

  // Add this function to update the leaderboard
  const updateLeaderboard = () => {
    const entries: LeaderboardEntry[] = [
      // Add player's current score
      { name: "YOU", score: score, isPlayer: true },
      // Add AI snake scores
      ...aiSnakesRef.current.map((snake, index) => ({
        name: `AI ${index + 1}`,
        score: snake.getScore(),
        isPlayer: false,
      })),
    ]

    // Sort by score descending
    entries.sort((a, b) => b.score - a.score)
    setLeaderboard(entries)
  }

  // Add this to your game loop or update system
  const updateRemains = () => {
    remainsRef.current = remainsRef.current.filter((remains) => {
      remains.update()
      return !remains.isExpired()
    })
  }

  // Handle window resize
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleResize = () => {
      setDimensions({
        width: Math.max(800, Math.min(window.innerWidth * 0.9, 1600)),
        height: Math.max(600, Math.min(window.innerHeight * 0.8, 1000)),
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Update canvas size when dimensions change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = dimensions.width
    canvas.height = dimensions.height
  }, [dimensions])

  // Add this near other power-up related code
  const spawnPowerUp = () => {
    const types: PowerUpType[] = ['speed', 'invincible', 'size'];
    const type = types[Math.floor(Math.random() * types.length)];

    // Find valid spawn position
    let validPosition = false;
    let x, y;

    while (!validPosition) {
      x = Math.random() * (dimensions.width - 40) + 20;
      y = Math.random() * (dimensions.height - 40) + 20;
      validPosition = true;

      // Check distance from all snakes
      const checkDistance = (snake: Snake) => {
        const head = snake.getHead();
        return Math.hypot(head.x - x, head.y - y) > 100;
      };

      if (playerSnakeRef.current && !checkDistance(playerSnakeRef.current)) {
        validPosition = false;
      }

      for (const aiSnake of aiSnakesRef.current) {
        if (!checkDistance(aiSnake)) {
          validPosition = false;
          break;
        }
      }
    }
    
    // Create and add the power-up
    powerUpsRef.current.push(new PowerUp({ 
      x: x!,
      y: y!,
      type,
      size: Math.min(dimensions.width, dimensions.height) / 40
    }));

    console.log(`Spawned ${type} power-up at`, { x, y });
  };

  // Add this near other collision checking code
  const checkPowerUpCollisions = () => {
    if (!playerSnakeRef.current) return;

    const playerHead = playerSnakeRef.current.getHead();
    powerUpsRef.current = powerUpsRef.current.filter((powerUp) => {
      const distance = Math.hypot(
        playerHead.x - powerUp.position.x,
        playerHead.y - powerUp.position.y
      );

      if (distance < playerHead.radius + powerUp.radius) {
        // Apply power-up effect
        powerUp.applyEffect(playerSnakeRef.current!);

        // Create enhanced particle effect
        particleSystemsRef.current.push(
          new ParticleSystem({
            x: powerUp.position.x,
            y: powerUp.position.y,
            color: powerUp.color,
            particleCount: Math.floor(Math.min(dimensions.width, dimensions.height) / 20),
            lifetime: 60,
            speed: 3,
            size: Math.min(dimensions.width, dimensions.height) / 150,
          })
        );

        // Add text popup
        showPopupText(powerUp.type.toUpperCase(), powerUp.position.x, powerUp.position.y, powerUp.color);

        // Play sound
        audioRef.current.playSound("powerup");

        return false; // Remove this power-up
      }
      return true; // Keep this power-up
    });
  };

  // Add these useEffect hooks near other useEffect declarations
  // Update periodic food spawning
  useEffect(() => {
    if (gameState !== "playing") return;

    const foodSpawnInterval = setInterval(() => {
      if (foodRef.current.length < MAX_FOOD_COUNT) {
        spawnFood();
      }
    }, 1000 + Math.random() * 2000);  // 1-3 seconds

    return () => clearInterval(foodSpawnInterval);
  }, [gameState]);

  // Add periodic power-up spawning
  useEffect(() => {
    if (gameState !== "playing") return;

    const powerUpInterval = setInterval(() => {
      if (powerUpsRef.current.length < 2) {
        console.log('Spawning new power-up, current count:', powerUpsRef.current.length);
        spawnPowerUp();
      }
    }, 10000);  // Every 10 seconds

    return () => clearInterval(powerUpInterval);
  }, [gameState]);

  // Add this effect
  useEffect(() => {
    // Reset touch controls when game state changes
    setTouchDirection({ x: 0, y: 0 })
    setIsBoosting(false)
  }, [gameState])

  // Render game controls
  return (
    <div className="relative w-full max-w-[1600px] mx-auto flex items-center justify-center p-4">
      {loading ? (
        <LoadingScreen progress={loadingProgress} />
      ) : (
        <>
          <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            className="border border-cyan-900 rounded-lg shadow-lg shadow-cyan-500/20 max-w-full h-auto"
          />

          {gameState === "menu" && renderMenu()}
          {gameState === "paused" && renderPauseScreen()}
          {gameState === "gameOver" && renderGameOverScreen()}
          {renderGameControls()}

          {/* Show touch controls on mobile during gameplay */}
          {isMobile && gameState === "playing" && (
            <TouchControls
              onDirectionChange={handleDirectionChange}
              onBoostStart={() => setIsBoosting(true)}
              onBoostEnd={() => setIsBoosting(false)}
            />
          )}
        </>
      )}
    </div>
  )
}

