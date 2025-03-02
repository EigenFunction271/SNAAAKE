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
import { AIBehaviorType, AI_BEHAVIORS, getRandomBehavior } from "@/utils/ai-behaviors"
import { SnakeRemains } from '@/utils/snake-remains'

// Game states
type GameState = "menu" | "playing" | "paused" | "gameOver"

// Add these constants near the top of the component
const MIN_FOOD_COUNT = 3;
const MAX_FOOD_COUNT = 6;

// Add this constant at the top of the file with other constants
const BEHAVIOR_OPTIONS: AIBehaviorType[] = ['passive', 'aggressive', 'territorial', 'mixed'];

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

  // Add at the top with other state
  const [aiSnakeCount, setAiSnakeCount] = useState(2);
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [aiBehavior, setAiBehavior] = useState<AIBehaviorType>('mixed');

  // Update the state to track individual snake behaviors
  const [aiSnakes, setAiSnakes] = useState<Array<{
    behavior: Exclude<AIBehaviorType, 'mixed'>;
    color: string;
  }>>([
    { behavior: 'passive', color: "#0f0" },
    { behavior: 'aggressive', color: "#f00" },
  ]);

  // Add new state for remains
  const remainsRef = useRef<SnakeRemains[]>([]);

  // Initialize game
    useEffect(() => {
    console.log('Component mounted');
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = canvasWidth
    canvas.height = canvasHeight
    console.log('Canvas initialized:', { width: canvasWidth, height: canvasHeight });

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
      const key = e.key.toLowerCase();
      console.log('Key pressed:', key);
      
      // Prevent default behavior for game control keys
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault();
        keysPressed.current.add(key);
      }

      // Game control keys
      if (key === "escape" && gameState === "playing") {
        setGameState("paused");
      } else if (key === "escape" && gameState === "paused") {
        setGameState("playing");
      } else if ((key === " " || key === "enter") && gameState === "menu") {
        startGame();
      } else if (key === "r" && gameState === "gameOver") {
        startGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      console.log('Key released:', key);
      keysPressed.current.delete(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Draw initial grid
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      drawGrid(ctx);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
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

  // Add to the top of the component
  useEffect(() => {
    console.log('Game state changed:', gameState);
  }, [gameState]);

  // Start a new game
  const startGame = () => {
    console.log('Starting new game...', { aiSnakeCount, aiDifficulty });
    
    try {
      // Reset game objects
      playerSnakeRef.current = new Snake({
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        color: "#0ff",
        headColor: "#f0f",
        initialLength: 5,
        initialAngle: Math.PI / 2,
        speed: 2,
      });

      // Clear existing food
      foodRef.current = [];
      
      // Spawn initial food
      for (let i = 0; i < 3; i++) {
        spawnFood();
      }
      console.log('Initial food spawned:', foodRef.current);

      // Initialize canvas dimensions
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        console.log('Canvas dimensions set:', { width: canvasWidth, height: canvasHeight });
      }

      // Initialize AI snakes with individual settings
      aiSnakesRef.current = aiSnakes.map(({ behavior, color }) => {
        const speed = {
          easy: 1.2,
          medium: 1.5,
          hard: 1.8
        }[aiDifficulty];

        return new AISnake({
          x: Math.random() * canvasWidth,
          y: Math.random() * canvasHeight,
          color: color,
          headColor: "#fff",
          initialLength: 3,
          initialAngle: Math.random() * Math.PI * 2,
          speed: speed + (Math.random() * 0.3),
          behavior: behavior,
        });
      });
      console.log('AI snakes created:', aiSnakesRef.current);

      particleSystemsRef.current = [];
      powerUpsRef.current = [];

      // Reset score
      setScore(0);

      // Start game
      console.log('Setting game state to playing');
      setGameState("playing");
      
      // Add a small delay to ensure state is updated before starting game loop
      setTimeout(() => {
        console.log('Starting game loop');
        if (canvasRef.current) {
          gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
      }, 0);
      
      // Play start sound
      audioRef.current.playSound("collect");
      console.log('Game started successfully');
    } catch (error) {
      console.error('Error in startGame:', error);
    }
  };

  // Main game loop
  const gameLoop = () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (gameState === "playing") {
        // Check if we need to spawn more food
        if (foodRef.current.length < MIN_FOOD_COUNT) {
          console.log('Food count low, spawning more food...');
          spawnFood();
        }

        console.log('Game loop cycle');
        
        // Handle input first
        inputSystem();
        
        // Then update physics with the new input
        physicsSystem(canvas.width, canvas.height);
        
        // Then render and other systems
        renderSystem(ctx);
        collisionSystem(ctx);
        aiSystem(ctx);
        particleSystem(ctx);
        hudSystem(ctx);
        
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }
    } catch (error) {
      console.error('Error in game loop:', error);
    }
  }

  // 1. Rendering System
  const renderSystem = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw grid
    drawGrid(ctx);

    // Draw game entities
    if (playerSnakeRef.current) {
      playerSnakeRef.current.draw(ctx);
    }

    // Draw AI snakes
    for (const aiSnake of aiSnakesRef.current) {
      aiSnake.draw(ctx);
    }
    
    // Draw food
    for (const food of foodRef.current) {
      food.update();
      food.draw(ctx);
    }

    // Draw power-ups
    for (const powerUp of powerUpsRef.current) {
      powerUp.update();
      powerUp.draw(ctx);
    }

    // Draw particles
    for (const particles of particleSystemsRef.current) {
      particles.draw(ctx);
    }

    // Draw remains
    for (const remains of remainsRef.current) {
      remains.update();
      remains.draw(ctx);
    }
  }

  // 3. Physics System
  const physicsSystem = (width: number, height: number) => {
    // Update player snake
    if (playerSnakeRef.current) {
      playerSnakeRef.current.update(width, height);
    }

    // Update AI snakes
    for (const aiSnake of aiSnakesRef.current) {
      aiSnake.update(width, height);
    }

    // Update food animations
    for (const food of foodRef.current) {
      food.update();
    }

    // Update power-ups
    for (const powerUp of powerUpsRef.current) {
      powerUp.update();
    }

    // Update particles
    particleSystemsRef.current = particleSystemsRef.current.filter((system) => {
      system.update();
      return !system.isDead();
    });
  }

  // 4. Collision System
  const collisionSystem = (ctx: CanvasRenderingContext2D) => {
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
    ctx.strokeStyle = "rgba(0, 255, 255, 0.1)";
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= canvasWidth; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= canvasHeight; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }
  }

  // Update the inputSystem function
  const inputSystem = () => {
    if (!playerSnakeRef.current) return;

    // Debug current key state
    const currentKeys = Array.from(keysPressed.current);
    console.log('Input state:', {
      keys: currentKeys,
      left: keysPressed.current.has('a') || keysPressed.current.has('arrowleft'),
      right: keysPressed.current.has('d') || keysPressed.current.has('arrowright'),
      boost: keysPressed.current.has('w') || keysPressed.current.has('arrowup')
    });

    // Stop automatic movement
    let movementMade = false;

    // Handle keyboard controls
    if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) {
      playerSnakeRef.current.turnLeft();
      movementMade = true;
    }
    if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) {
      playerSnakeRef.current.turnRight();
      movementMade = true;
    }
    if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) {
      playerSnakeRef.current.boost();
      movementMade = true;
    } else {
      playerSnakeRef.current.normalSpeed();
    }

    // If no movement keys are pressed, maintain current direction
    if (!movementMade) {
      playerSnakeRef.current.normalSpeed();
    }
  };

  // Check for food collisions
  const checkFoodCollisions = () => {
    if (!playerSnakeRef.current) return;

    const playerHead = playerSnakeRef.current.getHead();
    const initialFoodCount = foodRef.current.length;
    
    foodRef.current = foodRef.current.filter((food) => {
      const distance = Math.hypot(
        playerHead.x - food.position.x,
        playerHead.y - food.position.y
      );

      const collisionDistance = playerHead.radius + food.radius;
      
      if (distance < collisionDistance) {
        console.log('Food collision detected!', {
          distance,
          collisionDistance,
          foodPosition: food.position,
          playerPosition: { x: playerHead.x, y: playerHead.y }
        });

        // Create particle effect
        particleSystemsRef.current.push(
          new ParticleSystem({
            x: food.position.x,
            y: food.position.y,
            color: food.color,
            particleCount: 15,
            lifetime: 25,
          })
        );

        // Grow snake
        playerSnakeRef.current?.grow(food.value);
        
        // Play sound
        audioRef.current.playSound("collect");

        // Update score
        setScore((prevScore) => {
          const newScore = prevScore + (food.type === 'special' ? 30 : 10);
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem("snakeHighScore", newScore.toString());
          }
          return newScore;
        });

        // Spawn new food
        spawnFood();

        return false; // Remove this food
      }
      return true; // Keep this food
    });

    // Check remains collisions
    remainsRef.current = remainsRef.current.filter((remains) => {
      const distance = Math.hypot(
        playerHead.x - remains.position.x,
        playerHead.y - remains.position.y
      );

      if (distance < playerHead.radius + remains.radius) {
        // Create special particle effect
        particleSystemsRef.current.push(
          new ParticleSystem({
            x: remains.position.x,
            y: remains.position.y,
            color: remains.color,
            particleCount: 30,
            lifetime: 40,
            speed: 2,
          })
        );

        // Add score
        setScore((prevScore) => {
          const newScore = prevScore + remains.scoreValue;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem("snakeHighScore", newScore.toString());
          }
          return newScore;
        });

        // Grow snake proportionally to the score
        playerSnakeRef.current?.grow(Math.ceil(remains.scoreValue / 20));
        
        // Play special sound
        audioRef.current.playSound("collect");

        return false; // Remove remains
      }
      return true; // Keep remains
    });

    const finalFoodCount = foodRef.current.length;
    if (initialFoodCount !== finalFoodCount) {
      console.log('Food count changed:', { 
        before: initialFoodCount, 
        after: finalFoodCount 
      });
    }
  };

  // Check for snake collisions
  const checkSnakeCollisions = () => {
    if (!playerSnakeRef.current) return;

    const playerHead = playerSnakeRef.current.getHead();

    // Check collision with player's own body
    if (playerSnakeRef.current.checkSelfCollision()) {
      gameOver();
      return;
    }

    // Check collision with AI snakes
    for (const aiSnake of aiSnakesRef.current) {
      // Player collision with AI snake
      if (aiSnake.checkCollisionWith(playerHead)) {
        gameOver();
        return;
      }

      // AI snake head collision with player body
      const aiHead = aiSnake.getHead();
      if (playerSnakeRef.current.checkCollisionWithPoint(aiHead)) {
        createSnakeExplosion(aiSnake);
        removeAndRespawnAISnake(aiSnake);
        continue;
      }

      // NEW: Check AI snake collisions with other AI snakes
      for (const otherAI of aiSnakesRef.current) {
        if (aiSnake === otherAI) continue; // Skip self

        // Check if this AI snake's head hits other AI snake's body
        if (otherAI.checkCollisionWith(aiHead)) {
          console.log('AI snake collision detected');
          createSnakeExplosion(aiSnake);
          removeAndRespawnAISnake(aiSnake);
          break;
        }

        // Check if other AI snake's head hits this AI snake's body
        const otherHead = otherAI.getHead();
        if (aiSnake.checkCollisionWith(otherHead)) {
          console.log('AI snake collision detected');
          createSnakeExplosion(otherAI);
          removeAndRespawnAISnake(otherAI);
          break;
        }
      }
    }
  };

  // Helper function to create explosion effect
  const createSnakeExplosion = (snake: AISnake) => {
    particleSystemsRef.current.push(
      new ParticleSystem({
        x: snake.getHead().x,
        y: snake.getHead().y,
        color: snake.color,
        particleCount: 30,
        lifetime: 40,
      })
    );
  };

  // Helper function to remove and respawn AI snake
  const removeAndRespawnAISnake = (snake: AISnake) => {
    // Create remains at snake's head position
    const head = snake.getHead();
    const remains = new SnakeRemains({
      x: head.x,
      y: head.y,
      color: snake.color,
      scoreValue: snake.getScore(),
    });
    remainsRef.current.push(remains);

    // Remove the snake
    aiSnakesRef.current = aiSnakesRef.current.filter((s) => s !== snake);

    // Spawn new AI snake after delay
    setTimeout(() => {
      if (gameState === "playing") {
        spawnAISnake();
      }
    }, 5000);
  };

  // Update and draw AI snakes
  const updateAISnakes = (ctx: CanvasRenderingContext2D) => {
    for (const aiSnake of aiSnakesRef.current) {
      // Update AI behavior
      aiSnake.updateAI(
        foodRef.current,
        playerSnakeRef.current,
        aiSnakesRef.current.filter((snake) => snake !== aiSnake),
        powerUpsRef.current,
        canvasWidth,
        canvasHeight
      );

      // Update position
      aiSnake.update(canvasWidth, canvasHeight);

      // Check for food collision
      const aiHead = aiSnake.getHead();
      foodRef.current = foodRef.current.filter((food) => {
        const distance = Math.hypot(
          aiHead.x - food.position.x,
          aiHead.y - food.position.y
        );

        if (distance < aiHead.radius + food.radius) {
          // Create particle effect
          particleSystemsRef.current.push(
            new ParticleSystem({
              x: food.position.x,
              y: food.position.y,
              color: food.color,
              particleCount: 15,
              lifetime: 25,
            })
          );

          // Grow snake
          aiSnake.grow(food.value);

          // Spawn new food
          spawnFood();

          return false; // Remove this food
        }
        return true; // Keep this food
      });

      // Check for power-up collisions
      powerUpsRef.current = powerUpsRef.current.filter((powerUp) => {
        const distance = Math.hypot(
          aiHead.x - powerUp.position.x,
          aiHead.y - powerUp.position.y
        );

        if (distance < aiHead.radius + powerUp.radius) {
          // Apply power-up effect
          powerUp.applyEffect(aiSnake);

          // Create particle effect
          particleSystemsRef.current.push(
            new ParticleSystem({
              x: powerUp.position.x,
              y: powerUp.position.y,
              color: powerUp.color,
              particleCount: 30,
              lifetime: 40,
            })
          );

          // Play sound
          audioRef.current.playSound("powerup");

          return false; // Remove this power-up
        }
        return true; // Keep this power-up
      });

      // Draw snake
      aiSnake.draw(ctx);
    }
  };

  // Spawn new food
  const spawnFood = () => {
    console.log('Spawning new food...');
    
    // Random position away from snakes
    let validPosition = false;
    let x, y;
    let attempts = 0;
    const maxAttempts = 10;

    while (!validPosition && attempts < maxAttempts) {
      x = Math.random() * (canvasWidth - 40) + 20;
      y = Math.random() * (canvasHeight - 40) + 20;
      validPosition = true;
      attempts++;

      // Check distance from player snake
      if (playerSnakeRef.current) {
        const distance = Math.hypot(
          playerSnakeRef.current.getHead().x - x,
          playerSnakeRef.current.getHead().y - y
        );
        if (distance < 50) {
          validPosition = false;
          continue;
        }
      }

      // Check distance from AI snakes
      for (const aiSnake of aiSnakesRef.current) {
        const distance = Math.hypot(
          aiSnake.getHead().x - x,
          aiSnake.getHead().y - y
        );
        if (distance < 50) {
          validPosition = false;
          break;
        }
      }
    }

    // Create new food
    const newFood = new Food({
      x: x!,
      y: y!,
      type: Math.random() < 0.1 ? "special" : "regular",
    });

    foodRef.current.push(newFood);
    console.log('New food spawned:', { x, y, foodCount: foodRef.current.length });
  };

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
    ctx.fillStyle = "#fff";
    ctx.font = '20px "Courier New", monospace';
    ctx.textAlign = "left";
    ctx.fillText(`SCORE: ${score}`, 20, 30);
    ctx.fillText(`HIGH SCORE: ${highScore}`, 20, 60);

    // Draw active power-ups
    if (playerSnakeRef.current) {
      const activePowerUps = playerSnakeRef.current.activePowerUps;
      let i = 0;
      activePowerUps.forEach((endTime, type) => {
        if (Date.now() < endTime) {
          const timeLeft = Math.ceil((endTime - Date.now()) / 1000);
          ctx.fillStyle = "#fff";
          ctx.font = '16px "Courier New", monospace';
          ctx.fillText(
            `${type.toUpperCase()}: ${timeLeft}s`,
            20,
            100 + i * 25
          );
          i++;
        }
      });
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

  // Update the renderMenu function
  const renderMenu = () => {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-10">
        <h1 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
          NEON SNAKE
        </h1>
        <div className="space-y-6 w-96"> {/* Increased width for more space */}
          {/* AI Snake Settings */}
          <div className="space-y-4 bg-gray-900 p-4 rounded-lg">
            <h2 className="text-xl text-cyan-400 font-semibold text-center">Game Settings</h2>
            
            <div className="space-y-2">
              <label className="text-gray-300 block">Number of AI Snakes</label>
              <input 
                type="range" 
                min="0" 
                max="4" 
                value={aiSnakes.length}
                onChange={(e) => {
                  const newCount = Number(e.target.value);
                  setAiSnakes(prev => {
                    if (newCount > prev.length) {
                      // Add new snakes
                      return [...prev, ...Array(newCount - prev.length).fill(null).map(() => ({
                        behavior: getRandomBehavior(),
                        color: ["#0f0", "#f00", "#ff0", "#f0f"][prev.length % 4]
                      }))];
                    } else {
                      // Remove snakes
                      return prev.slice(0, newCount);
                    }
                  });
                }}
                className="w-full accent-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-gray-300 block">AI Difficulty</label>
              <div className="flex gap-2">
                {['easy', 'medium', 'hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setAiDifficulty(diff as 'easy' | 'medium' | 'hard')}
                    className={`flex-1 py-1 px-2 rounded ${
                      aiDifficulty === diff 
                        ? 'bg-cyan-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Snake Settings */}
            {aiSnakes.map((snake, index) => (
              <div key={index} className="space-y-2 border-t border-gray-700 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-gray-300">Snake {index + 1}</label>
                  <div className="flex gap-2">
                    {["#0f0", "#f00", "#ff0", "#f0f"].map((color) => (
                      <button
                        key={color}
                        onClick={() => setAiSnakes(prev => prev.map((s, i) => 
                          i === index ? { ...s, color } : s
                        ))}
                        className={`w-6 h-6 rounded-full ${
                          snake.color === color ? 'ring-2 ring-white' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {Object.keys(AI_BEHAVIORS).map((behavior) => (
                    <button
                      key={behavior}
                      onClick={() => setAiSnakes(prev => prev.map((s, i) => 
                        i === index ? { ...s, behavior: behavior as Exclude<AIBehaviorType, 'mixed'> } : s
                      ))}
                      className={`py-1 px-2 rounded text-sm ${
                        snake.behavior === behavior 
                          ? 'bg-cyan-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {behavior.charAt(0).toUpperCase() + behavior.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Play Button */}
          <Button
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            onClick={startGame}
          >
            <Play className="mr-2 h-4 w-4" />
            PLAY
          </Button>

          {/* Controls Info */}
          <div className="text-center text-gray-400 text-sm">
            <p>Use ARROW KEYS or WASD to control</p>
            <p>Press UP or W for speed boost</p>
            <p>Press ESC to pause</p>
          </div>
        </div>
      </div>
    );
  };

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

  // Update power-up spawning
  const spawnPowerUp = () => {
    const types: PowerUpType[] = ['speed', 'invincible', 'size'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Ensure power-ups don't spawn too close to snakes
    let validPosition = false;
    let x, y;
    
    while (!validPosition) {
      x = Math.random() * (canvasWidth - 40) + 20;
      y = Math.random() * (canvasHeight - 40) + 20;
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
    
    powerUpsRef.current.push(new PowerUp({ x, y, type }));
  };

  // Add periodic food spawning
  useEffect(() => {
    if (gameState !== "playing") return;

    // Spawn food every 3-8 seconds
    const foodSpawnInterval = setInterval(() => {
      if (foodRef.current.length < MAX_FOOD_COUNT) {
        console.log('Periodic food spawn triggered');
        spawnFood();
      }
    }, 3000 + Math.random() * 5000);

    return () => clearInterval(foodSpawnInterval);
  }, [gameState]);

  // Add periodic power-up spawning
  useEffect(() => {
    if (gameState !== "playing") return;

    const powerUpInterval = setInterval(() => {
      if (powerUpsRef.current.length < 2) { // Maximum 2 power-ups at once
        spawnPowerUp();
      }
    }, 10000); // Spawn every 10 seconds if below limit

    return () => clearInterval(powerUpInterval);
  }, [gameState]);

  // Check power-up collisions
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

        // Create particle effect
        particleSystemsRef.current.push(
          new ParticleSystem({
            x: powerUp.position.x,
            y: powerUp.position.y,
            color: powerUp.color,
            particleCount: 30,
            lifetime: 40,
          })
        );

        // Play sound
        audioRef.current.playSound("powerup");

        return false; // Remove this power-up
      }
      return true; // Keep this power-up
    });
  };

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

  // Add this function near the top of the component
  const getCanvasDimensions = () => {
    if (isMobile) {
      return {
        width: Math.min(window.innerWidth - 32, 600),
        height: Math.min(window.innerHeight - 200, 800)
      };
    }
    return {
      width: 800,
      height: 600
    };
  };

  // Update game loop on game state change
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // Start game loop
      if (gameState === "playing") {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }
    }
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState]);

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
      drawGrid
    };

    Object.entries(requiredFunctions).forEach(([name, func]) => {
      if (!func) {
        console.error(`Missing required function: ${name}`);
      }
    });
  }, []);

  // Render game controls
  return (
    <div className="relative">
      {loading ? (
        <LoadingScreen progress={loadingProgress} />
      ) : (
        <>
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
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