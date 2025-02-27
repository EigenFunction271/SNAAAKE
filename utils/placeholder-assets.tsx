export class PlaceholderAssets {
  static createPlaceholderImage(
    width: number,
    height: number,
    color: string,
    shape: 'circle' | 'star' | 'rect' = 'rect'
  ): HTMLImageElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Clear background
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, width, height);

    // Draw shape
    ctx.fillStyle = color;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    switch (shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(width/2, height/2, Math.min(width, height)/2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;

      case 'star':
        const spikes = 5;
        const outerRadius = Math.min(width, height)/2 - 2;
        const innerRadius = outerRadius * 0.4;
        
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI * i) / spikes;
          const x = width/2 + Math.cos(angle) * radius;
          const y = height/2 + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      default:
        ctx.fillRect(2, 2, width-4, height-4);
        ctx.strokeRect(2, 2, width-4, height-4);
    }

    // Convert to image
    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  }

  static createPlaceholderAudio(
    type: 'collect' | 'collision' | 'powerup' | 'gameover' | 'background'
  ): AudioBuffer {
    const sampleRate = 44100;
    const audioContext = new AudioContext();

    // Create different sounds based on type
    switch (type) {
      case 'collect':
        return this.createBeepSound(audioContext, 880, 0.1); // High beep
      case 'collision':
        return this.createNoiseSound(audioContext, 0.2); // Short noise
      case 'powerup':
        return this.createSweepSound(audioContext, 440, 880, 0.3); // Sweep up
      case 'gameover':
        return this.createSweepSound(audioContext, 880, 220, 0.5); // Sweep down
      case 'background':
        return this.createAmbientSound(audioContext, 5); // 5-second loop
      default:
        return this.createBeepSound(audioContext, 440, 0.1); // Default beep
    }
  }

  private static createBeepSound(
    context: AudioContext,
    frequency: number,
    duration: number
  ): AudioBuffer {
    const sampleRate = context.sampleRate;
    const samples = duration * sampleRate;
    const buffer = context.createBuffer(1, samples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < samples; i++) {
      data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) *
                Math.exp(-3 * i / samples); // Add decay
    }

    return buffer;
  }

  private static createNoiseSound(
    context: AudioContext,
    duration: number
  ): AudioBuffer {
    const sampleRate = context.sampleRate;
    const samples = duration * sampleRate;
    const buffer = context.createBuffer(1, samples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < samples; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-5 * i / samples);
    }

    return buffer;
  }

  private static createSweepSound(
    context: AudioContext,
    startFreq: number,
    endFreq: number,
    duration: number
  ): AudioBuffer {
    const sampleRate = context.sampleRate;
    const samples = duration * sampleRate;
    const buffer = context.createBuffer(1, samples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < samples; i++) {
      const t = i / samples;
      const frequency = startFreq + (endFreq - startFreq) * t;
      data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) *
                Math.exp(-2 * i / samples);
    }

    return buffer;
  }

  private static createAmbientSound(
    context: AudioContext,
    duration: number
  ): AudioBuffer {
    const sampleRate = context.sampleRate;
    const samples = duration * sampleRate;
    const buffer = context.createBuffer(1, samples, sampleRate);
    const data = buffer.getChannelData(0);

    // Create a simple ambient drone
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      data[i] = (
        Math.sin(2 * Math.PI * 220 * t) * 0.3 +
        Math.sin(2 * Math.PI * 440 * t) * 0.2 +
        Math.sin(2 * Math.PI * 880 * t) * 0.1
      ) * 0.5;
    }

    return buffer;
  }
} 