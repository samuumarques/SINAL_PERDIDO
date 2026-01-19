import React from 'react';
import { GameState } from '../types';

interface NotepadProps {
  gameState: GameState;
}

const Notepad: React.FC<NotepadProps> = ({ gameState }) => {
  const getContent = () => {
      switch(gameState.day) {
          case 1:
              return `LISTA DE TAREFAS:\n\n- Comprar ração pro cachorro\n- Ligar para a companhia de internet (sinal horrível)\n- Não esquecer do aniversário dela (22/10)\n- Arrumar a porta do porão (está emperrando)`;
          case 2:
              return `LISTA DE TAREFAS:\n\n- Comprar ração\n- Ligar para ???\n- 22/10/2015\n- A porta do porão não abre por dentro.\n- A porta do porão não abre por dentro.\n- A porta do porão não abre por dentro.`;
          case 3:
              return `ELA ESTÁ LÁ EMBAIXO.\nELA ESTÁ LÁ EMBAIXO.\nELA ESTÁ LÁ EMBAIXO.\nELA ESTÁ LÁ EMBAIXO.\nELA ESTÁ LÁ EMBAIXO.\n\nEU NÃO CONSIGO OUVIR A MÚSICA MAIS.`;
          default:
              return "";
      }
  };

  return (
    <div className="flex flex-col h-full bg-white text-black font-['Courier_New']">
        {/* Toolbar */}
        <div className="flex gap-2 p-1 border-b border-gray-300 bg-gray-100 text-sm">
            <span>Arquivo</span>
            <span>Editar</span>
            <span>Formatar</span>
            <span>Ajuda</span>
        </div>
        <textarea 
            className="flex-1 p-4 resize-none outline-none w-full h-full font-['Courier_Prime'] text-base leading-relaxed"
            value={getContent()}
            readOnly
        />
    </div>
  );
};

export default Notepad;