import { useEffect, useRef } from 'react';

interface TouchControlsProps {
  onDirectionChange: (direction: { x: number; y: number }) => void;
  onBoostStart: () => void;
  onBoostEnd: () => void;
}

export function TouchControls({ onDirectionChange, onBoostStart, onBoostEnd }: TouchControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const currentPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (!joystickRef.current || !knobRef.current) return;
      
      const touch = e.touches[0];
      const rect = joystickRef.current.getBoundingClientRect();
      
      touchStartPos.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
      
      currentPos.current = { ...touchStartPos.current };
      
      // Update knob position
      knobRef.current.style.transform = `translate(0px, 0px)`;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!joystickRef.current || !knobRef.current || !touchStartPos.current) return;
      
      const touch = e.touches[0];
      const rect = joystickRef.current.getBoundingClientRect();
      
      currentPos.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };

      // Calculate direction vector
      const dx = currentPos.current.x - touchStartPos.current.x;
      const dy = currentPos.current.y - touchStartPos.current.y;
      
      // Limit joystick movement radius
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxRadius = 40;
      const scale = distance > maxRadius ? maxRadius / distance : 1;
      
      const scaledX = dx * scale;
      const scaledY = dy * scale;

      // Update knob position
      knobRef.current.style.transform = `translate(${scaledX}px, ${scaledY}px)`;

      // Normalize and send direction
      const normalizedX = dx / Math.max(distance, maxRadius);
      const normalizedY = dy / Math.max(distance, maxRadius);
      onDirectionChange({ x: normalizedX, y: normalizedY });
    };

    const handleTouchEnd = () => {
      if (!knobRef.current) return;
      
      touchStartPos.current = null;
      currentPos.current = null;
      
      // Reset knob position
      knobRef.current.style.transform = `translate(0px, 0px)`;
      
      // Reset direction
      onDirectionChange({ x: 0, y: 0 });
    };

    const joystick = joystickRef.current;
    if (joystick) {
      joystick.addEventListener('touchstart', handleTouchStart);
      joystick.addEventListener('touchmove', handleTouchMove);
      joystick.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (joystick) {
        joystick.removeEventListener('touchstart', handleTouchStart);
        joystick.removeEventListener('touchmove', handleTouchMove);
        joystick.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [onDirectionChange]);

  return (
    <div className="fixed bottom-0 left-0 w-full p-4 flex justify-between items-center pointer-events-none">
      {/* Joystick */}
      <div 
        ref={joystickRef}
        className="w-32 h-32 rounded-full bg-black/50 border-2 border-cyan-500/30 relative pointer-events-auto touch-none"
      >
        <div 
          ref={knobRef}
          className="w-16 h-16 rounded-full bg-cyan-500/30 border-2 border-cyan-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
        />
      </div>

      {/* Boost button */}
      <button
        className="w-20 h-20 rounded-full bg-purple-500/30 border-2 border-purple-500 pointer-events-auto active:bg-purple-500/50 transition-colors"
        onTouchStart={onBoostStart}
        onTouchEnd={onBoostEnd}
      >
        BOOST
      </button>
    </div>
  );
} 