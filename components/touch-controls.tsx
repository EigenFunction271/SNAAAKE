import { useEffect, useRef, useState } from 'react';

interface TouchControlsProps {
  onDirectionChange: (direction: { x: number; y: number }) => void;
  onBoostStart: () => void;
  onBoostEnd: () => void;
}

export function TouchControls({
  onDirectionChange,
  onBoostStart,
  onBoostEnd
}: TouchControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !joystickRef.current) return;

      const touch = e.touches[0];
      const rect = joystickRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate direction vector
      let dx = touch.clientX - centerX;
      let dy = touch.clientY - centerY;

      // Normalize vector
      const length = Math.sqrt(dx * dx + dy * dy);
      const maxRadius = 50;
      
      if (length > maxRadius) {
        dx = (dx / length) * maxRadius;
        dy = (dy / length) * maxRadius;
      }

      setPosition({ x: dx, y: dy });
      onDirectionChange({
        x: dx / maxRadius,
        y: dy / maxRadius
      });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      setPosition({ x: 0, y: 0 });
      onDirectionChange({ x: 0, y: 0 });
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, onDirectionChange]);

  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-between px-8">
      {/* Joystick */}
      <div 
        className="w-32 h-32 rounded-full bg-black/30 border-2 border-cyan-500/30 relative"
        ref={joystickRef}
        onTouchStart={() => setIsDragging(true)}
      >
        <div
          className="w-16 h-16 rounded-full bg-cyan-500/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`
          }}
        />
      </div>

      {/* Boost button */}
      <button
        className="w-32 h-32 rounded-full bg-purple-500/30 border-2 border-purple-500/30 active:bg-purple-500/50"
        onTouchStart={onBoostStart}
        onTouchEnd={onBoostEnd}
      >
        BOOST
      </button>
    </div>
  );
} 