# Snaaake

A modern take on the classic snake game, featuring neon graphics, AI opponents, power-ups, and particle effects.

## Features

- Smooth, vector-based snake movement
- Multiple AI opponents with different behaviors
- Power-up system with special abilities
- Particle effects and neon graphics
- Background music and sound effects
- Local high score system
- Touch support for mobile devices

## Tech Stack

- Next.js + TypeScript
- HTML5 Canvas
- Web Audio API
- Tailwind CSS
- Local Storage API

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/snaaake.git
cd snaaake
```

2. Install dependencies:
```bash
npm install
```

### Windows (PowerShell):
1. Clone the repository:
```powershell
git clone https://github.com/yourusername/neon-snake.git
Set-Location -Path ".\neon-snake"
```

2. Install dependencies:
```powershell
npm install
```

3. If you encounter permission issues:
```powershell
# Run PowerShell as Administrator and execute:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Prerequisites

### Windows Users: Installing Node.js
1. Download Node.js installer:
   - Visit [https://nodejs.org/](https://nodejs.org/)
   - Download the LTS (Long Term Support) version
   - Run the downloaded `.msi` installer

2. Verify installation:
```powershell
# Close and reopen PowerShell, then run:
node --version
npm --version
```

3. If the commands still aren't recognized:
   - Press Win + X
   - Click "System"
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", find and select "Path"
   - Click "Edit"
   - Click "New"
   - Add `C:\Program Files\nodejs\`
   - Click "OK" on all windows
   - Close and reopen PowerShell

Alternative Installation Using Chocolatey:
```powershell
# First, install Chocolatey (Run PowerShell as Administrator):
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Then install Node.js:
choco install nodejs-lts

# Close and reopen PowerShell, then verify:
node --version
npm --version
```

### Then proceed with project setup:

### Running the Game:

1. Development mode (uses placeholder assets):
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Using Custom Assets

The game uses placeholder assets in development mode. To use your own assets:

1. Create assets folder structure:

### Unix/Linux/Mac:
```bash
mkdir -p public/assets/{audio/{sfx,music},images/{powerups,ui}}
```

### Windows (PowerShell):
```powershell
New-Item -Path "public/assets/audio/sfx" -ItemType Directory -Force
New-Item -Path "public/assets/audio/music" -ItemType Directory -Force
New-Item -Path "public/assets/images/powerups" -ItemType Directory -Force
New-Item -Path "public/assets/images/ui" -ItemType Directory -Force
```

2. Final structure should look like:
```
public/
└── assets/
    ├── audio/
    │   ├── sfx/
    │   │   ├── collect.mp3
    │   │   ├── collision.mp3
    │   │   ├── powerup.mp3
    │   │   └── gameover.mp3
    │   └── music/
    │       └── background.mp3
    └── images/
        ├── powerups/
        │   ├── speed.png
        │   ├── invulnerability.png
        │   └── ghost.png
        └── ui/
            └── logo.png
```

3. Create environment file:

### Unix/Linux/Mac:
```bash
echo "NEXT_PUBLIC_USE_REAL_ASSETS=true" > .env.local
```

### Windows (PowerShell):
```powershell
Set-Content -Path ".env.local" -Value "NEXT_PUBLIC_USE_REAL_ASSETS=true"
```

4. Asset Requirements:
   - Images: PNG format, transparent background
     - Power-ups: 32x32px
     - Logo: 200x60px
   - Audio: MP3 format
     - SFX: Short duration (0.2-1s)
     - Background Music: 2-3 minutes, loops well

5. Build and start:
```bash
npm run build
npm run start
# Commands are the same for PowerShell
```

## Controls

### Desktop
- Arrow keys or WASD to control snake direction
- Up Arrow or W for speed boost
- Space/Enter to start game
- ESC to pause
- R to restart after game over

### Mobile
- Virtual joystick for direction
- Boost button for speed increase
- Tap screen to start/restart

## Development

### Using Placeholder Assets
- Development mode automatically uses generated placeholders
- Includes basic geometric shapes for visuals
- Synthesized sounds for audio
- No external files needed for testing

### Asset Customization
To modify placeholder assets during development:
1. Edit `utils/placeholder-assets.tsx` for visual changes
2. Adjust sound generation parameters for audio changes
3. Changes will be reflected immediately in dev mode

### Troubleshooting (Windows)

If you encounter issues:

1. Node.js version conflicts:
```powershell
# Check Node.js version
node --version

# If needed, install/update Node.js using nvm-windows
# https://github.com/coreybutler/nvm-windows
```

2. Port conflicts:
```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed (replace PID with actual process ID)
taskkill /PID <PID> /F
```

3. File permission issues:
```powershell
# Reset npm cache
npm cache clean --force

# Run with administrative privileges
Start-Process powershell -Verb RunAs
```

## Contributing

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Sound effects from [sources listed in asset guide]
- Background music by [credit music creator]
- Inspired by classic snake games and modern arcade titles
