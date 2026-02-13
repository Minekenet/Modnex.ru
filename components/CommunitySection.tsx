
import React from 'react';

const CommunitySection: React.FC = () => {
  return (
    <section className="max-w-[1400px] mx-auto px-8 pb-24 font-['Inter',_sans-serif]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Discord Card */}
        <div className="lg:col-span-2 relative overflow-hidden bg-[#161721] border border-[#5865F2]/20 rounded-2xl p-12 group cursor-pointer h-[340px] flex flex-col justify-center transition-all hover:shadow-[0_0_50px_rgba(88,101,242,0.15)]">
          {/* Background Icon */}
          <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity pointer-events-none">
            <svg className="w-80 h-80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03z"/>
            </svg>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-[#5865F2] font-black text-[11px] uppercase tracking-[0.4em] mb-6">COMMUNITY HUB</h3>
            <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-6 leading-[1.1]">НАШ DISCORD — <br/>СЕРДЦЕ ПРОЕКТА</h2>
            <p className="text-zinc-500 text-[14px] font-medium mb-10 max-w-sm leading-relaxed">
              Общайся с авторами в реальном времени, находи напарников и получай помощь по установке файлов.
            </p>
            <button className="bg-[#5865F2] hover:bg-[#4752c4] text-white font-black text-[12px] uppercase tracking-widest px-10 py-4 rounded-xl transition-all border-none cursor-pointer shadow-lg active:scale-95">
              ВСТУПИТЬ В СООБЩЕСТВО
            </button>
          </div>
        </div>

        {/* Support Block */}
        <div className="bg-[#1a1614] border border-[#f57b20]/20 rounded-2xl p-10 flex flex-col justify-between group cursor-pointer h-[340px] transition-all hover:bg-[#201b19] hover:border-[#f57b20]/40">
          <div>
            <div className="w-14 h-14 bg-[#f57b20] rounded-2xl flex items-center justify-center text-white mb-8 font-black text-2xl shadow-lg transition-transform group-hover:scale-110">B</div>
            <h3 className="text-white font-black text-2xl uppercase tracking-tight mb-4">BOOSTY</h3>
            <p className="text-zinc-500 text-[14px] font-medium leading-relaxed">
              Мы работаем без рекламы. Твоя поддержка помогает нам оплачивать сервера и развивать открытый API.
            </p>
          </div>
          <div className="mt-8">
            <a href="#" className="text-[#f57b20] font-black text-[12px] uppercase tracking-widest flex items-center gap-3 no-underline group-hover:gap-5 transition-all">
              ПОДДЕРЖАТЬ НАС
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Telegram Row */}
      <div className="bg-[#1a1b23] border border-white/5 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between group transition-all hover:bg-white/[0.03]">
        <div className="flex items-center gap-8 mb-6 md:mb-0">
          <div className="w-16 h-16 bg-[#229ED9]/10 rounded-2xl flex items-center justify-center text-[#229ED9] shadow-inner transition-transform group-hover:rotate-12">
            <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .33z"/>
            </svg>
          </div>
          <div>
            <h4 className="text-white font-black text-[18px] uppercase tracking-tight mb-1">ГОРЯЧИЕ РЕЛИЗЫ В TELEGRAM</h4>
            <p className="text-zinc-600 text-[14px] font-bold">Самые важные обновления платформы и топы модов прямо в твоем телефоне.</p>
          </div>
        </div>
        <button className="w-full md:w-auto bg-white/5 hover:bg-white/10 text-white font-black text-[12px] uppercase tracking-widest px-12 py-4 rounded-xl transition-all border border-white/10 cursor-pointer active:scale-95 shadow-xl">
          ПОДПИСАТЬСЯ
        </button>
      </div>

      {/* Trust Stats */}
      <div className="mt-24 pt-16 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-12 opacity-40 hover:opacity-100 transition-opacity duration-700">
        <div className="text-center group cursor-default">
          <div className="text-4xl font-black text-white tracking-tighter transition-transform group-hover:-translate-y-1">450K+</div>
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-3">Активных юзеров</div>
        </div>
        <div className="text-center group cursor-default">
          <div className="text-4xl font-black text-white tracking-tighter transition-transform group-hover:-translate-y-1">12K+</div>
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-3">Авторов модов</div>
        </div>
        <div className="text-center group cursor-default">
          <div className="text-4xl font-black text-white tracking-tighter transition-transform group-hover:-translate-y-1">100%</div>
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-3">Чистота файлов</div>
        </div>
        <div className="text-center group cursor-default">
          <div className="text-4xl font-black text-white tracking-tighter transition-transform group-hover:-translate-y-1">24/7</div>
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-3">Поддержка API</div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
