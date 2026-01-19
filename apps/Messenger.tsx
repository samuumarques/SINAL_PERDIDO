
import React, { useEffect, useRef, useState } from 'react';
import { GameState, DialogueNode } from '../types';
import { DIALOGUE_TREE } from '../constants';
import { soundManager } from '../audio';

interface MessengerProps {
  gameState: GameState;
  onUpdateState: (updates: Partial<GameState>) => void;
  onAction: (action: string) => void;
}

const Messenger: React.FC<MessengerProps> = ({ gameState, onUpdateState, onAction }) => {
  const [messages, setMessages] = useState<{ sender: 'npc' | 'player' | 'system'; text: string }[]>([]);
  const [currentChoices, setCurrentChoices] = useState<DialogueNode['choices']>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingContent, setTypingContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, typingContent]);

  // Initialize day dialogue
  useEffect(() => {
    if (gameState.currentNode && messages.length === 0) {
       processNode(gameState.currentNode);
    }
  }, []);

  // Watch for puzzle updates to refresh current choices state (unlocking options)
  useEffect(() => {
      if (gameState.currentNode && DIALOGUE_TREE[gameState.currentNode]) {
          const node = DIALOGUE_TREE[gameState.currentNode];
          // Only update if we are sitting at a choice menu, not actively typing
          if (!isTyping) {
              setCurrentChoices(node.choices || []);
          }
      }
  }, [gameState.puzzles]);

  // Advanced natural typing algorithm
  const typeMessage = (text: string, sender: 'npc' | 'system'): Promise<void> => {
    return new Promise((resolve) => {
        setIsTyping(true);
        setTypingContent("");
        
        let index = 0;
        const chars = text.split("");
        
        const typeChar = () => {
            if (index >= chars.length) {
                // Finished typing
                setMessages(prev => [...prev, { sender, text }]);
                setTypingContent("");
                setIsTyping(false);
                soundManager.play('notify');
                resolve();
                return;
            }

            const char = chars[index];
            setTypingContent(prev => prev + char);
            
            // Play sound less frequently for realism, or quieter
            if (Math.random() > 0.5) soundManager.play('type');
            
            index++;

            // Variable speed logic
            let delay = 30 + Math.random() * 40; // Base speed: 30-70ms
            
            // Pauses for punctuation
            if (char === '.' || char === '!' || char === '?') delay += 400;
            if (char === ',') delay += 200;
            
            setTimeout(typeChar, delay);
        };

        // Initial start delay
        setTimeout(typeChar, 600);
    });
  };

  const processNode = async (nodeId: string) => {
    const node = DIALOGUE_TREE[nodeId];
    if (!node) return;

    onUpdateState({ currentNode: nodeId });
    setCurrentChoices([]); // Hide choices while typing

    if (node.npc) {
      await typeMessage(node.npc, 'npc');
    } else if (node.npcSequence) {
        for (const seq of node.npcSequence) {
            if (seq.text) await typeMessage(seq.text, 'npc');
            if (seq.action === 'glitch_text') {
                 soundManager.play('glitch');
                 setMessages(prev => [...prev, { sender: 'system', text: `ERRO CRÍTICO: ${seq.code}` }]);
                 // Apply delay defined in sequence
                 if (seq.delay) await new Promise(r => setTimeout(r, seq.delay));
            }
        }
    }

    setCurrentChoices(node.choices);
    
    // Auto-actions at end of node
    if (node.choices.length === 0) {
         if (nodeId === 'd1_ending') onAction('END_DAY_1');
         if (nodeId === 'd2_accident' || nodeId === 'd2_denial') onAction('BSOD');
         if (nodeId === 'd3_revelation') onAction('TRIGGER_CALL');
    }
  };

  const handleChoice = (choice: DialogueNode['choices'][0]) => {
    soundManager.play('click');
    setMessages(prev => [...prev, { sender: 'player', text: choice.text }]);
    
    if (choice.isWrong) {
        soundManager.play('error');
        onAction('GLITCH_INCREMENT');
    }
    
    if (choice.action) {
        onAction(choice.action);
    }

    processNode(choice.nextNode);
  };

  return (
    <div className="flex flex-col h-full bg-white font-['VT323'] text-lg text-black">
      <div className="flex-1 overflow-y-auto p-2 space-y-3 bg-white" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded shadow-sm border 
              ${msg.sender === 'player' ? 'bg-[#dcf8c6] border-[#b8dbb8] text-green-900' : 
                msg.sender === 'system' ? 'bg-black text-green-500 border-green-700 font-mono text-sm' : 
                'bg-[#f0f0f0] border-[#dcdcdc] text-gray-900'}`}>
              <span className={`font-bold text-xs block mb-0.5 ${msg.sender === 'system' ? 'opacity-100' : 'opacity-60 text-black'}`}>
                {msg.sender === 'player' ? 'Você' : msg.sender === 'system' ? 'SYS_ROOT' : 'Sarah'}
              </span>
              <span className={`${msg.sender === 'system' ? 'animate-pulse' : 'font-medium'}`}>{msg.text}</span>
            </div>
          </div>
        ))}
        
        {isTyping && (
            <div className="flex justify-start animate-fade-in">
                <div className="max-w-[85%] px-3 py-2 rounded shadow-sm border bg-[#f0f0f0] border-[#dcdcdc] text-gray-900">
                    <span className="font-bold text-xs block mb-0.5 opacity-60 text-black">Sarah</span>
                    <span className="font-medium">{typingContent}<span className="animate-pulse">|</span></span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2 bg-[#f0f0f0] border-t border-[#dcdcdc] space-y-1 min-h-[80px]">
        {!isTyping && currentChoices.map((choice, idx) => {
            const isLocked = choice.requiredPuzzle && !gameState.puzzles[choice.requiredPuzzle];
            return (
                <button
                    key={idx}
                    disabled={isLocked}
                    onClick={() => handleChoice(choice)}
                    className={`w-full text-left px-3 py-3 border border-gray-400 bg-white hover:bg-blue-50 active:bg-blue-100 text-black font-medium transition-colors
                        ${isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                    `}
                >
                    {isLocked ? '🔒 [AÇÃO BLOQUEADA - REQUER PISTA]' : `> ${choice.text}`}
                </button>
            );
        })}
        {currentChoices.length === 0 && !isTyping && (
            <div className="text-center text-gray-500 text-sm py-2 font-bold">Aguardando conexão...</div>
        )}
      </div>
    </div>
  );
};

export default Messenger;
