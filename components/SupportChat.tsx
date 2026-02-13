
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const SupportChat: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Инициализация чата при открытии
  useEffect(() => {
    if (isOpen && !chatRef.current) {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: "Ты — официальный чат поддержки Modnex. Помогай пользователям с вопросами по модам, сайту и загрузке. Отвечай вежливо, кратко и используй Markdown. Твой стиль — профессиональный, но дружелюбный геймерский саппорт. Не используй оранжевый цвет в описаниях, наш бренд теперь синий.",
        },
      });
    }
  }, [isOpen]);

  // Авто-скролл вниз
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const responseStream = await chatRef.current.sendMessageStream({ message: userMessage });
      
      // Добавляем пустое сообщение для модели, которое будем наполнять
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      let fullResponse = '';
      for await (const chunk of responseStream) {
        const part = chunk as GenerateContentResponse;
        fullResponse += part.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullResponse;
          return newMessages;
        });
      }
    } catch (err) {
      console.error('Chat Error:', err);
      setMessages(prev => [...prev, { role: 'model', text: 'Произошла ошибка при отправке сообщения. Попробуйте позже.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-32 right-8 z-[100] w-[420px] h-[640px] bg-[#1a1b23] rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/5 flex flex-col overflow-hidden animate-in slide-in-from-bottom-12 duration-300">
      {/* Header */}
      <div className="p-6 bg-[#24262b] border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">
            M
          </div>
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-widest leading-none m-0">Поддержка</h3>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              AI Online
            </span>
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto no-scrollbar space-y-6 bg-[#0d0d0f]/50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-10">
            <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-2">Чат с Modnex AI</h4>
            <p className="text-zinc-600 text-[13px] font-medium leading-relaxed">Задайте любой вопрос о модах, установке или работе нашей платформы.</p>
          </div>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[90%] px-5 py-3.5 rounded-2xl text-[14px] font-medium leading-relaxed shadow-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-[#24262b] text-zinc-300 border border-white/5 rounded-tl-none'
            }`}>
              {m.text || <div className="flex gap-1 py-1"><div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce"></div><div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]"></div><div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]"></div></div>}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-6 bg-[#24262b] border-t border-white/5 shrink-0">
        <div className="relative flex items-center">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ваше сообщение..."
            className="w-full bg-[#1a1b23] text-white py-4 pl-6 pr-14 rounded-2xl border-none outline-none placeholder:text-zinc-700 font-bold focus:ring-2 focus:ring-blue-600/30 transition-all text-sm"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`absolute right-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer ${
              input.trim() && !isLoading ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-600'
            }`}
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupportChat;
