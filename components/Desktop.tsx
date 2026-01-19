import React from 'react';
import { WindowId } from '../types';

interface DesktopProps {
  icons: { id: WindowId; label: string; icon: string; hidden?: boolean }[];
  onOpen: (id: WindowId) => void;
}

const Desktop: React.FC<DesktopProps> = ({ icons, onOpen }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full p-4 grid grid-cols-auto-fit-100 gap-6 content-start pointer-events-none">
      {icons.map((item) => !item.hidden && (
        <div
          key={item.id}
          className="w-20 flex flex-col items-center gap-1 pointer-events-auto cursor-pointer group"
          onDoubleClick={() => onOpen(item.id)}
        >
          <div className="w-12 h-12 relative">
             <img 
               src={item.icon} 
               alt={item.label} 
               className="w-full h-full drop-shadow-md group-active:translate-y-0.5"
               style={{ imageRendering: 'pixelated' }}
             />
          </div>
          <span className="text-white text-shadow text-center text-sm bg-black/20 px-1 rounded group-hover:bg-[#000080] group-hover:text-white font-['VT323'] leading-tight">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Desktop;