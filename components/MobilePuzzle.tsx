import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../audio';

interface MobilePuzzleProps {
  word: string;
  onComplete: () => void;
}

const MobilePuzzle: React.FC<MobilePuzzleProps> = ({ word, onComplete }) => {
  const [typedIndex, setTypedIndex] = useState(0);
  const [letters, setLetters] = useState<{ char: string; x: number; y: number; vx: number; vy: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // Initialize letters
  useEffect(() => {
    setTypedIndex(0);
    const shuffled = word.split('').sort(() => Math.random() - 0.5);
    setLetters(shuffled.map(char => ({
      char,
      x: Math.random() * (window.innerWidth - 60),
      y: Math.random() * (window.innerHeight - 60),
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
    })));
  }, [word]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setLetters(prevLetters => prevLetters.map(l => {
        let newX = l.x + l.vx;
        let newY = l.y + l.vy;
        let newVx = l.vx;
        let newVy = l.vy;
        
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return { ...l, x: newX, y: newY };

        if (newX < 0 || newX > rect.width - 50) newVx = -newVx;
        if (newY < 0 || newY > rect.height - 50) newVy = -newVy;

        return { ...l, x: newX, y: newY, vx: newVx, vy: newVy };
      }));
      animationFrameId.current = requestAnimationFrame(animate);
    };
    animationFrameId.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Keyboard input handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const expectedChar = word[typedIndex];
      if (e.key.toUpperCase() === expectedChar) {
        soundManager.play('puzzle_hit'); // Use new jarring sound
        const newIndex = typedIndex + 1;
        setTypedIndex(newIndex);
        if (newIndex === word.length) {
          onComplete();
        }
      } else {
        soundManager.play('error');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [typedIndex, word, onComplete]);

  const progress = word.substring(0, typedIndex);
  const remaining = "_ ".repeat(word.length - typedIndex);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[10001] overflow-hidden pointer-events-none">
      {/* Floating letters */}
      {letters.map((l, i) => (
        <div
          key={i}
          className="floating-letter"
          style={{ transform: `translate(${l.x}px, ${l.y}px)` }}
        >
          {l.char}
        </div>
      ))}

      {/* Progress display */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center pointer-events-auto">
        <p className="text-gray-400 text-lg mb-2">DIGITE A PALAVRA</p>
        <div className="text-4xl font-term text-white tracking-[0.5em] bg-black/50 px-4 py-2">
          <span className="text-green-400">{progress}</span>
          <span className="text-gray-500 animate-pulse">{remaining}</span>
        </div>
      </div>
    </div>
  );
};

export default MobilePuzzle;