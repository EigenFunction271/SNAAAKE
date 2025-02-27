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
  private audioContext: AudioContext;
  private loadingPromises: Promise<void>[] = [];

  private constructor() {
    this.audioContext = new AudioContext();
    this.initializeAssets();
  }

  static getInstance(): AssetManager {
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
    // Check if we're using real assets or placeholders
    const usePlaceholders = process.env.NODE_ENV === 'development';

    if (usePlaceholders) {
      this.loadPlaceholders();
      return;
    }

    this.assets.forEach((asset, key) => {
      if (asset.type === 'image') {
        this.loadingPromises.push(this.loadImage(key));
      } else {
        this.loadingPromises.push(this.loadAudio(key));
      }
    });

    await Promise.all(this.loadingPromises);
  }

  private async loadImage(key: string): Promise<void> {
    const asset = this.assets.get(key);
    if (!asset || asset.type !== 'image') return;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        asset.data = img;
        asset.loaded = true;
        resolve();
      };
      img.onerror = reject;
      img.src = asset.path;
    });
  }

  private async loadAudio(key: string): Promise<void> {
    const asset = this.assets.get(key);
    if (!asset || asset.type !== 'audio') return;

    const response = await fetch(asset.path);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    
    asset.data = audioBuffer;
    asset.loaded = true;
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
} 