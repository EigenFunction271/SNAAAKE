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
import { PowerUp, PowerUpType } from "@/utils/power-up"
import { AssetManager } from "@/utils/asset-manager"
import { Transitions } from "@/utils/transitions"
import { LoadingScreen } from "@/components/loading-screen"
import { TouchControls } from "@/components/touch-controls"
import { useMediaQuery } from "@/hooks/use-media-query"

// Game states
type GameState = "menu" | "playing" | "paused" | "gameOver"

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
    const canvasWidth = 800
    const canvasHeight = 600

  // Add responsive state
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [touchDirection, setTouchDirection] = useState({ x: 0, y: 0 })
  const [isBoosting, setIsBoosting] = useState(false)

  // Initialize game
    useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = canvasWidth
    canvas.height = canvasHeight

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
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      cancelAnimationFrame(gameLoopRef.current)
    }
  }, [])

  // Add loading effect
  useEffect(() => {
    const loadAssets = async () => {
      try {
        await assetManagerRef.current.loadAll()
        setLoading(false)
      } catch (error) {
        console.error('Failed to load assets:', error)
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

  // Handle key press
  const handleKeyDown = (e: KeyboardEvent) => {
    keysPressed.current.add(e.key.toLowerCase())

    // Handle pause
    if (e.key === "Escape" && gameState === "playing") {
      setGameState("paused")
      cancelAnimationFrame(gameLoopRef.current)
    } else if (e.key === "Escape" && gameState === "paused") {
      setGameState("playing")
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    // Start game with space or enter
    if ((e.key === " " || e.key === "Enter") && gameState === "menu") {
      startGame()
    }

    // Restart game with R
    if (e.key.toLowerCase() === "r" && gameState === "gameOver") {
      startGame()
    }
  }

  // Handle key release
  const handleKeyUp = (e: KeyboardEvent) => {
    keysPressed.current.delete(e.key.toLowerCase())
  }

  // Start a new game
  const startGame = () => {
    // Reset game objects
    playerSnakeRef.current = new Snake({
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      color: "#0ff",
      headColor: "#f0f",
      initialLength: 5,
      initialAngle: Math.PI / 2,
      speed: 2,
    })

    foodRef.current = [
      new Food({
        x: Math.random() * (canvasWidth - 40) + 20,
        y: Math.random() * (canvasHeight - 40) + 20,
        type: "regular",
      }),
    ]

    aiSnakesRef.current = [
      new AISnake({
        x: 100,
        y: 100,
        color: "#0f0",
        headColor: "#ff0",
        initialLength: 3,
        initialAngle: 0,
        speed: 1.5,
        behavior: "passive",
      }),
      new AISnake({
        x: canvasWidth - 100,
        y: canvasHeight - 100,
        color: "#f00",
        headColor: "#f80",
        initialLength: 3,
        initialAngle: Math.PI,
        speed: 1.8,
        behavior: "aggressive",
      }),
    ]

    particleSystemsRef.current = []

    // Reset power-ups
    powerUpsRef.current = []

    // Reset score
    setScore(0)

    // Start game
    setGameState("playing")
    gameLoopRef.current = requestAnimationFrame(gameLoop)
    
    // Play start sound
    audioRef.current.playSound("collect")
  }

  // Main game loop
  const gameLoop = () => {
    if (gameState !== "playing") return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Split into core systems
    renderSystem(ctx)
    inputSystem()
    physicsSystem(canvas.width, canvas.height)
    collisionSystem()
    aiSystem(ctx)
    particleSystem(ctx)
    hudSystem(ctx)

    // Continue game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }

  // 1. Rendering System
  const renderSystem = (ctx: CanvasRenderingContext2D) => {
    // Clear and prepare canvas
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    drawGrid(ctx)

    // Draw game entities
    if (playerSnakeRef.current) {
      playerSnakeRef.current.draw(ctx)
    }
    
    // Draw food
    for (const food of foodRef.current) {
      food.update()
      food.draw(ctx)
    }

    // Draw power-ups
    for (const powerUp of powerUpsRef.current) {
      powerUp.update()
      powerUp.draw(ctx)
    }
  }

  // 2. Input System
  const inputSystem = () => {
    if (!playerSnakeRef.current) return

    if (isMobile) {
      // Convert touch direction to angle
      if (touchDirection.x !== 0 || touchDirection.y !== 0) {
        const targetAngle = Math.atan2(touchDirection.y, touchDirection.x);
        const currentAngle = playerSnakeRef.current.angle;
        
        // Smooth rotation towards target angle
        const angleDiff = targetAngle - currentAngle;
        const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        
        if (normalizedDiff > 0.1) {
          playerSnakeRef.current.turnRight();
        } else if (normalizedDiff < -0.1) {
          playerSnakeRef.current.turnLeft();
        }
      }

      // Handle boost
      if (isBoosting) {
        playerSnakeRef.current.boost();
      } else {
        playerSnakeRef.current.normalSpeed();
      }
    } else {
      // Existing keyboard controls
      handleInput();
    }
  }

  // 3. Physics System
  const physicsSystem = (width: number, height: number) => {
    if (playerSnakeRef.current) {
      playerSnakeRef.current.update(width, height)
    }

    // Update AI snake positions
    for (const aiSnake of aiSnakesRef.current) {
      aiSnake.update(width, height)
    }
  }

  // 4. Collision System
  const collisionSystem = () => {
    checkFoodCollisions(ctx)
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

    // Vertical lines
    for (let x = 0; x <= canvasWidth; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvasHeight)
      ctx.stroke()
    }

    // Horizontal lines
    for (let y = 0; y <= canvasHeight; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvasWidth, y)
      ctx.stroke()
    }
  }

  // Handle player input
  const handleInput = () => {
    if (!playerSnakeRef.current) return

    // Turn left with left arrow or A
    if (keysPressed.current.has("arrowleft") || keysPressed.current.has("a")) {
      playerSnakeRef.current.turnLeft()
    }

    // Turn right with right arrow or D
    if (keysPressed.current.has("arrowright") || keysPressed.current.has("d")) {
      playerSnakeRef.current.turnRight()
    }

    // Speed boost with up arrow or W
    if (keysPressed.current.has("arrowup") || keysPressed.current.has("w")) {
      playerSnakeRef.current.boost()
    } else {
      playerSnakeRef.current.normalSpeed()
    }
  }

  // Check for food collisions
  const checkFoodCollisions = (ctx: CanvasRenderingContext2D) => {
    if (!playerSnakeRef.current) return

    const playerHead = playerSnakeRef.current.getHead()

    foodRef.current = foodRef.current.filter((food) => {
      const distance = Math.hypot(playerHead.x - food.position.x, playerHead.y - food.position.y)

      if (distance < playerHead.radius + food.radius) {
        // Create particle effect
        particleSystemsRef.current.push(
          new ParticleSystem({
            x: food.position.x,
            y: food.position.y,
            color: food.color,
            particleCount: 20,
            lifetime: 30,
          }),
        )

        // Grow snake
        playerSnakeRef.current?.grow(food.value)

        // Increase score
        setScore((prevScore) => {
          const newScore = prevScore + food.value * 10

          // Update high score if needed
          if (newScore > highScore) {
            setHighScore(newScore)
            localStorage.setItem("snakeHighScore", newScore.toString())
          }

          return newScore
        })

        // Spawn new food
        spawnFood()

        return false
      }

      return true
    })
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
      if (aiSnake.checkCollisionWith(playerHead)) {
        gameOver()
        return
      }

      // Check if AI snake head collides with player body
      const aiHead = aiSnake.getHead()
      if (playerSnakeRef.current.checkCollisionWithPoint(aiHead)) {
        // Create particle effect
        particleSystemsRef.current.push(
          new ParticleSystem({
            x: aiHead.x,
            y: aiHead.y,
            color: aiSnake.color,
            particleCount: 30,
            lifetime: 40,
          }),
        )

        // Remove AI snake
        aiSnakesRef.current = aiSnakesRef.current.filter((snake) => snake !== aiSnake)

        // Increase score
        setScore((prevScore) => prevScore + 50)

        // Spawn new AI snake after delay
        setTimeout(() => {
          if (gameState === "playing") {
            spawnAISnake()
          }
        }, 5000)
      }
    }
  }

  // Update and draw AI snakes
  const updateAISnakes = (ctx: CanvasRenderingContext2D) => {
    for (const aiSnake of aiSnakesRef.current) {
      // Update AI behavior
      aiSnake.updateAI(
        foodRef.current,
        playerSnakeRef.current,
        aiSnakesRef.current.filter((snake) => snake !== aiSnake),
        canvasWidth,
        canvasHeight,
      )

      // Update position
      aiSnake.update(canvasWidth, canvasHeight)

      // Draw snake
      aiSnake.draw(ctx)

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
              particleCount: 15,
              lifetime: 25,
            }),
          )

          // Grow snake
          aiSnake.grow(food.value)

          // Spawn new food
          spawnFood()

          return false
        }

        return true
      })
    }
  }

  // Spawn new food
  const spawnFood = () => {
    // Random position away from snakes
    let validPosition = false
    let x, y

    while (!validPosition) {
      x = Math.random() * (canvasWidth - 40) + 20
      y = Math.random() * (canvasHeight - 40) + 20

      validPosition = true

      // Check distance from player snake
      if (playerSnakeRef.current) {
        for (const segment of playerSnakeRef.current.segments) {
          const distance = Math.hypot(segment.x - x, segment.y - y)
          if (distance < 50) {
            validPosition = false
            break
          }
        }
      }

      // Check distance from AI snakes
      if (validPosition) {
        for (const aiSnake of aiSnakesRef.current) {
          for (const segment of aiSnake.segments) {
            const distance = Math.hypot(segment.x - x, segment.y - y)
            if (distance < 50) {
              validPosition = false
              break
            }
          }
          if (!validPosition) break
        }
      }
    }

    // Determine food type (10% chance for special food)
    const foodType = Math.random() < 0.1 ? "special" : "regular"

    // Create new food
    foodRef.current.push(
      new Food({
        x: x!,
        y: y!,
        type: foodType,
      }),
    )
  }

  // Spawn new AI snake
  const spawnAISnake = () => {
    // Random position at the edge of the canvas
    let x, y, angle

    const side = Math.floor(Math.random() * 4)

    switch (side) {
      case 0: // Top
        x = Math.random() * canvasWidth
        y = 20
        angle = Math.PI / 2
        break
      case 1: // Right
        x = canvasWidth - 20
        y = Math.random() * canvasHeight
        angle = Math.PI
        break
      case 2: // Bottom
        x = Math.random() * canvasWidth
        y = canvasHeight - 20
        angle = -Math.PI / 2
        break
      case 3: // Left
        x = 20
        y = Math.random() * canvasHeight
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
    ctx.fillStyle = "#fff"
    ctx.font = '20px "Courier New", monospace'
    ctx.textAlign = "left"
    ctx.fillText(`SCORE: ${score}`, 20, 30)
    ctx.fillText(`HIGH SCORE: ${highScore}`, 20, 60)

    // Draw active power-ups
    if (playerSnakeRef.current) {
      const activePowerUps = playerSnakeRef.current.activePowerUps
      let i = 0
      activePowerUps.forEach((endTime, type) => {
        if (Date.now() < endTime) {
          const timeLeft = Math.ceil((endTime - Date.now()) / 1000)
          ctx.fillStyle = "#fff"
          ctx.font = '16px "Courier New", monospace'
          ctx.fillText(
            `${type.toUpperCase()}: ${timeLeft}s`,
            20,
            100 + i * 25
          )
          i++
        }
      })
    }
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
          particleCount: 50,
          lifetime: 60,
          speed: 3,
        }),
      )
    }
  }

  // Render menu screen
  const renderMenu = () => {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-10">
        <h1 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
          NEON SNAKE
        </h1>
        <div className="space-y-4 w-64">
          <Button
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            onClick={startGame}
          >
            <Play className="mr-2 h-4 w-4" />
            PLAY
          </Button>
          <div className="text-center text-gray-400 text-sm mt-8">
            <p>Use ARROW KEYS or WASD to control</p>
            <p>Press UP or W for speed boost</p>
          </div>
        </div>
      </div>
    )
  }

  // Render pause screen
  const renderPauseScreen = () => {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-10">
        <h2 className="text-3xl font-bold mb-8 text-cyan-400">PAUSED</h2>
        <div className="space-y-4 w-64">
          <Button
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
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
            className="w-full border-cyan-500 text-cyan-400 hover:bg-cyan-950"
            onClick={() => setGameState("menu")}
          >
            MAIN MENU
          </Button>
        </div>
      </div>
    )
  }

  // Render game over screen
  const renderGameOverScreen = () => {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-10">
        <h2 className="text-4xl font-bold mb-2 text-red-500">GAME OVER</h2>
        <p className="text-2xl mb-8 text-cyan-400">SCORE: {score}</p>
        <div className="space-y-4 w-64">
          <Button
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            onClick={startGame}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            PLAY AGAIN
          </Button>
          <Button
            variant="outline"
            className="w-full border-cyan-500 text-cyan-400 hover:bg-cyan-950"
            onClick={() => setGameState("menu")}
          >
            MAIN MENU
          </Button>
        </div>
      </div>
    )
  }

  // Render game controls
  const renderGameControls = () => {
    if (gameState !== "playing") return null

    return (
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="icon"
          className="border-cyan-500 text-cyan-400 hover:bg-cyan-950"
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

  // Add power-up spawning
  const spawnPowerUp = () => {
    const types: PowerUpType[] = ["speed", "invulnerability", "ghost"]
    const randomType = types[Math.floor(Math.random() * types.length)]

    let validPosition = false
    let x, y

    while (!validPosition) {
      x = Math.random() * (canvasWidth - 40) + 20
      y = Math.random() * (canvasHeight - 40) + 20
      validPosition = true

      // Check distance from player and AI snakes
      if (playerSnakeRef.current) {
        for (const segment of playerSnakeRef.current.segments) {
          const distance = Math.hypot(segment.x - x, segment.y - y)
          if (distance < 50) {
            validPosition = false
            break
          }
        }
      }

      if (validPosition) {
        for (const aiSnake of aiSnakesRef.current) {
          for (const segment of aiSnake.segments) {
            const distance = Math.hypot(segment.x - x, segment.y - y)
            if (distance < 50) {
              validPosition = false
              break
            }
          }
          if (!validPosition) break
        }
      }
    }

    powerUpsRef.current.push(
      new PowerUp({
        x: x!,
        y: y!,
        type: randomType,
      })
    )
  }

  // Check power-up collisions
  const checkPowerUpCollisions = () => {
    if (!playerSnakeRef.current) return

    const playerHead = playerSnakeRef.current.getHead()
    powerUpsRef.current = powerUpsRef.current.filter((powerUp) => {
      const distance = Math.hypot(
        playerHead.x - powerUp.position.x,
        playerHead.y - powerUp.position.y
      )

      if (distance < playerHead.radius + powerUp.radius) {
        // Apply power-up effect
        playerSnakeRef.current?.collectPowerUp(powerUp)

        // Create particle effect
        particleSystemsRef.current.push(
          new ParticleSystem({
            x: powerUp.position.x,
            y: powerUp.position.y,
            color: powerUp.color,
            particleCount: 30,
            lifetime: 40,
          })
        )

        return false
      }
      return true
    })
  }

  // Occasionally spawn power-ups
  useEffect(() => {
    if (gameState !== "playing") return

    const powerUpInterval = setInterval(() => {
      if (Math.random() < 0.3 && powerUpsRef.current.length < 3) {
        spawnPowerUp()
      }
    }, 10000) // Every 10 seconds

    return () => clearInterval(powerUpInterval)
  }, [gameState])

  // Update state transitions
  const changeGameState = async (newState: GameState) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Exit transition
    await Transitions.fade(ctx, 'out', 300)
    
    setGameState(newState)
    
    // Enter transition
    await Transitions.fade(ctx, 'in', 300)
  }

  // Update canvas size on window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { width, height } = getCanvasDimensions();
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Handle touch controls
  const handleDirectionChange = (direction: { x: number; y: number }) => {
    setTouchDirection(direction);
  };

  // Update input system to handle both keyboard and touch
  const inputSystem = () => {
    if (!playerSnakeRef.current) return;

    if (isMobile) {
      // Convert touch direction to angle
      if (touchDirection.x !== 0 || touchDirection.y !== 0) {
        const targetAngle = Math.atan2(touchDirection.y, touchDirection.x);
        const currentAngle = playerSnakeRef.current.angle;
        
        // Smooth rotation towards target angle
        const angleDiff = targetAngle - currentAngle;
        const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
        
        if (normalizedDiff > 0.1) {
          playerSnakeRef.current.turnRight();
        } else if (normalizedDiff < -0.1) {
          playerSnakeRef.current.turnLeft();
        }
      }

      // Handle boost
      if (isBoosting) {
        playerSnakeRef.current.boost();
      } else {
        playerSnakeRef.current.normalSpeed();
      }
    } else {
      // Existing keyboard controls
      handleInput();
    }
  };

  // Update render method to include touch controls
  return (
    <div className="relative">
      {loading ? (
        <LoadingScreen progress={loadingProgress} />
      ) : (
        <>
          <canvas
            ref={canvasRef}
            className="border border-cyan-900 rounded-lg shadow-lg shadow-cyan-500/20"
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

