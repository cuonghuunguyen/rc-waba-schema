import { ArrowRight, MessageSquare, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import type { ChatMessage, ChatSimulatorProps, IBotResponse, Localizable } from '../types';

export const ChatSimulator: React.FC<ChatSimulatorProps> = ({ config, isOpen, onClose }) => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('en');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset simulation
      setHistory([]);
      setLanguage('en'); // Start without language if strict flow
      processNode('selectLanguage');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const getText = (txt: string | Localizable | undefined): string => {
    if (!txt) return '???';
    if (typeof txt === 'string') return txt;
    return txt[language] || txt['en'] || '???';
  };

  // Recursively resolve references to find actual content
  const resolveContent = (nodeId: string, visited = new Set<string>()): IBotResponse[] | null => {
    if (visited.has(nodeId)) return null; // Circular reference detected
    visited.add(nodeId);

    const data = config[nodeId];
    if (!data) return null; // Node missing
    if (!Array.isArray(data)) return null; // Invalid format

    // Filter out refs and resolve them, return only IBotResponse items
    const responses: IBotResponse[] = [];
    for (const item of data) {
      if ('ref' in item) {
        // Follow the reference
        const refResponses = resolveContent(item.ref, visited);
        if (refResponses) {
          responses.push(...refResponses);
        }
      } else {
        // It's a direct response
        responses.push(item);
      }
    }

    return responses.length > 0 ? responses : null;
  };

  const processNode = (nodeId: string) => {
    const responses = resolveContent(nodeId);

    if (!responses) {
      // Fallback for wrong selection logic or missing node
      const wrong = config['wrongSelection'] || [{ text: "Error: Node not found or circular reference" }];
      addBotMessages(wrong);
      return;
    }

    setCurrentNodeId(nodeId);
    addBotMessages(responses);
  };

  const addBotMessages = (responses: IBotResponse[]) => {
    const msgs: ChatMessage[] = responses.map(r => ({ type: 'bot', data: r }));
    setHistory(prev => [...prev, ...msgs]);
  };

  const handleLanguageSelect = (lang: string, payload?: string) => {
    setLanguage(lang);
    const userMsg: ChatMessage = { type: 'user', text: `Selected: ${lang}` };
    setHistory(prev => [...prev, userMsg]);

    if (payload) processNode(payload);
    else processNode('greeting');
  };

  const handleButtonClick = (btn: { title: Localizable; payload?: string }) => {
    const userMsg: ChatMessage = { type: 'user', text: getText(btn.title) };
    setHistory(prev => [...prev, userMsg]);

    if (btn.payload && config[btn.payload]) {
      processNode(btn.payload);
    } else {
      // Wrong selection logic
      const wrong = config['wrongSelection'];
      if (wrong && Array.isArray(wrong)) {
        addBotMessages(wrong);
      }

      // Re-display current node options
      if (currentNodeId) {
        setTimeout(() => {
          const responses = resolveContent(currentNodeId);
          if (responses) addBotMessages(responses);
        }, 500);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[350px] h-[600px] bg-white shadow-2xl rounded-xl border border-slate-200 flex flex-col z-50 overflow-hidden font-sans">
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center shadow">
        <span className="font-bold flex items-center gap-2"><MessageSquare size={18} /> Bot Preview</span>
        <div className="flex gap-2">
          <button 
            onClick={() => { setHistory([]); setCurrentNodeId(null); setLanguage('en'); processNode('selectLanguage'); }} 
            className="hover:bg-blue-500 p-1 rounded"
            title="Reset"
          >
            <ArrowRight size={16} className="rotate-180" />
          </button>
          <button onClick={onClose} className="hover:bg-blue-500 p-1 rounded">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4" ref={scrollRef}>
        {history.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm shadow-sm ${msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-slate-800'}`}>
              {msg.type === 'bot' && msg.data && (
                <div className="space-y-2">
                  {msg.data.image && (
                    <img 
                      src={getText(msg.data.image)} 
                      alt="Bot asset" 
                      className="w-full h-32 object-cover rounded mb-2" 
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  {msg.data.text && <p>{getText(msg.data.text)}</p>}

                  {/* Action Indicators */}
                  {msg.data.transfer && (
                    <div className="text-xs bg-purple-100 text-purple-800 p-1 rounded mt-1">
                      System: Transferring to {msg.data.transfer.department}
                    </div>
                  )}
                  {msg.data.close && (
                    <div className="text-xs bg-red-100 text-red-800 p-1 rounded mt-1">
                      System: Chat Closed ({getText(msg.data.close.reason)})
                    </div>
                  )}

                  {/* Buttons */}
                  {msg.data.buttons && msg.data.buttons.length > 0 && (
                    <div className="grid gap-2 mt-3">
                      {msg.data.buttons.map((btn, bIdx) => (
                        <button
                          key={bIdx}
                          onClick={() => handleButtonClick(btn)}
                          className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 text-xs transition-colors font-medium"
                        >
                          {getText(btn.title)}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Language Select Special Case */}
                  {msg.data.selectLanguage && language === 'en' && (
                    <div className="grid gap-2 mt-3">
                      <button onClick={() => handleLanguageSelect('en', 'greeting')} className="w-full text-center px-3 py-2 bg-slate-800 text-white rounded text-xs">English</button>
                      <button onClick={() => handleLanguageSelect('ar', 'greeting')} className="w-full text-center px-3 py-2 bg-slate-800 text-white rounded text-xs">العربية</button>
                    </div>
                  )}
                </div>
              )}
              {msg.type === 'user' && msg.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
