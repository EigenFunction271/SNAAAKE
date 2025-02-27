interface TransitionEffect {
  enter: (ctx: CanvasRenderingContext2D, duration: number) => Promise<void>;
  exit: (ctx: CanvasRenderingContext2D, duration: number) => Promise<void>;
}

export class Transitions {
  static async fade(
    ctx: CanvasRenderingContext2D,
    type: 'in' | 'out',
    duration: number = 500
  ): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const alpha = type === 'in' ? 1 - progress : progress;
        
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }

  static async pixelate(
    ctx: CanvasRenderingContext2D,
    type: 'in' | 'out',
    duration: number = 500
  ): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const { width, height } = ctx.canvas;
      
      // Create temporary canvas for effect
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCanvas.width = width;
      tempCanvas.height = height;
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const size = type === 'in' 
          ? Math.max(1, 32 * (1 - progress))
          : Math.max(1, 32 * progress);
        
        // Draw current frame to temp canvas
        tempCtx.drawImage(ctx.canvas, 0, 0);
        
        // Clear main canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw pixelated version
        for (let x = 0; x < width; x += size) {
          for (let y = 0; y < height; y += size) {
            const sx = Math.min(x, width - size);
            const sy = Math.min(y, height - size);
            
            ctx.drawImage(
              tempCanvas,
              sx, sy, size, size,
              sx, sy, size, size
            );
          }
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }
} 