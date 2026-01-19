import React, { useState, useEffect } from 'react';
import Desktop from './components/Desktop';
import Taskbar from './components/Taskbar';
import WindowFrame from './components/WindowFrame';
import Messenger from './apps/Messenger';
import Browser from './apps/Browser';
import ImageViewer from './apps/ImageViewer';
import Logs from './apps/Logs';
import Phone from './apps/Phone';
import Notepad from './apps/Notepad';
import TransitionScreen from './components/TransitionScreen';
import GlitchLayer from './components/GlitchLayer';
import MobilePuzzle from './components/MobilePuzzle';
import { GameState, WindowState, WindowId, PuzzleState, Day, MobilePuzzleState } from './types';
import { soundManager } from './audio';

interface Settings {
  resolution: number;
  graphics: 'high' | 'medium' | 'low';
  volume: number;
  cursor: 'default' | 'precision' | 'alternate';
}

const SettingsModal = ({ currentSettings, onSave, onCancel }: { currentSettings: Settings, onSave: (settings: Settings) => void, onCancel: () => void }) => {
    const [localSettings, setLocalSettings] = useState(currentSettings);

    return (
      <div className="absolute inset-0 bg-black/50 z-[10000] flex items-center justify-center font-ui">
        <div className="w-[450px] bg-[#c0c0c0] win-outset p-1 flex flex-col">
          <div className="bg-[#000080] text-white font-bold p-1 flex justify-between items-center">
            <span>Configurações</span>
          </div>
          <div className="p-4 space-y-4 text-black">
            {/* Resolução */}
            <div className="flex items-center justify-between">
              <label htmlFor="resolution">Escala da Interface:</label>
              <select id="resolution" className="win-inset p-1" value={localSettings.resolution} onChange={e => setLocalSettings({...localSettings, resolution: Number(e.target.value)})}>
                <option value={1}>Nativa (100%)</option>
                <option value={0.8}>Média (80%)</option>
                <option value={0.6}>Baixa (60%)</option>
              </select>
            </div>
            {/* Gráficos */}
            <fieldset className="border border-gray-500 p-2">
              <legend className="px-1">Gráficos</legend>
              <div className="flex justify-around">
                <label><input type="radio" name="graphics" value="high" checked={localSettings.graphics === 'high'} onChange={e => setLocalSettings({...localSettings, graphics: 'high'})} /> Alto</label>
                <label><input type="radio" name="graphics" value="medium" checked={localSettings.graphics === 'medium'} onChange={e => setLocalSettings({...localSettings, graphics: 'medium'})} /> Médio</label>
                <label><input type="radio" name="graphics" value="low" checked={localSettings.graphics === 'low'} onChange={e => setLocalSettings({...localSettings, graphics: 'low'})} /> Baixo</label>
              </div>
            </fieldset>
            {/* Volume */}
            <div>
              <label htmlFor="volume" className="block mb-1">Volume: {localSettings.volume}</label>
              <input type="range" id="volume" min="0" max="100" value={localSettings.volume} onChange={e => setLocalSettings({...localSettings, volume: Number(e.target.value)})} className="w-full" />
            </div>
            {/* Cursor */}
            <fieldset className="border border-gray-500 p-2">
              <legend className="px-1">Estilo do Cursor</legend>
              <div className="flex justify-around">
                <label><input type="radio" name="cursor" value="default" checked={localSettings.cursor === 'default'} onChange={e => setLocalSettings({...localSettings, cursor: 'default'})} /> Padrão</label>
                <label><input type="radio" name="cursor" value="precision" checked={localSettings.cursor === 'precision'} onChange={e => setLocalSettings({...localSettings, cursor: 'precision'})} /> Precisão</label>
                <label><input type="radio" name="cursor" value="alternate" checked={localSettings.cursor === 'alternate'} onChange={e => setLocalSettings({...localSettings, cursor: 'alternate'})} /> Alternativo</label>
              </div>
            </fieldset>
          </div>
          <div className="flex justify-end gap-2 p-2 pt-0">
            <button className="px-6 py-1 win-outset active:win-inset bg-[#c0c0c0]" onClick={() => { soundManager.play('click'); onSave(localSettings); }}>Salvar</button>
            <button className="px-6 py-1 win-outset active:win-inset bg-[#c0c0c0]" onClick={() => { soundManager.play('click'); onCancel(); }}>Cancelar</button>
          </div>
        </div>
      </div>
    );
};


const PlaceholderApp = ({ text }: { text: string }) => (
    <div className="p-4 font-mono bg-white h-full select-text flex items-center justify-center text-center">
        {text}
    </div>
);

// Helper to get dynamic icons
const getDynamicIcon = (id: WindowId, day: Day): string => {
    switch (id) {
        case 'recycle_bin':
            if (day === 3) return 'https://win98icons.alexmeub.com/icons/png/recycle_bin_full-4.png';
            return 'https://win98icons.alexmeub.com/icons/png/recycle_bin_empty-0.png';
        case 'my_computer':
            if (day === 3) return 'https://win98icons.alexmeub.com/icons/png/msg_error-0.png';
            return 'https://win98icons.alexmeub.com/icons/png/computer_explorer-4.png';
        case 'messenger':
            if (day === 2) return 'https://win98icons.alexmeub.com/icons/png/msg_warning-0.png';
            if (day === 3) return 'https://win98icons.alexmeub.com/icons/png/skull-0.png';
            return 'https://win98icons.alexmeub.com/icons/png/msagent-3.png';
        case 'browser':
             if (day === 3) return 'https://win98icons.alexmeub.com/icons/png/restrict-1.png';
             return 'https://win98icons.alexmeub.com/icons/png/msie1-2.png';
        case 'image_viewer':
             return 'https://win98icons.alexmeub.com/icons/png/paint_file-2.png';
        case 'logs':
             return 'https://win98icons.alexmeub.com/icons/png/notepad_file-2.png';
        case 'email':
             return 'https://win98icons.alexmeub.com/icons/png/outlook_express-4.png';
        case 'notepad':
             return 'https://win98icons.alexmeub.com/icons/png/wordpad-0.png';
        case 'phone':
             return 'https://win98icons.alexmeub.com/icons/png/phone_dialer.png';
        default:
             return 'https://win98icons.alexmeub.com/icons/png/console_prompt-0.png';
    }
};

// Initial default sizes (used for reset)
const DEFAULT_SIZES: Record<string, { w: number, h: number }> = {
    messenger: { w: 500, h: 600 },
    browser: { w: 800, h: 600 },
    image_viewer: { w: 600, h: 500 },
    logs: { w: 600, h: 500 },
    email: { w: 600, h: 500 },
    notepad: { w: 400, h: 400 },
    phone: { w: 320, h: 480 },
    my_computer: { w: 500, h: 400 },
    recycle_bin: { w: 500, h: 400 },
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    puzzles: {
      emailRead: false, articleFound: false, commentsUnlocked: false, desaparecidaFound: false,
      imageDecrypted: false, audioSequenceSolved: false, logsDecrypted: false, backupDecrypted: false
    },
    glitchLevel: 0, systemIntegrity: 100, currentNode: 'start', diaryContent: ''
  });
  
  const [settings, setSettings] = useState<Settings>({
    resolution: 1,
    graphics: 'high',
    volume: 80,
    cursor: 'default',
  });

  const [windows, setWindows] = useState<WindowState[]>([
    { id: 'messenger', title: 'Messenger', isOpen: false, isMinimized: false, zIndex: 10, position: { x: 100, y: 50 }, size: DEFAULT_SIZES['messenger'], content: null, icon: "💬" },
    { id: 'browser', title: 'WebTraveler', isOpen: false, isMinimized: false, zIndex: 5, position: { x: 40, y: 20 }, size: DEFAULT_SIZES['browser'], content: null, icon: "🌐" },
    { id: 'image_viewer', title: 'Visualizador de Imagem', isOpen: false, isMinimized: false, zIndex: 4, position: { x: 150, y: 100 }, size: DEFAULT_SIZES['image_viewer'], content: null, icon: "🖼️" },
    { id: 'logs', title: 'sys_log.dat', isOpen: false, isMinimized: false, zIndex: 3, position: { x: 200, y: 150 }, size: DEFAULT_SIZES['logs'], content: null, icon: "📝" },
    { id: 'phone', title: 'Discador', isOpen: false, isMinimized: false, zIndex: 2, position: { x: 300, y: 100 }, size: DEFAULT_SIZES['phone'], content: null, icon: "☎️" },
    { id: 'email', title: 'Outlook Express', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 60, y: 60 }, size: DEFAULT_SIZES['email'], content: null, icon: "📧" },
    { id: 'notepad', title: 'Notas.txt', isOpen: false, isMinimized: false, zIndex: 6, position: { x: 400, y: 50 }, size: DEFAULT_SIZES['notepad'], content: null, icon: "📄" },
    { id: 'my_computer', title: 'Meu Computador', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 100, y: 120 }, size: DEFAULT_SIZES['my_computer'], content: null, icon: "💻" },
    { id: 'recycle_bin', title: 'Lixeira', isOpen: false, isMinimized: false, zIndex: 1, position: { x: 120, y: 140 }, size: DEFAULT_SIZES['recycle_bin'], content: null, icon: "🗑️" },
  ]);

  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [bootStep, setBootStep] = useState(0);
  const [bootProgress, setBootProgress] = useState(0);
  const [overlay, setOverlay] = useState<'none' | 'transition' | 'mobile' | 'bsod' | 'end'>('none');
  const [transitionTarget, setTransitionTarget] = useState<'mobile' | 'day2' | 'day3' | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [mobileGlitchTriggered, setMobileGlitchTriggered] = useState(false);
  const [triggerJumpscare, setTriggerJumpscare] = useState(false);
  const [mobilePuzzleState, setMobilePuzzleState] = useState<MobilePuzzleState>({ currentWord: 'INACTIVE', typed: '' });
  const [mobileView, setMobileView] = useState<'home' | 'poems' | 'gallery'>('home');

  useEffect(() => {
    // Apply settings
    soundManager.setGlobalVolume(settings.volume);
    document.body.className = `cursor-${settings.cursor}`;
  }, [settings]);

  // Sync icons with Game State
  useEffect(() => {
      setWindows(prev => prev.map(w => ({
          ...w,
          icon: <img src={getDynamicIcon(w.id, gameState.day)} alt="" className="w-full h-full" style={{ imageRendering: 'pixelated' }} />
      })));
  }, [gameState.day]);

  // Enhanced Boot Sequence Logic
  useEffect(() => {
      if (bootStep === 1) {
          const interval = setInterval(() => {
              setBootProgress(prev => {
                  if (prev >= 100) {
                      clearInterval(interval);
                      setTimeout(() => {
                          setBootStep(2);
                          handleWindowAction('messenger', 'open');
                      }, 1000);
                      return 100;
                  }
                  return prev + Math.floor(Math.random() * 15) + 1;
              });
          }, 400);
          return () => clearInterval(interval);
      }
  }, [bootStep]);

  useEffect(() => {
      if (bootStep === 2 && overlay === 'none') {
         const intensity = gameState.day === 1 ? 1 : gameState.day === 2 ? 3 : 5;
         soundManager.setAmbient(intensity); 
      }
  }, [gameState.day, bootStep, overlay]);

  useEffect(() => {
      if (overlay === 'mobile' && !mobileGlitchTriggered) {
          const timer = setTimeout(() => {
              setMobileGlitchTriggered(true);
              soundManager.play('jumpscare');
              soundManager.setVoices(true, -30);
              setTriggerJumpscare(true);
              setTimeout(() => setTriggerJumpscare(false), 200);
              setMobilePuzzleState({ currentWord: 'MEDO', typed: '' });
          }, 12000);
          return () => clearTimeout(timer);
      }
  }, [overlay, mobileGlitchTriggered]);
  
  useEffect(() => {
      let interval: number | undefined;
      if (mobilePuzzleState.currentWord === 'MEDO' || mobilePuzzleState.currentWord === 'AJUDA') {
          interval = window.setInterval(() => {
              soundManager.setVoices(true, -20);
          }, 5000);
      }
      return () => clearInterval(interval);
  }, [mobilePuzzleState.currentWord]);

  const updateGameState = (updates: Partial<GameState>) => setGameState(prev => ({ ...prev, ...updates }));
  const updatePuzzle = (key: keyof PuzzleState, value: boolean) => setGameState(prev => ({ ...prev, puzzles: { ...prev.puzzles, [key]: value } }));

  const handleWindowAction = (id: string, action: 'open' | 'close' | 'minimize' | 'focus' | 'move' | 'toggle' | 'resize', params?: any) => {
    setWindows(prev => {
      const maxZ = Math.max(...prev.map(w => w.zIndex), 0) + 1;
      const targetWindow = prev.find(w => w.id === id);

      if (action === 'toggle') {
          if (!targetWindow) return prev;
          if (targetWindow.isMinimized) {
              setActiveWindowId(id);
              return prev.map(w => w.id === id ? { ...w, isMinimized: false, zIndex: maxZ } : w);
          }
          if (activeWindowId === id) {
              setActiveWindowId(null);
              return prev.map(w => w.id === id ? { ...w, isMinimized: true } : w);
          }
          setActiveWindowId(id);
          return prev.map(w => w.id === id ? { ...w, zIndex: maxZ } : w);
      }

      return prev.map(w => {
        if (w.id === id) {
          switch (action) {
            case 'open': 
                setActiveWindowId(id); 
                // CRITICAL FIX: Reset size and position on open to avoid "lost window" or "tiny window" bugs
                // Calculate center based on virtual resolution
                const virtualW = window.innerWidth / settings.resolution;
                const virtualH = window.innerHeight / settings.resolution;
                const defaultSize = DEFAULT_SIZES[id] || { w: 500, h: 400 };
                
                return { 
                    ...w, 
                    isOpen: true, 
                    isMinimized: false, 
                    zIndex: maxZ,
                    size: defaultSize, // Reset size to safe default
                    position: { 
                        x: Math.max(0, (virtualW - defaultSize.w) / 2) + (Math.random() * 20 - 10), // Center with slight random offset
                        y: Math.max(0, (virtualH - defaultSize.h) / 2) + (Math.random() * 20 - 10)
                    }
                };
            case 'close': if (activeWindowId === id) setActiveWindowId(null); return { ...w, isOpen: false };
            case 'minimize': if (activeWindowId === id) setActiveWindowId(null); return { ...w, isMinimized: true };
            case 'focus': setActiveWindowId(id); return { ...w, zIndex: maxZ };
            case 'move': 
                // Bounds check to keep top bar accessible
                const virtualHeight = window.innerHeight / settings.resolution;
                const virtualWidth = window.innerWidth / settings.resolution;
                const safeY = Math.max(0, Math.min(params.y, virtualHeight - 30));
                const safeX = Math.max(-w.size.w + 50, Math.min(params.x, virtualWidth - 50));
                return { ...w, position: { x: safeX, y: safeY } };
            case 'resize': 
                const newW = Math.max(300, params.w); // Increased min width for usability
                const newH = Math.max(200, params.h); // Increased min height
                return { ...w, size: { w: newW, h: newH } };
            default: return w;
          }
        }
        return w;
      });
    });
  };

  const handleGameAction = (action: string) => {
      switch(action) {
          case 'END_DAY_1':
              soundManager.stopAll();
              setTransitionTarget('mobile');
              setOverlay('transition');
              break;
          case 'BSOD':
              // CRITICAL: Integrity drops to 0 immediately
              setGameState(prev => ({ ...prev, systemIntegrity: 0 }));
              soundManager.play('error');
              soundManager.stopAll();
              setOverlay('bsod');
              break;
          case 'GLITCH_INCREMENT':
              // Decrease system integrity on glitches
              setGameState(prev => ({ 
                  ...prev, 
                  glitchLevel: prev.glitchLevel + 1,
                  systemIntegrity: Math.max(0, prev.systemIntegrity - 10) // Drop integrity by 10%
              }));
              soundManager.setAmbient(gameState.glitchLevel + 1);
              soundManager.play('glitch');
              break;
          case 'TRIGGER_CALL':
              soundManager.stopAll();
              break;
      }
  };
  
  const handleTransitionComplete = () => {
      if (transitionTarget === 'mobile') {
          setOverlay('mobile');
          setMobileGlitchTriggered(false);
          setMobilePuzzleState({ currentWord: 'INACTIVE', typed: '' });
          setMobileView('home');
      } else if (transitionTarget === 'day2') {
          setOverlay('none');
          setGameState(prev => ({ ...prev, day: 2, currentNode: 'd2_start', glitchLevel: 1 }));
          handleWindowAction('messenger', 'open');
          soundManager.play('boot');
      } else if (transitionTarget === 'day3') {
          setOverlay('none');
          setGameState(prev => ({ ...prev, day: 3, currentNode: 'd3_start', glitchLevel: 5 }));
          handleWindowAction('messenger', 'open');
          soundManager.play('boot');
      }
  };
  
  const handlePuzzleComplete = (word: 'MEDO' | 'AJUDA') => {
      if (word === 'MEDO') {
          setMobilePuzzleState({ currentWord: 'AJUDA', typed: '' });
      } else if (word === 'AJUDA') {
          setMobilePuzzleState({ currentWord: 'COMPLETE', typed: '' });
          soundManager.setVoices(false); // Stop the voices
      }
  };

  const advanceToDay3 = () => {
      soundManager.stopAll();
      setTransitionTarget('day3');
      setOverlay('transition');
  };

  const initializeExperience = async () => {
    await soundManager.init();
    soundManager.startMenuMusic();
    setAudioInitialized(true);
  };

  const startBoot = async () => {
      soundManager.stopMenuMusic();
      setBootStep(1);
      soundManager.play('boot');
      setBootProgress(0); // Reset progress
  };

  const getWindowContent = (id: WindowId) => {
      switch(id) {
          case 'messenger': return <Messenger gameState={gameState} onUpdateState={updateGameState} onAction={handleGameAction} />;
          case 'browser': return <Browser gameState={gameState} onUpdatePuzzle={updatePuzzle} />;
          case 'image_viewer': return <ImageViewer gameState={gameState} onUpdatePuzzle={updatePuzzle} />;
          case 'logs': return <Logs gameState={gameState} onUpdatePuzzle={updatePuzzle} />;
          case 'phone': return <Phone gameState={gameState} onAction={handleGameAction} />;
          case 'notepad': return <Notepad gameState={gameState} />;
          case 'email': return (
             <div className="bg-white h-full p-4 font-ui text-black overflow-y-auto">
                 <div className="border-b pb-2 mb-4">
                    <h2 className="font-bold text-lg">Re: Formulários da Colônia</h2>
                    <p className="text-sm text-gray-600">De: elara.vance@solaranet.com | 15/10/2015</p>
                 </div>
                 <p className="mb-4">Querido(a),</p>
                 <p className="mb-4">Só confirmando que recebemos sua autorização para a viagem da Sarah. Sabemos que é difícil se despedir, mas será uma oportunidade incrível para ela no <b>Programa Pioneiro em Marte</b>.</p>
                 <p>Ela vai sentir sua falta. Cuide-se bem.</p>
                 <p className="italic mt-8">Elara (Mãe da Sarah)</p>
             </div>
          );
          case 'my_computer': return <PlaceholderApp text="Conteúdo do sistema não disponível." />;
          case 'recycle_bin': return <PlaceholderApp text="A lixeira está vazia." />;
          default: return <PlaceholderApp text="Aplicação corrompida ou não implementada." />;
      }
  };

  // Generate desktop icons dynamically
  const desktopIcons = [
      { id: 'my_computer' as WindowId, label: 'Meu Computador', icon: getDynamicIcon('my_computer', gameState.day), hidden: false },
      { id: 'recycle_bin' as WindowId, label: 'Lixeira', icon: getDynamicIcon('recycle_bin', gameState.day), hidden: false },
      { id: 'messenger' as WindowId, label: 'Messenger', icon: getDynamicIcon('messenger', gameState.day), hidden: false },
      { id: 'browser' as WindowId, label: 'Internet', icon: getDynamicIcon('browser', gameState.day), hidden: gameState.day === 3 },
      { id: 'image_viewer' as WindowId, label: 'lembranca.img', icon: getDynamicIcon('image_viewer', gameState.day), hidden: gameState.day === 3 },
      { id: 'logs' as WindowId, label: 'sys_log.dat', icon: getDynamicIcon('logs', gameState.day), hidden: gameState.day === 3 },
      { id: 'email' as WindowId, label: 'Outlook', icon: getDynamicIcon('email', gameState.day), hidden: gameState.day === 3 },
      { id: 'notepad' as WindowId, label: 'Notas.txt', icon: getDynamicIcon('notepad', gameState.day), hidden: false },
      { id: 'phone' as WindowId, label: 'Discador', icon: getDynamicIcon('phone', gameState.day), hidden: false }, 
  ];

  if (!audioInitialized) {
    return (
        <div className="w-screen h-screen bg-black flex items-center justify-center font-['Press_Start_2P']">
            <button 
                onClick={initializeExperience}
                className="text-2xl text-white border-2 border-white p-6 hover:bg-white hover:text-black transition-colors animate-pulse"
            >
                ENTRAR
            </button>
        </div>
    );
  }

  const scaledStyle = {
    transform: `scale(${settings.resolution})`,
    transformOrigin: 'top left',
    width: `${100 / settings.resolution}vw`,
    height: `${100 / settings.resolution}vh`,
  };

  return (
    <div className={`w-screen h-screen bg-black font-['VT323'] text-white overflow-hidden relative select-none graphics-${settings.graphics} ${gameState.day === 3 ? 'animate-shake-hard' : ''}`}>
      <div className="scanline"></div>
      <div className={`crt-overlay ${gameState.day === 3 ? 'bg-red-900/10 mix-blend-overlay' : ''}`}></div>
      <GlitchLayer level={gameState.glitchLevel} triggerJumpscare={triggerJumpscare} />

      {showSettings && <SettingsModal currentSettings={settings} onSave={(s) => { setSettings(s); setShowSettings(false); }} onCancel={() => setShowSettings(false)} />}

      {bootStep === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-[999] bg-black">
            <h1 className="text-6xl md:text-8xl font-['Press_Start_2P'] text-green-500 mb-12 text-center leading-normal animate-pulse text-shadow-lg shadow-green-900">
                SINAL<br/>PERDIDO
            </h1>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={startBoot} className="px-8 py-4 border-4 border-green-800 text-green-500 hover:bg-green-900/50 hover:border-green-500 font-bold text-2xl font-term transition-all tracking-widest">
                  INICIAR_SISTEMA
              </button>
              <button onClick={() => { soundManager.play('click'); setShowSettings(true); }} className="px-8 py-4 border-4 border-gray-600 text-gray-400 hover:bg-gray-800/50 hover:border-gray-400 font-bold text-2xl font-term transition-all tracking-widest">
                  CONFIGURAÇÕES
              </button>
            </div>
        </div>
      )}

      {bootStep === 1 && (
          <div className="absolute inset-0 bg-black p-8 font-term text-xl text-gray-400 z-[9998] leading-relaxed flex flex-col">
              <p>BIOS DATE 10/22/15 14:22:55 VER 1.0.2</p>
              <p>CPU: QUANTUM RYZEN, SPEED: 4000 MHz</p>
              <p className="mt-2">Checking Memory... <span className="text-white">65536K OK</span></p>
              <p>Detecting Primary Master ... V-DRIVE 40GB</p>
              <p>Detecting Sound Card ... CREATIVE SB16</p>
              
              <div className="mt-8 border border-gray-600 p-4 max-w-lg">
                  <p className="mb-2 text-white">SYSTEM BOOT PROGRESS:</p>
                  <div className="w-full h-6 bg-gray-900 border border-gray-500 relative">
                      <div className="h-full bg-green-700 transition-all duration-300" style={{ width: `${Math.min(100, bootProgress)}%` }}></div>
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-white mix-blend-difference font-bold">
                          {Math.min(100, bootProgress)}%
                      </div>
                  </div>
                  <div className="mt-2 text-sm h-6">
                      {bootProgress < 20 && "Initializing kernel..."}
                      {bootProgress >= 20 && bootProgress < 50 && "Loading drivers..."}
                      {bootProgress >= 50 && bootProgress < 80 && "Mounting file system..."}
                      {bootProgress >= 80 && "Starting user interface..."}
                  </div>
              </div>

              <p className="mt-4 text-green-500 animate-pulse">_</p>
          </div>
      )}

      {bootStep === 2 && (
        <div style={scaledStyle} className="absolute top-0 left-0">
          <div className={`absolute inset-0 overflow-hidden transition-all duration-1000 ease-in-out ${gameState.day === 3 ? 'contrast-150 hue-rotate-[-30deg] bg-[#2a0000]' : 'bg-[#008080]'}`} style={{ backgroundImage: gameState.day === 3 ? 'url(https://i.imgur.com/OfDAh3v.png)' : 'none', backgroundSize: 'cover' }}>
              <Desktop icons={desktopIcons} onOpen={(id) => handleWindowAction(id, 'open')} />
              {windows.map(win => (
                <WindowFrame 
                    key={win.id} 
                    windowState={{...win, content: getWindowContent(win.id as WindowId)}} 
                    isActive={activeWindowId === win.id} 
                    onClose={(id) => handleWindowAction(id, 'close')} 
                    onMinimize={(id) => handleWindowAction(id, 'minimize')} 
                    onFocus={(id) => handleWindowAction(id, 'focus')} 
                    onMove={(id, x, y) => handleWindowAction(id, 'move', { x, y })}
                    onResize={(id, w, h) => handleWindowAction(id, 'resize', { w, h })}
                    scale={settings.resolution}
                />
              ))}
          </div>
          <Taskbar 
            windows={windows} 
            activeWindowId={activeWindowId} 
            onToggleWindow={(id) => handleWindowAction(id, 'toggle')} 
            onStartClick={() => soundManager.play('error')} 
            systemIntegrity={gameState.systemIntegrity}
          />
        </div>
      )}

      {overlay === 'transition' && (<TransitionScreen day={gameState.day} onComplete={handleTransitionComplete} textOverride={transitionTarget === 'mobile' ? "CONEXÃO INTERROMPIDA... TENTANDO REDE MÓVEL." : undefined}/>)}
      
      {/* FULL-SCREEN PUZZLE */}
      {(mobilePuzzleState.currentWord === 'MEDO' || mobilePuzzleState.currentWord === 'AJUDA') && 
        <MobilePuzzle 
            word={mobilePuzzleState.currentWord} 
            onComplete={() => handlePuzzleComplete(mobilePuzzleState.currentWord as 'MEDO'|'AJUDA')} 
        />
      }

      {overlay === 'mobile' && (
          <div className="absolute inset-0 mobile-backdrop z-[10000] flex items-center justify-center font-ui select-none p-4">
              <div className={`bg-gray-900 border-4 border-gray-700 rounded-3xl max-w-[400px] w-full h-[800px] shadow-2xl relative overflow-hidden flex flex-col transition-all ${mobileGlitchTriggered ? 'animate-shake-hard' : ''}`}>
                 
                 {mobileGlitchTriggered ? (
                    <div className="absolute inset-0 bg-black/80 z-40 flex flex-col items-center justify-center p-4">
                        <h1 className="fullscreen-jumpscare-text animate-rgb">SARAH<br/>PRECISA<br/>DE<br/>AJUDA</h1>
                        {mobilePuzzleState.currentWord === 'COMPLETE' && (
                            <button className="mt-12 bg-white text-black px-6 py-3 font-bold rounded-full shadow-lg hover:bg-gray-200 animate-pulse" onClick={() => { soundManager.play('click'); setTransitionTarget('day2'); setOverlay('transition'); }}>
                                Reiniciar Roteador
                            </button>
                        )}
                    </div>
                 ) : (
                    <>
                    {/* Phone UI */}
                    <div className="bg-black text-white p-2 text-sm flex justify-between items-center">
                        <span>15:32</span>
                        <span>📶 🔋</span>
                    </div>
                    <div className="flex-1 bg-[#333] p-4 mobile-content overflow-y-auto">
                        {mobileView === 'home' && <h2 className="text-white text-xl font-bold">Tela de Início</h2>}
                        {mobileView === 'poems' && (
                            <div>
                                <h2 className="text-green-400 font-bold text-lg mb-2">Poemas da Sarah</h2>
                                <div className="space-y-3 text-gray-300">
                                    <p className="bg-black/30 p-2 rounded italic">"Estrelas vermelhas no céu distante,<br/>Nossa promessa, brilhante instante..."</p>
                                    <p className="bg-black/30 p-2 rounded italic">"O ar pesado em 'Marte' desce,<br/>Sua voz some, a escuridão cresce..."</p>
                                </div>
                            </div>
                        )}
                        {mobileView === 'gallery' && (
                            <div>
                                <h2 className="text-blue-400 font-bold text-lg mb-2">Galeria</h2>
                                <div className="space-y-3 text-gray-300">
                                    <p className="bg-black/30 p-2 rounded">Foto na formatura dela... tão orgulhosa.</p>
                                    <p className="bg-black/30 p-2 rounded">Foto nossa rindo na chuva... aquele dia foi perfeito.</p>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* App Dock */}
                    <div className="bg-black/50 backdrop-blur-sm p-2 flex justify-around">
                        <button className="mobile-app-icon text-center text-white" onClick={() => setMobileView('poems')}>
                            <span className="text-3xl">📝</span><span className="text-xs">Poemas</span>
                        </button>
                        <button className="mobile-app-icon text-center text-white" onClick={() => setMobileView('gallery')}>
                            <span className="text-3xl">🖼️</span><span className="text-xs">Galeria</span>
                        </button>
                    </div>
                    </>
                 )}
              </div>
          </div>
      )}
      
      {overlay === 'bsod' && (
          <div className="absolute inset-0 bg-[#0000AA] text-white font-term p-8 z-[10000] text-xl cursor-pointer" onClick={advanceToDay3}>
              <p className="bg-[#AAAAAA] text-[#0000AA] inline-block mb-4 px-1 font-bold">Windows</p>
              <p className="mb-4">A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) + 00010E36.</p>
              <p className="mb-8">The current application will be terminated.</p>
              <ul className="list-disc pl-8 mb-8 space-y-2">
                  <li>Press any key to terminate the current application.</li>
                  <li>Press CTRL+ALT+DEL again to restart your computer. You will lose any unsaved information in all applications.</li>
              </ul>
              <p className="text-center animate-pulse mt-20">Press any key to continue _</p>
          </div>
      )}
    </div>
  );
}