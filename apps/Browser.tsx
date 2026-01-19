import React, { useState } from 'react';
import { soundManager } from '../audio';
import { GameState, PuzzleState } from '../types';
import { PASSWORDS } from '../constants';

interface BrowserProps {
  gameState: GameState;
  onUpdatePuzzle: (key: keyof PuzzleState, value: boolean) => void;
}

const Browser: React.FC<BrowserProps> = ({ gameState, onUpdatePuzzle }) => {
  const [url, setUrl] = useState('about:blank');
  const [currentView, setCurrentView] = useState<'home' | 'article_solarnet' | 'article_missing'>('home');
  const [searchInput, setSearchInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const term = searchInput.toLowerCase().trim();
    
    soundManager.play('click');

    if (term.includes('marte') || term.includes('solarnet') || term.includes('colonia')) {
        setCurrentView('article_solarnet');
        setUrl('www.solarnet.com/news/mars-colony-10-years');
        onUpdatePuzzle('articleFound', true);
    } else if (term === 'desaparecida' || term === 'sarah' || term === 'sarah vance') {
        setCurrentView('article_missing');
        setUrl('www.localnews.com/archive/2015/missing-girl');
        onUpdatePuzzle('desaparecidaFound', true);
    } else {
        soundManager.play('error');
        setError('404 - Nenhum resultado encontrado.');
    }
  };

  const handleUnlockComments = () => {
      if (passwordInput.toLowerCase().trim() === PASSWORDS.COMMENTS) {
          soundManager.play('unlock');
          onUpdatePuzzle('commentsUnlocked', true);
      } else {
          soundManager.play('error');
          setError('Senha incorreta.');
      }
  };

  return (
    <div className="flex flex-col h-full bg-[#d4d0c8] font-ui text-black">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-1 border-b border-white shadow-sm">
        <button className="w-6 h-6 win-outset active:win-inset bg-[#c0c0c0] text-gray-600 font-bold">←</button>
        <button className="w-6 h-6 win-outset active:win-inset bg-[#c0c0c0] text-gray-600 font-bold">→</button>
        <div className="flex-1 bg-white border border-gray-500 px-2 py-0.5 text-sm font-ui">{url}</div>
        <button className="px-3 py-0.5 win-outset active:win-inset bg-[#c0c0c0] text-sm" onClick={() => setCurrentView('home')}>Home</button>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white overflow-y-auto p-8 win-inset m-1">
        {currentView === 'home' && (
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-6xl font-['Times_New_Roman'] text-blue-800 mb-2">WebTraveler</h1>
                <p className="text-gray-500 mb-8">Explore o mundo... e além.</p>
                
                <form onSubmit={handleSearch} className="w-full max-w-md flex gap-2">
                    <input 
                        type="text" 
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Pesquisar na web..."
                        className="flex-1 border-2 border-blue-800 p-2 font-ui text-lg shadow-inner"
                    />
                    <button type="submit" className="bg-blue-800 text-white px-6 py-2 font-bold hover:bg-blue-700 win-outset active:win-inset">
                        BUSCAR
                    </button>
                </form>
                {error && <p className="text-red-600 mt-4 font-bold bg-red-100 px-4 py-1 border border-red-400">{error}</p>}
            </div>
        )}

        {currentView === 'article_solarnet' && (
            <div className="max-w-3xl mx-auto font-['Georgia']">
                <h2 className="text-3xl font-bold text-blue-900 mb-2 border-b-2 border-blue-900 pb-2">
                    Dez Anos da Colônia em Marte: Pioneiros Enfrentam Desafios
                </h2>
                <div className="text-sm text-gray-600 mb-6 flex justify-between">
                    <span><b>Portal:</b> Futuro Hoje (Divisão ASTROCOM)</span>
                    <span><b>Data:</b> 14 de Outubro de 2025</span>
                </div>
                
                <div className="space-y-4 text-lg leading-relaxed text-gray-800">
                    <p>A colônia marciana, estabelecida há uma década, celebra seu aniversário em meio a crescentes preocupações sobre a estabilidade dos seus sistemas de comunicação.</p>
                    <p>A <b>SolarNet</b>, conglomerado responsável pela infraestrutura, insiste que os atrasos estão "dentro dos parâmetros esperados", apesar dos relatos de "ecos fantasmas" nas transmissões.</p>
                </div>

                <div className="mt-12 bg-gray-100 p-4 border border-gray-300">
                    <h3 className="font-bold text-lg mb-2">Comentários (1)</h3>
                    
                    {gameState.puzzles.commentsUnlocked ? (
                        <div className="bg-white p-3 border border-gray-200 shadow-sm animate-pulse">
                            <p className="text-sm font-bold text-blue-800 mb-1">Usuário: ExTecnico7</p>
                            <p className="text-gray-800 italic">
                                "Não acreditem em tudo. Eu trabalhei na SolarNet... Eles estão escondendo a verdade sobre a falha do sistema. Isso me lembra de uma promessa que fiz à minha filha, <b>Elara</b>. Nunca esquecer."
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 bg-gray-200 p-4 border border-gray-400">
                            <p className="text-red-600 font-bold flex items-center gap-2">
                                🔒 Conteúdo Restrito (Acesso Técnico)
                            </p>
                            <div className="flex gap-2">
                                <input 
                                    type="password" 
                                    placeholder="Senha de Acesso"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    className="flex-1 border p-1"
                                />
                                <button onClick={handleUnlockComments} className="win-outset px-3 bg-gray-300 active:win-inset">
                                    Acessar
                                </button>
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                        </div>
                    )}
                </div>
            </div>
        )}

        {currentView === 'article_missing' && (
            <div className="max-w-2xl mx-auto font-['Times_New_Roman'] bg-[#fffaf0] p-8 border border-gray-300 shadow-lg">
                <h2 className="text-4xl font-bold text-black mb-4 text-center uppercase">
                    Polícia Encerra Buscas
                </h2>
                <div className="border-t border-b border-black py-2 mb-6 text-center font-bold text-sm">
                    NOTÍCIAS LOCAIS | 28 DE OUTUBRO DE 2015
                </div>
                <p className="text-justify text-lg leading-relaxed font-serif">
                    As autoridades suspenderam as buscas por S.V., a adolescente que desapareceu na última semana na região do Vale do Rio <b>Pardo</b>. O caso permanece sem solução. 
                </p>
                <p className="text-justify text-lg leading-relaxed font-serif mt-4">
                    A jovem foi vista pela última vez perto de uma propriedade abandonada. Moradores relatam ter ouvido uma discussão no local na noite do desaparecimento, mas nenhuma evidência conclusiva foi encontrada.
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Browser;