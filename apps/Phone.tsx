import React, { useState } from 'react';
import { soundManager } from '../audio';
import { GameState } from '../types';

interface PhoneProps {
  gameState: GameState;
  onAction: (action: string) => void;
}

const Phone: React.FC<PhoneProps> = ({ gameState, onAction }) => {
  const [display, setDisplay] = useState('');

  const handlePress = (key: string) => {
      if (key === 'C') {
          setDisplay('');
          soundManager.play('click');
      } else if (key === 'CALL') {
          if (display === '911') {
              soundManager.play('click');
              // Trigger the ending sequence
              onAction('TRIGGER_CALL');
          } else {
              soundManager.play('error');
              setDisplay('DISCONNECTED');
              setTimeout(() => setDisplay(''), 1500);
          }
      } else {
          if (display.length < 10) {
            setDisplay(prev => prev + key);
            // Simple synth beep simulation
            soundManager.playTone("C5", "16n");
          }
      }
  };

  return (
    <div className="flex flex-col h-full bg-[#e0e0e0] p-4 items-center">
        <div className="w-full bg-[#92a892] border-4 border-inset border-[#708070] h-16 mb-4 flex items-center justify-end px-4 text-3xl font-term tracking-widest shadow-inner">
            {display}
        </div>

        <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0].map(k => (
                <button
                    key={k}
                    onClick={() => handlePress(String(k))}
                    className={`h-12 text-xl font-bold win-outset active:win-inset bg-gray-200 active:bg-gray-300 ${k === 'C' ? 'text-red-600' : 'text-black'}`}
                >
                    {k}
                </button>
            ))}
            <button
                onClick={() => handlePress('CALL')}
                className="h-12 text-xl font-bold win-outset active:win-inset bg-green-600 active:bg-green-700 text-white"
            >
                📞
            </button>
        </div>
    </div>
  );
};

export default Phone;