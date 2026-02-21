import React, { useState, useEffect, useRef } from 'react';
import { supportService, SupportTicket, SupportMessage } from '../api/support';
import { useAuthStore } from '../stores/authStore';

const SupportChat: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { isLoggedIn } = useAuthStore();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!isOpen || !isLoggedIn) return;
    setLoadingTickets(true);
    supportService.getTickets()
      .then(setTickets)
      .catch(() => setTickets([]))
      .finally(() => setLoadingTickets(false));
    setSelectedTicket(null);
    setMessages([]);
  }, [isOpen, isLoggedIn]);

  useEffect(() => {
    if (!selectedTicket?.id) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    supportService.getMessages(selectedTicket.id)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false));
  }, [selectedTicket?.id]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || creating) return;
    setCreating(true);
    try {
      const ticket = await supportService.createTicket(newSubject.trim());
      setTickets(prev => [ticket, ...prev]);
      setSelectedTicket(ticket);
      setNewSubject('');
    } catch (err) {
      console.error(err);
      alert('Не удалось создать обращение.');
    } finally {
      setCreating(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedTicket || !input.trim() || sending) return;
    const body = input.trim();
    setInput('');
    setSending(true);
    try {
      const msg = await supportService.sendMessage(selectedTicket.id, body);
      setMessages(prev => [...prev, { ...msg, author_name: msg.author_name ?? 'Вы' }]);
    } catch (err) {
      console.error(err);
      setInput(body);
      alert('Не удалось отправить сообщение.');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-32 right-8 z-[100] w-[420px] h-[640px] bg-[#1a1b23] rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/5 flex flex-col overflow-hidden animate-in slide-in-from-bottom-12 duration-300">
      <div className="p-6 bg-[#24262b] border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">M</div>
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-widest leading-none m-0">Поддержка</h3>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Тикеты в БД
            </span>
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div ref={scrollRef} className="flex-grow overflow-y-auto no-scrollbar flex flex-col bg-[#0d0d0f]/50">
        {!isLoggedIn ? (
          <div className="p-6 flex flex-col items-center justify-center text-center flex-grow">
            <p className="text-zinc-400 text-sm font-medium">Войдите в аккаунт, чтобы написать в поддержку.</p>
          </div>
        ) : !selectedTicket ? (
          <div className="p-6 space-y-4">
            <h4 className="text-white font-black text-xs uppercase tracking-widest">Мои обращения</h4>
            <form onSubmit={handleCreateTicket} className="flex gap-2">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Тема обращения"
                className="flex-1 bg-[#1a1b23] text-white py-3 px-4 rounded-xl border border-white/10 outline-none placeholder:text-zinc-600 text-sm"
              />
              <button type="submit" disabled={!newSubject.trim() || creating} className="px-4 py-3 bg-blue-600 text-white text-xs font-black uppercase rounded-xl border-none cursor-pointer disabled:opacity-50">
                {creating ? '…' : 'Создать'}
              </button>
            </form>
            {loadingTickets ? (
              <p className="text-zinc-500 text-sm">Загрузка...</p>
            ) : tickets.length === 0 ? (
              <p className="text-zinc-500 text-sm">Нет обращений. Создайте новое выше.</p>
            ) : (
              <ul className="space-y-2">
                {tickets.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(t)}
                      className="w-full text-left px-4 py-3 bg-[#24262b] hover:bg-[#2a2b35] rounded-xl border border-white/5 text-white font-medium text-sm transition-colors"
                    >
                      {t.subject}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-white/5 flex items-center gap-2 shrink-0">
              <button type="button" onClick={() => { setSelectedTicket(null); setMessages([]); }} className="text-zinc-500 hover:text-white text-sm font-bold">
                ← Назад
              </button>
              <span className="text-white font-black text-xs uppercase truncate flex-1">{selectedTicket.subject}</span>
            </div>
            <div className="flex-grow p-6 space-y-4 min-h-0">
              {loadingMessages ? (
                <p className="text-zinc-500 text-sm">Загрузка сообщений...</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex flex-col ${m.is_staff ? 'items-start' : 'items-end'}`}>
                    <div className={`max-w-[90%] px-4 py-2.5 rounded-2xl text-[13px] font-medium leading-relaxed ${m.is_staff ? 'bg-[#24262b] text-zinc-300 border border-white/5 rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none'}`}>
                      {!m.is_staff && <span className="text-[10px] text-blue-200 block mb-1">{m.author_name ?? 'Вы'}</span>}
                      {m.is_staff && <span className="text-[10px] text-zinc-500 block mb-1">Поддержка</span>}
                      {m.body}
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSend} className="p-4 bg-[#24262b] border-t border-white/5 shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Сообщение..."
                  className="w-full bg-[#1a1b23] text-white py-3 pl-4 pr-12 rounded-xl border-none outline-none placeholder:text-zinc-600 text-sm font-medium"
                />
                <button type="submit" disabled={!input.trim() || sending} className="absolute right-2 w-9 h-9 rounded-lg flex items-center justify-center bg-blue-600 text-white border-none cursor-pointer disabled:opacity-50">
                  {sending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SupportChat;
