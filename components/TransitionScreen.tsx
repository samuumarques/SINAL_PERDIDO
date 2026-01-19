
import React, { useEffect, useState } from 'react';
import { Day } from '../types';
import { soundManager } from '../audio';

interface TransitionScreenProps {
  day: Day;
  onComplete: () => void;
  textOverride?: string; // For custom endings or intros
}

const TEXTS = {
    1: [
        "SINAL PERDIDO.",
        "A mente preenche as lacunas com o que deseja ver.",
        "Mas a estática está ficando mais alta.",
        "...",
        "Reiniciando sistema para o Dia 2."
    ],
    2: [
        "FALHA CRÍTICA NO SISTEMA.",
        "As memórias estão corrompidas.",
        "O porão nunca teve sinal.",
        "Ela nunca foi para Marte.",
        "...",
        "Acordando para o Dia 3."
    ],
    3: [] // Day 3 usually handles its own end
};

const TransitionScreen: React.FC<TransitionScreenProps> = ({ day, onComplete, textOverride }) => {
    const [displayedText, setDisplayedText] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showButton, setShowButton] = useState(false);
    
    // Loading State
    const [isRebooting, setIsRebooting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState("INITIALIZING KERNEL...");

    // Select text source
    const lines = textOverride ? [textOverride] : TEXTS[day as 1|2] || ["Carregando..."];

    // Text typing effect
    useEffect(() => {
        if (isRebooting) return; // Stop typing if reboot started

        if (currentIndex < lines.length) {
            const timer = setTimeout(() => {
                setDisplayedText(prev => [...prev, lines[currentIndex]]);
                setCurrentIndex(prev => prev + 1);
            }, 1500); // Delay between lines
            return () => clearTimeout(timer);
        } else {
            // All lines shown
            const timer = setTimeout(() => {
                setShowButton(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, lines, isRebooting]);

    // Loading Bar Logic
    useEffect(() => {
        if (isRebooting) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    const next = prev + Math.floor(Math.random() * 5) + 2;
                    
                    // Dynamic text updates based on progress
                    if (next > 20 && next < 40) setLoadingText("LOADING MEMORY MODULES...");
                    if (next > 40 && next < 60) setLoadingText("MOUNTING VIRTUAL DRIVE...");
                    if (next > 60 && next < 80) setLoadingText("RESTORING USER SESSION...");
                    if (next > 80) setLoadingText("STARTING DESKTOP ENVIRONMENT...");

                    if (next >= 100) {
                        clearInterval(interval);
                        setTimeout(onComplete, 500); // Small delay at 100%
                        return 100;
                    }
                    return next;
                });
            }, 100);
            return () => clearInterval(interval);
        }
    }, [isRebooting, onComplete]);

    const handleContinue = () => {
        soundManager.play('click');
        soundManager.play('boot'); // Play boot sound for effect
        setIsRebooting(true);
    };

    if (isRebooting) {
        return (
            <div className="absolute inset-0 bg-black z-[10000] flex flex-col items-center justify-center font-term text-green-500 p-8 cursor-wait">
                <div className="w-full max-w-md space-y-4">
                    <h1 className="text-2xl mb-8 animate-pulse">SYSTEM REBOOT_Sequence</h1>
                    
                    <div className="flex justify-between text-sm uppercase mb-1">
                        <span>{loadingText}</span>
                        <span>{progress}%</span>
                    </div>
                    
                    <div className="w-full h-8 border-2 border-green-700 p-1">
                        <div 
                            className="h-full bg-green-500 transition-all duration-75" 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    
                    <div className="text-xs text-green-800 mt-2 font-mono h-20 overflow-hidden">
                        {progress > 10 && <p>OK: RAM verified at 0x000000</p>}
                        {progress > 30 && <p>OK: Video Adapter initialized</p>}
                        {progress > 50 && <p>OK: Sound Blaster 16 found at Port 220</p>}
                        {progress > 70 && <p>OK: Loading COMMAND.COM</p>}
                        {progress > 90 && <p>OK: User Profile Loaded</p>}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 bg-black z-[10000] flex flex-col items-center justify-center font-doc text-white p-8">
            <div className="max-w-2xl w-full space-y-6">
                {displayedText.map((line, idx) => (
                    <p key={idx} className="text-xl md:text-2xl animate-fade-in typing-cursor">
                        {line}
                    </p>
                ))}
            </div>
            
            {showButton && (
                <button 
                    onClick={handleContinue}
                    className="mt-12 px-6 py-2 border border-white text-white hover:bg-white hover:text-black transition-colors font-bold animate-pulse"
                >
                    CONTINUAR_
                </button>
            )}
        </div>
    );
};

export default TransitionScreen;
