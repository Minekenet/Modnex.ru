
import React, { useState } from 'react';

const FAQ_ITEMS = [
  {
    category: 'Общие вопросы',
    items: [
      { q: 'Что такое Modnex?', a: 'Modnex — это современная платформа для поиска, загрузки и публикации модификаций для популярных видеоигр.' },
      { q: 'Нужна ли регистрация для скачивания?', a: 'Нет, вы можете скачивать файлы без регистрации, но личный кабинет дает доступ к избранному и уведомлениям об обновлениях.' }
    ]
  },
  {
    category: 'Техническая часть',
    items: [
      { q: 'Как установить мод?', a: 'Инструкции по установке обычно находятся в описании каждого мода или во вложенном файле README. Большинство модов Minecraft требуют Forge или Fabric.' },
      { q: 'Файл помечен как вирус, что делать?', a: 'Мы проверяем все файлы системой Smart Check. Иногда антивирусы выдают ложные срабатывания на скрипты.' }
    ]
  },
  {
    category: 'Безопасность',
    items: [
      { q: 'Как восстановить доступ?', a: 'На странице входа нажмите "Забыли пароль?" и следуйте инструкциям, которые придут на вашу электронную почту.' },
      { q: 'Можно ли удалить аккаунт?', a: 'Да, вы можете инициировать удаление аккаунта через настройки профиля или обратившись в поддержку.' }
    ]
  }
];

const KnowledgeBasePage: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [ticketSent, setTicketSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: '', message: '' });

  const toggle = (id: string) => setOpenId(openId === id ? null : id);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setTicketSent(true);
      // Сохраняем статус в localStorage для имитации активного чата в Header/App
      localStorage.setItem('hasActiveTicket', 'true');
      window.dispatchEvent(new Event('ticket_status_changed'));
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#1a1b1e] text-white py-24 px-8 font-['Inter',_sans-serif]">
      <div className="max-w-4xl mx-auto">
        <header className="text-left mb-24">
          <div className="text-zinc-600 font-black text-[11px] uppercase tracking-[0.5em] mb-4">Support Center</div>
          <h1 className="text-6xl font-black uppercase tracking-tighter mb-6 leading-none text-white">База знаний</h1>
          <p className="text-zinc-500 font-medium text-lg max-w-xl">Ответы на часто задаваемые вопросы и инструменты для связи с командой Modnex.</p>
        </header>

        <div className="grid grid-cols-1 gap-16">
          {FAQ_ITEMS.map((cat, catIdx) => (
            <div key={catIdx} className="space-y-6">
              <h2 className="text-[12px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3 opacity-40">
                <span className="w-6 h-[1px] bg-white"></span>
                {cat.category}
              </h2>
              <div className="space-y-3">
                {cat.items.map((item, itemIdx) => {
                  const id = `${catIdx}-${itemIdx}`;
                  const isOpen = openId === id;
                  return (
                    <div key={id} className={`bg-[#24262b] rounded-2xl overflow-hidden transition-all duration-300 border border-white/[0.02] ${isOpen ? 'bg-[#2e333a] shadow-xl' : 'hover:bg-[#2a2c33]'}`}>
                      <button onClick={() => toggle(id)} className="w-full px-8 py-6 flex items-center justify-between text-left bg-transparent border-none cursor-pointer group">
                        <span className="text-[16px] font-bold text-zinc-300 group-hover:text-white transition-colors">{item.q}</span>
                        <svg className={`w-5 h-5 text-zinc-600 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      <div className={`px-8 transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="pt-4 border-t border-white/5">
                           <p className="text-zinc-400 text-[15px] leading-relaxed font-medium">{item.a}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Секция обращений */}
        <div className="mt-24 p-12 bg-[#24262b] rounded-[32px] border border-white/[0.02] text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10">
            {!ticketSent ? (
              <div className="flex flex-col lg:flex-row gap-12">
                <div className="max-w-xs">
                  <h3 className="text-3xl font-black uppercase mb-4 tracking-tight">Написать нам</h3>
                  <p className="text-zinc-500 font-medium text-[15px]">Если вы не нашли ответ на свой вопрос, создайте тикет. Наши модераторы ответят в течение дня.</p>
                </div>
                
                <form className="flex-grow space-y-4" onSubmit={handleSubmitTicket}>
                  <input 
                    required
                    type="text" 
                    placeholder="Тема обращения"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                    className="w-full bg-[#1a1b23] text-white py-5 px-6 rounded-2xl border-none outline-none placeholder:text-zinc-700 font-bold focus:bg-[#20212b] transition-all"
                  />
                  <textarea 
                    required
                    rows={4}
                    placeholder="Опишите вашу проблему..."
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
                    className="w-full bg-[#1a1b23] text-white py-5 px-6 rounded-2xl border-none outline-none placeholder:text-zinc-700 font-bold focus:bg-[#20212b] transition-all resize-none"
                  ></textarea>
                  <button 
                    type="submit"
                    disabled={isSending}
                    className="bg-white text-zinc-950 font-black px-12 py-5 rounded-2xl transition-all uppercase tracking-widest text-[12px] border-none cursor-pointer hover:bg-zinc-200 active:scale-95 disabled:opacity-50"
                  >
                    {isSending ? 'Отправка...' : 'Отправить тикет'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-3xl font-black uppercase mb-4">Тикет создан!</h3>
                <p className="text-zinc-500 font-medium mb-10">Мы получили ваше сообщение. Ответ придет в раздел уведомлений и в чат поддержки.</p>
                <button 
                  onClick={() => setTicketSent(false)}
                  className="text-zinc-400 hover:text-white font-black text-[11px] uppercase tracking-widest border-none bg-transparent cursor-pointer underline underline-offset-8"
                >
                  Создать еще одно обращение
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBasePage;
