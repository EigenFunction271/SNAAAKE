interface AudioTrack {
  buffer: AudioBuffer;
  volume: number;
}

export class AudioSystem {
  private static instance: AudioSystem;
  private context: AudioContext;
  private sounds: Map<string, AudioTrack> = new Map();
  private musicTrack: AudioTrack | null = null;
  private musicNode: AudioBufferSourceNode | null = null;
  private settings: SettingsManager;

  private constructor() {
    this.context = new AudioContext();
    this.settings = SettingsManager.getInstance();
    this.loadSounds();
  }

  static getInstance(): AudioSystem {
    if (!AudioSystem.instance) {
      AudioSystem.instance = new AudioSystem();
    }
    return AudioSystem.instance;
  }

  private async loadSounds() {
    const soundFiles = {
      collect: '/sounds/collect.mp3',
      collision: '/sounds/collision.mp3',
      powerup: '/sounds/powerup.mp3',
      gameover: '/sounds/gameover.mp3',
      music: '/sounds/background.mp3',
    };

    for (const [name, path] of Object.entries(soundFiles)) {
      try {
        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
        
        this.sounds.set(name, {
          buffer: audioBuffer,
          volume: name === 'music' ? 0.7 : 1.0,
        });
      } catch (error) {
        console.error(`Failed to load sound: ${name}`, error);
      }
    }
  }

  playSound(type: 'collect' | 'collision' | 'powerup' | 'gameover'): void {
    if (!this.settings.getSettings().soundEnabled) return;

    const sound = this.sounds.get(type);
    if (!sound) return;

    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();
    
    source.buffer = sound.buffer;
    gainNode.gain.value = sound.volume * this.settings.getSettings().sfxVolume;
    
    source.connect(gainNode);
    gainNode.connect(this.context.destination);
    source.start(0);
  }

  playMusic(): void {
    if (!this.settings.getSettings().soundEnabled) return;
    if (this.musicNode) return;

    const music = this.sounds.get('music');
    if (!music) return;

    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();
    
    source.buffer = music.buffer;
    source.loop = true;
    gainNode.gain.value = music.volume * this.settings.getSettings().musicVolume;
    
    source.connect(gainNode);
    gainNode.connect(this.context.destination);
    source.start(0);
    
    this.musicNode = source;
  }

  stopMusic(): void {
    if (this.musicNode) {
      this.musicNode.stop();
      this.musicNode = null;
    }
  }

  setVolume(type: 'music' | 'sfx', level: number): void {
    if (type === 'music') {
      this.settings.updateSettings({ musicVolume: level });
      // Update music volume if playing
      if (this.musicNode) {
        this.stopMusic();
        this.playMusic();
      }
    } else {
      this.settings.updateSettings({ sfxVolume: level });
    }
  }
} 