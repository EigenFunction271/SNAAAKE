import { PlaceholderAssets } from "./placeholder-assets"

type AssetType = 'image' | 'audio';

interface Asset {
  type: AssetType;
  path: string;
  loaded: boolean;
  data?: HTMLImageElement | AudioBuffer;
}

export class AssetManager {
  private static instance: AssetManager;
  private assets: Map<string, Asset> = new Map();
  private audioContext: AudioContext | null = null;
  private loadingPromises: Promise<void>[] = [];
  private isClient = typeof window !== 'undefined';

  private constructor() {
    this.initializeAssets();
  }

  static getInstance(): AssetManager {
    if (typeof window === 'undefined') {
      // Return a mock instance for server-side rendering
      return new AssetManager(); // Will be initialized with empty state
    }
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  private initializeAssets() {
    // Images
    const images = {
      'powerup-speed': '/assets/images/powerups/speed.png',
      'powerup-invulnerability': '/assets/images/powerups/invulnerability.png',
      'powerup-ghost': '/assets/images/powerups/ghost.png',
      'logo': '/assets/images/ui/logo.png',
    };

    // Audio
    const audio = {
      'sfx-collect': '/assets/audio/sfx/collect.mp3',
      'sfx-collision': '/assets/audio/sfx/collision.mp3',
      'sfx-powerup': '/assets/audio/sfx/powerup.mp3',
      'sfx-gameover': '/assets/audio/sfx/gameover.mp3',
      'music-background': '/assets/audio/music/background.mp3',
    };

    // Register all assets
    Object.entries(images).forEach(([key, path]) => {
      this.assets.set(key, { type: 'image', path, loaded: false });
    });

    Object.entries(audio).forEach(([key, path]) => {
      this.assets.set(key, { type: 'audio', path, loaded: false });
    });
  }

  async loadAll(): Promise<void> {
    try {
      const loadPromises = Array.from(this.assets.values()).map(async (asset) => {
        try {
          if (asset.type === 'image') {
            await this.loadImage(asset.path);
          } else if (asset.type === 'audio') {
            await this.loadAudio(asset.path);
          }
        } catch (error) {
          console.warn(`Failed to load asset ${asset.path}:`, error);
          // Continue loading other assets
        }
      });
      await Promise.all(loadPromises);
    } catch (error) {
      console.error('Asset loading error:', error);
    }
  }

  private async loadImage(key: string): Promise<void> {
    const asset = this.assets.get(key);
    if (!asset || asset.type !== 'image') return;

    try {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          asset.data = img;
          asset.loaded = true;
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load image ${asset.path}, using placeholder`);
          asset.data = PlaceholderAssets.createPlaceholderImage(32, 32, '#fff', 'rect');
          asset.loaded = true;
          resolve();
        };
        img.src = asset.path;
      });
    } catch (error) {
      console.warn(`Error loading image ${asset.path}, using placeholder`);
      asset.data = PlaceholderAssets.createPlaceholderImage(32, 32, '#fff', 'rect');
      asset.loaded = true;
    }
  }

  private async loadAudio(key: string): Promise<void> {
    if (!this.isClient) return;
    const asset = this.assets.get(key);
    if (!asset || asset.type !== 'audio') return;

    try {
      const response = await fetch(asset.path);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.getAudioContext().decodeAudioData(arrayBuffer);
      
      asset.data = audioBuffer;
      asset.loaded = true;
    } catch (error) {
      console.warn(`Failed to load audio ${asset.path}, using placeholder`);
      const type = key.includes('background') ? 'background' : 
                   key.includes('collect') ? 'collect' :
                   key.includes('collision') ? 'collision' :
                   key.includes('powerup') ? 'powerup' : 'gameover';
      asset.data = PlaceholderAssets.createPlaceholderAudio(type);
      asset.loaded = true;
    }
  }

  private loadPlaceholders(): void {
    this.assets.forEach((asset, key) => {
      if (asset.type === 'image') {
        // Create placeholder images
        switch (key) {
          case 'powerup-speed':
            asset.data = PlaceholderAssets.createPlaceholderImage(32, 32, '#ff0', 'star');
            break;
          case 'powerup-invulnerability':
            asset.data = PlaceholderAssets.createPlaceholderImage(32, 32, '#f0f', 'star');
            break;
          case 'powerup-ghost':
            asset.data = PlaceholderAssets.createPlaceholderImage(32, 32, '#0ff', 'star');
            break;
          case 'logo':
            asset.data = PlaceholderAssets.createPlaceholderImage(200, 60, '#fff', 'rect');
            break;
        }
      } else if (asset.type === 'audio') {
        // Create placeholder sounds
        const soundType = key.split('-')[1] as 'collect' | 'collision' | 'powerup' | 'gameover' | 'background';
        asset.data = PlaceholderAssets.createPlaceholderAudio(soundType);
      }
      asset.loaded = true;
    });
  }

  getImage(key: string): HTMLImageElement | undefined {
    const asset = this.assets.get(key);
    return asset?.type === 'image' ? asset.data as HTMLImageElement : undefined;
  }

  getAudio(key: string): AudioBuffer | undefined {
    const asset = this.assets.get(key);
    return asset?.type === 'audio' ? asset.data as AudioBuffer : undefined;
  }

  getLoadingProgress(): number {
    const total = this.assets.size;
    const loaded = Array.from(this.assets.values()).filter(a => a.loaded).length;
    return loaded / total;
  }

  private getAudioContext(): AudioContext {
    if (!this.isClient) {
      throw new Error('AudioContext is not available in server environment');
    }
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }
}