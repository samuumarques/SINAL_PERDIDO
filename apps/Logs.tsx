import React, { useState, useEffect } from 'react';
import { soundManager } from '../audio';
import { GameState, PuzzleState } from '../types';
import { PASSWORDS } from '../constants';

interface LogsProps {
  gameState: GameState;
  onUpdatePuzzle: (key: keyof PuzzleState, value: boolean) => void;
}

const SEQUENCE = ["C4", "E4", "G4", "A4"]; // The correct order matching the labels 1, 2, 3, 4

const Logs: React.FC<LogsProps> = ({ gameState, onUpdatePuzzle }) => {
  // Derive initial view from props to ensure persistence
  const getInitialView = () => {
      if (gameState.puzzles.logsDecrypted) return 'text_logs';
      if (gameState.puzzles.audioSequenceSolved) return 'password_input';
      return 'sequencer';
  };

  const [view, setView] = useState<'sequencer' | 'password_input' | 'text_logs'>(getInitialView());
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);

  // Sync local view state when global state changes (e.g., re-opening window)
  useEffect(() => {
      setView(getInitialView());
  }, [gameState.puzzles.logsDecrypted, gameState.puzzles.audioSequenceSolved]);

  const handlePassword = () => {
      if (password.trim() === PASSWORDS.LOGS) {
          soundManager.play('unlock');
          onUpdatePuzzle('logsDecrypted', true);
          // View update handled by useEffect
      } else {
          soundManager.play('error');
          setError('Chave inválida.');
      }
  };

  const handleNoteClick = (note: string) => {
      soundManager.playTone(note, "8n");
      const newSeq = [...userSequence, note];
      setUserSequence(newSeq);

      // Check sequence
      if (newSeq.length === SEQUENCE.length) {
          if (JSON.stringify(newSeq) === JSON.stringify(SEQUENCE)) {
              soundManager.play('unlock');
              onUpdatePuzzle('audioSequenceSolved', true);
              // View update handled by useEffect
          } else {
              soundManager.play('error');
              setError('Sequência incorreta.');
              setTimeout(() => {
                  setUserSequence([]);
                  setError('');
              }, 1000);
          }
      }
  };

  const playDemo = async () => {
      if (isPlayingDemo) return;
      setIsPlayingDemo(true);
      for (let i = 0; i < SEQUENCE.length; i++) {
          soundManager.playTone(SEQUENCE[i], "8n");
          // Highlight logic could go here
          await new Promise(r => setTimeout(r, 500));
      }
      setIsPlayingDemo(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#000] text-[#39ff14] font-term p-4 font-bold tracking-wide">
        <div className="border-b-2 border-[#39ff14] mb-4 pb-2 flex justify-between">
            <span>SYS_LOG.DAT</span>
            <span>STATUS: {view === 'text_logs' ? 'DECRYPTED' : 'ENCRYPTED'}</span>
        </div>

        {/* STEP 1: Audio Puzzle */}
        {view === 'sequencer' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
                <h2 className="text-xl mb-6">FRAGMENTO DE ÁUDIO RECUPERADO</h2>
                <p className="mb-4 text-sm text-green-700">Senha Auditiva Necessária</p>
                
                <div className="grid grid-cols-4 gap-4 mb-8">
                    {SEQUENCE.map((note, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleNoteClick(note)}
                            className={`w-16 h-16 border-2 border-[#39ff14] flex items-center justify-center text-2xl hover:bg-[#39ff14] hover:text-black transition-all active:scale-95
                                ${userSequence.length > idx ? 'bg-[#39ff14] text-black' : ''}
                            `}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>

                <div className="flex gap-4">
                    <button onClick={playDemo} disabled={isPlayingDemo} className="px-4 py-2 border border-green-800 text-green-800 hover:border-[#39ff14] hover:text-[#39ff14]">
                        {isPlayingDemo ? 'REPRODUZINDO...' : 'OUVIR AMOSTRA'}
                    </button>
                </div>
                {error && <p className="mt-4 text-red-500 bg-red-900/50 px-2">{error}</p>}
            </div>
        )}

        {/* STEP 2: Text Password (Unlocked by solving audio or knowing date) */}
        {view === 'password_input' && (
            <div className="flex-1 flex flex-col items-center justify-center">
                <h2 className="text-2xl mb-4 blink">ACESSO CONCEDIDO AO TERMINAL</h2>
                <p className="mb-2">Insira a data do evento (DDMMAAAA):</p>
                <input 
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="2210..."
                    className="bg-green-900/20 border border-[#39ff14] text-[#39ff14] p-2 text-center text-xl w-48 focus:outline-none mb-4"
                />
                <button onClick={handlePassword} className="px-6 py-2 bg-[#39ff14] text-black font-bold hover:bg-white">
                    ACESSAR
                </button>
                {error && <p className="mt-4 text-red-500">{error}</p>}
            </div>
        )}

        {/* STEP 3: The Content */}
        {view === 'text_logs' && (
            <div className="flex-1 overflow-y-auto space-y-6 text-sm border border-green-900 p-4 bg-green-900/5">
                <div className="opacity-70 border-b border-green-900 pb-2">
                    <p>[22/10/2015 21:54:12] GRAVAÇÃO INICIADA</p>
                    <p>LOCAL: PORÃO RESIDENCIAL</p>
                </div>
                
                <div className="space-y-2">
                    <p><span className="text-white">> SARAH:</span> ...você não pode simplesmente decidir isso por mim!</p>
                    <p><span className="text-blue-400">> USER:</span> É para o seu bem. Eu já decidi.</p>
                </div>

                <div className="space-y-2 border-l-2 border-red-900 pl-2">
                    <p className="text-gray-500 italic">[22/10/2015 21:58:04] RUÍDO DE LUTA DETECTADO</p>
                    <p><span className="text-white">> SARAH:</span> Me deixa sair! Por favor! Está escuro aqui...</p>
                    <p><span className="text-blue-400">> USER:</span> Eu disse para você ficar quieta!</p>
                </div>

                <div className="space-y-2 mt-4">
                    <p className="text-red-500 font-bold blink">[22/10/2015 21:59:11] SINAL PERDIDO...</p>
                    <p className="opacity-50">...som de objeto caindo... silêncio...</p>
                </div>
                
                <div className="mt-8 border-t border-green-900 pt-4">
                    <p className="text-blue-400">> USER (VOZ ABAFADA):</p>
                    <p>Ela foi embora. Foi... para um lugar melhor. Longe. Como... Marte.</p>
                </div>
            </div>
        )}
    </div>
  );
};

export default Logs;