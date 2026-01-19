import React, { useEffect, useState } from 'react';
import { WindowState } from '../types';
import { soundManager } from '../audio';

interface TaskbarProps {
  windows: WindowState[];
  activeWindowId: string | null;
  onToggleWindow: (id: string) => void;
  onStartClick: () => void;
  systemIntegrity: number;
}

const Taskbar: React.FC<TaskbarProps> = ({ windows, activeWindowId, onToggleWindow, onStartClick, systemIntegrity }) => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
        const now = new Date();
        setTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine integrity color
  const getIntegrityColor = () => {
      if (systemIntegrity > 70) return 'text-green-800';
      if (systemIntegrity > 30) return 'text-yellow-800';
      return 'text-red-600 animate-pulse font-bold';
  };

  return (
    <div className="h-10 bg-[#c0c0c0] border-t-2 border-[#dfdfdf] flex items-center px-1 fixed bottom-0 w-full z-[10000] select-none font-ui">
      <button 
        className="flex items-center px-2 py-1 font-bold text-black win-outset active:win-inset mr-2 hover:bg-gray-300 active:bg-gray-400"
        onClick={() => {
            soundManager.play('click');
            onStartClick();
        }}
      >
        <img src="https://win98icons.alexmeub.com/icons/png/windows_slanted-1.png" className="w-5 h-5 mr-1" alt="start" />
        Iniciar
      </button>
      
      {/* Vertical Divider */}
      <div className="w-[2px] h-6 bg-[#808080] border-r border-white mx-1"></div>

      <div className="flex-1 flex gap-1 overflow-x-auto h-full items-center pl-1">
        {windows.filter(w => w.isOpen || w.isMinimized).map((win) => {
          const isActive = activeWindowId === win.id && !win.isMinimized;
          return (
            <button
              key={win.id}
              onClick={() => onToggleWindow(win.id)}
              className={`
                h-7 min-w-[140px] max-w-[200px] px-2 flex items-center gap-2 text-sm truncate transition-all
                ${isActive 
                  ? 'bg-[#e0e0e0] win-inset font-bold' 
                  : 'bg-[#c0c0c0] win-outset hover:bg-gray-300'}
              `}
            >
              <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-lg">{win.icon}</span>
              <span className="truncate pt-0.5">{win.title}</span>
            </button>
          );
        })}
      </div>

      {/* System Tray Area */}
      <div className="flex items-center gap-2 px-2 py-1 bg-[#c0c0c0] win-inset border-2 border-gray-400 ml-auto">
        {/* Integrity Indicator */}
        <div className="flex items-center gap-1 text-xs font-ui mr-2 border-r border-gray-400 pr-2" title="Integridade do Sistema">
            <span>SYS:</span>
            <span className={getIntegrityColor()}>{systemIntegrity}%</span>
        </div>
        
        {/* Time */}
        <div className="text-sm font-ui min-w-[50px] text-center">
            {time}
        </div>
      </div>
    </div>
  );
};

export default Taskbar;