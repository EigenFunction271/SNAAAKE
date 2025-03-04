export class PlaceholderAssets {
  static createPlaceholderImage(
    width: number,
    height: number,
    color: string,
    shape: 'rect' | 'star'
  ): HTMLImageElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Fill background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Draw shape
    ctx.fillStyle = color;
    if (shape === 'star') {
      this.drawStar(ctx, width/2, height/2, 5, width/3, width/6);
    } else {
      ctx.fillRect(2, 2, width-4, height-4);
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
    let duration = type === 'background' ? 2.0 : 0.1;
    let buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    let data = buffer.getChannelData(0);

    switch(type) {
      case 'collect':
        this.generateBeep(data, 440, sampleRate); // A4 note
        break;
      case 'collision':
        this.generateNoise(data, 0.3);
        break;
      case 'powerup':
        this.generateBeep(data, 880, sampleRate); // A5 note
        break;
      case 'gameover':
        this.generateBeep(data, 220, sampleRate); // A3 note
        break;
      case 'background':
        this.generateAmbient(data, sampleRate);
        break;
    }

    return buffer;
  }

  private static drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, points: number, outer: number, inner: number) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outer : inner;
      const angle = (i * Math.PI) / points;
      const pX = x + radius * Math.sin(angle);
      const pY = y + radius * Math.cos(angle);
      if (i === 0) ctx.moveTo(pX, pY);
      else ctx.lineTo(pX, pY);
    }
    ctx.closePath();
    ctx.fill();
  }

  private static generateBeep(data: Float32Array, frequency: number, sampleRate: number) {
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.5;
    }
  }

  private static generateNoise(data: Float32Array, volume: number) {
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * volume;
    }
  }

  private static generateAmbient(data: Float32Array, sampleRate: number) {
    const frequencies = [220, 277.18, 329.63]; // A3, C#4, E4
    for (let i = 0; i < data.length; i++) {
      let sample = 0;
      frequencies.forEach(freq => {
        sample += Math.sin(2 * Math.PI * freq * i / sampleRate) * 0.2;
      });
      data[i] = sample / frequencies.length;
    }
  }
} 