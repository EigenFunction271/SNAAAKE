export interface GameSettings {
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  difficulty: 'easy' | 'normal' | 'hard';
  periodicBoundaries: boolean;
  touchControls: boolean;
  particleEffects: boolean;
  screenShake: boolean;
}

export class SettingsManager {
  private static readonly STORAGE_KEY = 'snakeGameSettings';

  private static defaultSettings: GameSettings = {
    soundEnabled: true,
    musicVolume: 0.7,
    sfxVolume: 1.0,
    difficulty: 'normal',
    periodicBoundaries: true,
    touchControls: false,
    particleEffects: true,
    screenShake: true,
  };

  static getSettings(): GameSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? { ...this.defaultSettings, ...JSON.parse(stored) } : this.defaultSettings;
    } catch (error) {
      console.error('Failed to read settings:', error);
      return this.defaultSettings;
    }
  }

  static updateSettings(newSettings: Partial<GameSettings>): void {
    try {
      const currentSettings = this.getSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  static resetSettings(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.defaultSettings));
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  }
} 