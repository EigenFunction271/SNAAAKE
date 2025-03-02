interface AudioOptions {
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
}

export class AudioSystem {
  private static instance: AudioSystem | null = null;
  private context: AudioContext;
  private sounds: Map<string, AudioBuffer> = new Map();
  private musicBuffer: AudioBuffer | null = null;
  private musicSource: AudioBufferSourceNode | null = null;
  private musicGain: GainNode;
  private sfxGain: GainNode;

  private constructor() {
    this.context = new AudioContext();
    this.musicGain = this.context.createGain();
    this.sfxGain = this.context.createGain();
    this.musicGain.connect(this.context.destination);
    this.sfxGain.connect(this.context.destination);
    this.loadSounds();
  }

  static getInstance(): AudioSystem {
    if (!AudioSystem.instance) {
      AudioSystem.instance = new AudioSystem();
    }
    return AudioSystem.instance;
  }

  private async loadSounds() {
    try {
      // In development, use placeholder sounds
      if (process.env.NODE_ENV === 'development') {
        this.sounds = await this.loadPlaceholderSounds();
        return;
      }

      // In production, load real sound files
      const soundFiles = {
        collect: '/assets/audio/collect.mp3',
        collision: '/assets/audio/collision.mp3',
        powerup: '/assets/audio/powerup.mp3',
        gameover: '/assets/audio/gameover.mp3'
      };

      for (const [name, path] of Object.entries(soundFiles)) {
        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
        this.sounds.set(name, audioBuffer);
      }

      // Load background music
      const musicResponse = await fetch('/assets/audio/background.mp3');
      const musicArrayBuffer = await musicResponse.arrayBuffer();
      this.musicBuffer = await this.context.decodeAudioData(musicArrayBuffer);
    } catch (error) {
      console.error('Failed to load audio:', error);
    }
  }

  private async loadPlaceholderSounds(): Promise<Map<string, AudioBuffer>> {
    const placeholders = new Map<string, AudioBuffer>();
    const sampleRate = this.context.sampleRate;

    // Create simple beep sounds
    const createBeep = (frequency: number, duration: number) => {
      const length = duration * sampleRate;
      const buffer = this.context.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < length; i++) {
        data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 
                  Math.exp(-3 * i / length);
      }
      
      return buffer;
    };

    placeholders.set('collect', createBeep(880, 0.1));
    placeholders.set('collision', createBeep(220, 0.2));
    placeholders.set('powerup', createBeep(660, 0.15));
    placeholders.set('gameover', createBeep(440, 0.3));

    return placeholders;
  }

  playSound(type: 'collect' | 'collision' | 'powerup' | 'gameover'): void {
    const sound = this.sounds.get(type);
    if (!sound) return;

    const source = this.context.createBufferSource();
    source.buffer = sound;
    source.connect(this.sfxGain);
    source.start();
  }

  playMusic(): void {
    if (this.musicSource || !this.musicBuffer) return;

    this.musicSource = this.context.createBufferSource();
    this.musicSource.buffer = this.musicBuffer;
    this.musicSource.loop = true;
    this.musicSource.connect(this.musicGain);
    this.musicSource.start();
  }

  stopMusic(): void {
    if (this.musicSource) {
      this.musicSource.stop();
      this.musicSource = null;
    }
  }

  setVolume(type: 'music' | 'sfx', level: number): void {
    if (type === 'music') {
      this.musicGain.gain.value = level;
    } else {
      this.sfxGain.gain.value = level;
    }
  }

  updateOptions(options: AudioOptions): void {
    if (!options.soundEnabled) {
      this.stopMusic();
    } else if (!this.musicSource && this.musicBuffer) {
      this.playMusic();
    }

    this.setVolume('music', options.musicVolume);
    this.setVolume('sfx', options.sfxVolume);
  }

  resume(): void {
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }
} 