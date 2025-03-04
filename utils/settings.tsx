export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameSettings {
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  difficulty: Difficulty;
  periodicBoundaries: boolean;
  touchControls: boolean;
}

// Default settings
export const defaultSettings: GameSettings = {
  soundEnabled: true,
  musicVolume: 0.7,
  sfxVolume: 1.0,
  difficulty: 'medium',
  periodicBoundaries: true,
  touchControls: false,
};

// Settings manager with local storage
export class SettingsManager {
  private static instance: SettingsManager;
  private settings: GameSettings;
  private isClient = typeof window !== 'undefined';

  private constructor() {
    this.settings = defaultSettings;
    if (this.isClient) {
      const savedSettings = localStorage.getItem('snakeGameSettings');
      if (savedSettings) {
        this.settings = { ...defaultSettings, ...JSON.parse(savedSettings) };
      }
    }
  }

  static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  getSettings(): GameSettings {
    return this.settings;
  }

  updateSettings(newSettings: Partial<GameSettings>): void {
    if (!this.isClient) return;
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem('snakeGameSettings', JSON.stringify(this.settings));
  }
} 