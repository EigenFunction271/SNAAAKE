# Snake Browser Game - Project Plan

## Tech Stack

### Frontend
- **HTML5 Canvas**: For smooth, non-grid-based rendering
- **JavaScript (ES6+)**: Core game logic
- **RequestAnimationFrame API**: For optimal animation handling
- **Web Audio API**: For sound effects
- **LocalStorage API**: For saving high scores and settings

### Optional Enhancements
- **TypeScript**: For better type safety and code organization
- **Webpack/Parcel**: For bundling assets and code
- **GSAP**: For smooth animations (transitions, UI elements)

## Project Requirements

### Core Game Mechanics
1. **Non-Grid Movement**
   - Continuous movement using vector-based positioning instead of grid cells
   - Smooth turning with configurable turning radius/speed
   - Collision detection using circular hitboxes for snake segments

2. **Periodic Boundary Conditions**
   - Snake wraps around when crossing screen edges
   - Seamless transition when wrapping around boundaries

3. **Snake Growth Mechanics**
   - Player snake grows when consuming food
   - Length increase should be gradual/animated
   - Snake body should follow head path exactly

4. **Collision System**
   - Detect collisions between:
     - Player snake head and any snake body (including own)
     - Player snake head and game boundaries (for non-periodic modes)
     - AI snake head and any snake body
   - Proper hit detection for non-grid-based movement

5. **Food System**
   - Random spawning algorithm (avoiding spawning on snakes)
   - Various food types with different effects
   - Visual indicators for food types

6. **AI Snakes**
   - Customizable behavior patterns (aggressive, passive, territorial)
   - Pathfinding algorithms for food-seeking
   - Collision avoidance logic
   - Difficulty scaling

7. **Power-up System**
   - Temporary effects (speed boost, invulnerability, etc.)
   - Visual indicators for active power-ups
   - Timer system for power-up duration

8. **Asset System**
   - Easily replaceable sprite system
   - Support for custom snake skins, food graphics, and backgrounds
   - Support for animation frames

9. **Game States**
   - Main menu, game, pause, game over screens
   - Transition effects between states

### Performance Requirements
- Maintain 60 FPS on modern browsers
- Responsive design for different screen sizes
- Touch support for mobile play

## Project Schema

### Data Structures

```javascript
// Game State
{
  state: "menu" | "playing" | "paused" | "gameOver",
  score: number,
  highScore: number,
  level: number,
  speedModifier: number
}

// Player Snake
{
  segments: Array<{x: number, y: number, radius: number}>,
  velocity: {x: number, y: number},
  speed: number,
  angle: number,
  turningSpeed: number,
  baseLength: number,
  targetLength: number,
  activePowerups: Array<{type: string, duration: number}>,
  skin: string
}

// AI Snake
{
  id: string,
  segments: Array<{x: number, y: number, radius: number}>,
  velocity: {x: number, y: number},
  speed: number,
  angle: number,
  behavior: "aggressive" | "passive" | "territorial" | "random",
  targetPosition: {x: number, y: number},
  skin: string,
  difficulty: number
}

// Food
{
  position: {x: number, y: number},
  type: "regular" | "speed" | "slowDown" | "extraGrowth" | "inverse" | "ghost",
  value: number,
  radius: number,
  sprite: string
}

// Power-up
{
  position: {x: number, y: number},
  type: string,
  duration: number,
  effect: Function,
  sprite: string
}

// Settings
{
  soundEnabled: boolean,
  musicVolume: number,
  sfxVolume: number,
  difficulty: "easy" | "medium" | "hard",
  periodicBoundaries: boolean,
  touchControls: boolean
}
```

### File Structure

```
snake-game/
├── index.html
├── favicon.ico
├── assets/
│   ├── images/
│   │   ├── snakes/
│   │   ├── food/
│   │   ├── powerups/
│   │   └── ui/
│   ├── audio/
│   │   ├── music/
│   │   └── sfx/
│   └── fonts/
├── src/
│   ├── main.js
│   ├── game.js
│   ├── entities/
│   │   ├── snake.js
│   │   ├── aiSnake.js
│   │   ├── food.js
│   │   └── powerup.js
│   ├── systems/
│   │   ├── collision.js
│   │   ├── input.js
│   │   ├── audio.js
│   │   ├── renderer.js
│   │   └── ai.js
│   ├── utils/
│   │   ├── vector.js
│   │   ├── math.js
│   │   └── helpers.js
│   └── ui/
│       ├── menu.js
│       ├── hud.js
│       └── screens.js
├── styles/
│   └── main.css
└── dist/ (for production build)
```

## User Flow

### Game Flow Diagram
1. **Launch Game** → Main Menu
2. From Main Menu:
   - **Play** → Game Setup → Game
   - **Settings** → Settings Menu → Main Menu
   - **How to Play** → Instructions → Main Menu
3. During Game:
   - **Pause** → Pause Menu → Resume/Quit
   - **Game Over** → Score Screen → Retry/Main Menu

### Detailed User Flow

#### 1. Main Menu
- **Display**: Game title, Play button, Settings button, How to Play button
- **User Actions**: 
  - Click Play: Proceed to game setup or directly to game
  - Click Settings: Open settings menu
  - Click How to Play: Show game instructions

#### 2. Game Setup (Optional)
- **Display**: Difficulty selection, Snake skin selection, Toggle for periodic boundaries
- **User Actions**:
  - Select options
  - Click Start Game: Begin gameplay

#### 3. Gameplay
- **Display**: Game arena, player snake, AI snakes, food items, power-ups, score display
- **User Actions**:
  - Move snake (keyboard arrows/WASD or touch controls)
  - Pause game (ESC key or pause button)
  - Use special abilities (if implemented)

#### 4. Pause Menu
- **Display**: Resume, Restart, Settings, Quit to Main Menu
- **User Actions**:
  - Click Resume: Continue gameplay
  - Click Restart: Reset current game
  - Click Settings: Adjust game settings
  - Click Quit: Return to main menu

#### 5. Game Over Screen
- **Display**: Final score, High score, Retry button, Main Menu button
- **User Actions**:
  - Click Retry: Start new game with same settings
  - Click Main Menu: Return to main menu

#### 6. Settings Menu
- **Display**: Sound toggles, volume sliders, difficulty settings, control options
- **User Actions**:
  - Adjust settings
  - Click Save: Apply settings and return to previous screen

## Implementation Phases

### Phase 1: Core Mechanics
- Set up project structure
- Implement basic canvas rendering
- Create player snake with continuous movement
- Implement periodic boundary conditions
- Basic collision detection
- Simple food spawning

### Phase 2: AI and Advanced Features
- Implement AI snakes with basic behavior
- Add different food types
- Create power-up system
- Enhance collision system for non-grid movement
- Implement advanced AI behaviors

### Phase 3: Polish and Assets
- Add menu screens and game states
- Implement score system
- Create asset loading system for custom sprites
- Add sound effects and music
- Optimize performance
- Add mobile support

### Phase 4: Testing and Refinement
- Cross-browser testing
- Performance optimization
- Gameplay balancing
- Bug fixing
