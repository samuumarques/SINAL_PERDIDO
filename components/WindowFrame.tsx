
import React, { useRef, useEffect, useState } from 'react';
import { WindowState } from '../types';
import { soundManager } from '../audio';

interface WindowFrameProps {
  windowState: WindowState;
  isActive: boolean;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number) => void;
  scale?: number;
}

const WindowFrame: React.FC<WindowFrameProps> = ({ 
  windowState, isActive, onClose, onMinimize, onFocus, onMove, onResize, scale = 1
}) => {
  const titleBarRef = useRef<HTMLDivElement>(null);
  
  // Drag State
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });

  // Resize State
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, winW: 0, winH: 0, direction: '' });

  // Handle Dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault(); 
      
      // Divide delta by scale to account for CSS transform
      const deltaX = (e.clientX - dragStart.current.mouseX) / scale;
      const deltaY = (e.clientY - dragStart.current.mouseY) / scale;
      
      const newX = dragStart.current.winX + deltaX;
      const newY = dragStart.current.winY + deltaY;
      
      onMove(windowState.id, newX, newY);
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, windowState.id, onMove, scale]);

  // Handle Resizing
  useEffect(() => {
      const handleResizeMove = (e: MouseEvent) => {
          if (!isResizing) return;
          e.preventDefault();

          // CRITICAL FIX: Divide delta by scale
          const deltaX = (e.clientX - resizeStart.current.mouseX) / scale;
          const deltaY = (e.clientY - resizeStart.current.mouseY) / scale;
          const { winW, winH, direction } = resizeStart.current;

          let newW = winW;
          let newH = winH;

          if (direction.includes('e')) newW = Math.max(300, winW + deltaX);
          if (direction.includes('s')) newH = Math.max(200, winH + deltaY);
          
          // Safety cap to prevent window from becoming wider than screen roughly
          if (newW > 3000) newW = 3000;
          if (newH > 2000) newH = 2000;

          onResize(windowState.id, newW, newH);
      };

      const handleResizeUp = () => setIsResizing(false);

      if (isResizing) {
          document.addEventListener('mousemove', handleResizeMove);
          document.addEventListener('mouseup', handleResizeUp);
          document.body.style.cursor = resizeStart.current.direction === 'se' ? 'se-resize' : resizeStart.current.direction === 'e' ? 'e-resize' : 's-resize';
          document.body.style.userSelect = 'none'; // Prevent text selection
      } else {
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
      }
      return () => {
          document.removeEventListener('mousemove', handleResizeMove);
          document.removeEventListener('mouseup', handleResizeUp);
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
      };
  }, [isResizing, windowState.id, onResize, scale]);


  const handleMouseDown = (e: React.MouseEvent) => {
    // Bring to front
    onFocus(windowState.id);

    // Start drag only if clicking title bar and not buttons
    if (titleBarRef.current && titleBarRef.current.contains(e.target as Node) && !(e.target as HTMLElement).closest('button')) {
      setIsDragging(true);
      dragStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        winX: windowState.position.x,
        winY: windowState.position.y
      };
    }
  };

  const initResize = (e: React.MouseEvent, direction: string) => {
      e.stopPropagation();
      e.preventDefault(); 
      onFocus(windowState.id);
      setIsResizing(true);
      resizeStart.current = {
          mouseX: e.clientX,
          mouseY: e.clientY,
          winW: windowState.size.w,
          winH: windowState.size.h,
          direction
      };
  };

  if (!windowState.isOpen || windowState.isMinimized) return null;

  return (
    <div 
      className={`
        absolute flex flex-col bg-[#c0c0c0] win-outset p-1 transition-all duration-75
        ${isActive 
          ? 'shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.5)] z-[100]' // Deep shadow + subtle white outline for "pop"
          : 'shadow-lg opacity-95 grayscale-[0.1]'}
      `}
      style={{
        left: windowState.position.x,
        top: windowState.position.y,
        width: windowState.size.w,
        height: windowState.size.h,
        zIndex: windowState.zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Title Bar */}
      <div 
        ref={titleBarRef}
        className={`
          flex items-center justify-between px-1 py-0.5 mb-1 select-none cursor-default transition-colors
          ${isActive 
            ? 'bg-gradient-to-r from-[#000080] to-[#1084d0] text-white' // Win98 Active Gradient
            : 'bg-[#808080] text-[#c0c0c0]'} // Inactive Grey
        `}
      >
        <div className="flex items-center gap-1 font-ui font-bold text-sm truncate pr-2">
          {windowState.icon && <span className="w-4 h-4 flex items-center justify-center filter drop-shadow-sm text-lg">{windowState.icon}</span>}
          <span className="tracking-wide pt-0.5 truncate">{windowState.title}</span>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button 
            className="w-4 h-4 flex items-center justify-center bg-[#c0c0c0] text-black win-outset active:win-inset text-xs font-bold leading-none pb-1.5 focus:outline-none"
            onClick={(e) => { 
              e.stopPropagation(); 
              soundManager.play('click');
              onMinimize(windowState.id); 
            }}
            aria-label="Minimize"
          >
            _
          </button>
          <button 
            className="w-4 h-4 flex items-center justify-center bg-[#c0c0c0] text-black win-outset active:win-inset text-xs font-bold leading-none pb-0.5 focus:outline-none"
            onClick={(e) => { 
              e.stopPropagation(); 
              soundManager.play('click'); 
              onClose(windowState.id); 
            }}
            aria-label="Close"
          >
            X
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div 
          className="flex-1 overflow-hidden relative bg-[#c0c0c0] flex flex-col"
          onMouseDown={(e) => e.stopPropagation()} // Prevent dragging from content
      >
        {windowState.content}
      </div>

      {/* Resize Handles (Thicker for better usability) */}
      {/* Right Edge */}
      <div 
        className="absolute top-0 right-0 w-3 h-full cursor-e-resize z-50 hover:bg-black/5 transition-colors -mr-1"
        onMouseDown={(e) => initResize(e, 'e')}
      />
      {/* Bottom Edge */}
      <div 
        className="absolute bottom-0 left-0 w-full h-3 cursor-s-resize z-50 hover:bg-black/5 transition-colors -mb-1"
        onMouseDown={(e) => initResize(e, 's')}
      />
      {/* Bottom Right Corner (Grip) */}
      <div 
        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-50 flex items-end justify-end p-[2px] -mr-1 -mb-1"
        onMouseDown={(e) => initResize(e, 'se')}
      >
          {/* Visual Grip Lines */}
          <div className="absolute bottom-1 right-1 w-3 h-3 pointer-events-none" style={{
               backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 2px, #404040 2px, #404040 3px)`,
               clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)'
          }}></div>
      </div>
    </div>
  );
};

export default WindowFrame;
