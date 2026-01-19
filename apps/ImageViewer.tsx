import React, { useState } from 'react';
import { soundManager } from '../audio';
import { GameState, PuzzleState } from '../types';
import { PASSWORDS } from '../constants';

interface ImageViewerProps {
  gameState: GameState;
  onUpdatePuzzle: (key: keyof PuzzleState, value: boolean) => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ gameState, onUpdatePuzzle }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleDecrypt = () => {
    if (password.toLowerCase().trim() === PASSWORDS.IMAGE) {
        soundManager.play('unlock');
        onUpdatePuzzle('imageDecrypted', true);
    } else {
        soundManager.play('error');
        setError('ACESSO NEGADO: Senha incorreta.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#202020] text-green-500 font-term p-2">
        {!gameState.puzzles.imageDecrypted ? (
            <div className="flex flex-col items-center justify-center h-full border-2 border-red-900 bg-black animate-pulse">
                <h2 className="text-3xl text-red-600 mb-4 font-bold">ARQUIVO CORROMPIDO</h2>
                <p className="mb-4 text-gray-400">Criptografia de nível 5 detectada.</p>
                <div className="w-64">
                    <label className="block text-xs mb-1">SENHA DE RECUPERAÇÃO:</label>
                    <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#111] border border-green-700 text-green-500 p-2 focus:outline-none focus:border-green-400 text-center text-xl"
                        autoFocus
                    />
                </div>
                <button 
                    onClick={handleDecrypt}
                    className="mt-4 border border-green-600 px-6 py-2 hover:bg-green-900/30 active:bg-green-900"
                >
                    DESCRIPTOGRAFAR
                </button>
                {error && <p className="mt-4 text-red-500 bg-red-900/20 px-2">{error}</p>}
            </div>
        ) : (
            <div className="flex flex-col h-full">
                <div className="bg-gray-800 p-1 flex justify-between text-xs text-white mb-1">
                    <span>lembranca.img (100%)</span>
                    <span>800x600</span>
                </div>
                <div className="flex-1 relative border border-gray-600 bg-black flex items-center justify-center overflow-hidden">
                    <img 
                        src="https://i.imgur.com/gBwJqf2.png" 
                        alt="Recovered Memory" 
                        className="max-w-full max-h-full object-contain"
                    />
                    {/* Glitch overlay */}
                    <div className="absolute inset-0 bg-red-500/10 mix-blend-overlay pointer-events-none animate-pulse" />
                </div>
                <p className="text-center text-gray-400 text-sm mt-2 italic">
                    "O dia do parque... Nós prometemos ir para Marte juntos."
                </p>
            </div>
        )}
    </div>
  );
};

export default ImageViewer;