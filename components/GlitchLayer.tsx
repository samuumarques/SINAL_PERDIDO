import React, { useEffect, useState } from 'react';

interface GlitchLayerProps {
  level: number; // 0 to 5+
  triggerJumpscare?: boolean;
}

const GlitchLayer: React.FC<GlitchLayerProps> = ({ level, triggerJumpscare }) => {
  const [activeGlitch, setActiveGlitch] = useState<'none' | 'static' | 'invert' | 'tear'>('none');
  const [jumpscareVisible, setJumpscareVisible] = useState(false);

  // Passive Glitch Logic based on Level
  useEffect(() => {
    if (level === 0) return;

    const triggerRandomGlitch = () => {
        const chance = level * 0.05; // Level 5 = 25% chance per interval
        if (Math.random() < chance) {
            const types: ('static' | 'invert' | 'tear')[] = ['static', 'tear'];
            if (level > 3) types.push('invert');
            
            const type = types[Math.floor(Math.random() * types.length)];
            setActiveGlitch(type);
            
            // Reset after brief duration
            setTimeout(() => setActiveGlitch('none'), 100 + Math.random() * 200);
        }
    };

    const interval = setInterval(triggerRandomGlitch, 2000); // Check every 2s
    return () => clearInterval(interval);
  }, [level]);

  // Jumpscare Logic
  useEffect(() => {
      if (triggerJumpscare) {
          setJumpscareVisible(true);
          setTimeout(() => setJumpscareVisible(false), 200); // 200ms flash
      }
  }, [triggerJumpscare]);

  if (level === 0 && !triggerJumpscare) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
        {/* Passive Glitches */}
        {activeGlitch === 'static' && (
            <div className="absolute inset-0 bg-white/10 mix-blend-overlay backdrop-grayscale" />
        )}
        {activeGlitch === 'invert' && (
            <div className="absolute inset-0 backdrop-invert" />
        )}
        {activeGlitch === 'tear' && (
            <div className="absolute top-1/2 left-0 w-full h-10 bg-black/50 transform -skew-x-12 translate-x-4 mix-blend-exclusion" />
        )}

        {/* Jumpscare Flash */}
        {jumpscareVisible && (
            <div className="absolute inset-0 bg-black flex items-center justify-center animate-shake-hard">
                <img 
                    src="https://i.imgur.com/bXE2nEL.png" 
                    alt="SCARE" 
                    className="w-full h-full object-cover opacity-80 mix-blend-hard-light"
                />
                <div className="absolute inset-0 bg-red-900/40 mix-blend-multiply" />
            </div>
        )}
    </div>
  );
};

export default GlitchLayer;