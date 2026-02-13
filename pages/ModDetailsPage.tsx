
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import SidebarLinks from '../components/ModDetails/SidebarLinks';
import SidebarCreators from '../components/ModDetails/SidebarCreators';
import SidebarDetails from '../components/ModDetails/SidebarDetails';
import FilesTab from '../components/ModDetails/FilesTab';

const ModDetailsPage: React.FC = () => {
  const { modId } = ReactRouterDOM.useParams();
  const [activeTab, setActiveTab] = useState('Описание');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      alert('Загрузка началась! Файл проверен Smart Check.');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#1c1c1f] text-white pb-32 font-['Inter',_sans-serif]">
      {/* Hero Banner Section */}
      <div className="relative h-[480px] w-full overflow-hidden bg-[#0a0a0b]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1f] via-transparent to-transparent z-10"></div>
        <img 
          src="https://picsum.photos/seed/mod-banner-v3/1920/800" 
          className="w-full h-full object-cover opacity-20 grayscale scale-105"
          alt="Banner"
        />
        <div className="absolute inset-0 z-20 flex items-end">
          <div className="max-w-[1300px] mx-auto w-full px-8 pb-16 flex flex-col md:flex-row items-end gap-12">
            <div className="w-64 aspect-[3/4] bg-[#24262b] rounded-2xl shadow-2xl border border-white/5 overflow-hidden shrink-0 hidden md:block animate-in fade-in slide-in-from-bottom-4 duration-700">
              <img src="https://picsum.photos/seed/mod-poster-v3/600/800" className="w-full h-full object-cover" alt="Poster" />
            </div>
            <div className="flex-grow mb-4 animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Minecraft
                </span>
                <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Реализм
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-none">Ultra Realism HD Pack</h1>
              <div className="flex flex-wrap items-center gap-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 border border-white/10 overflow-hidden shadow-xl">
                    <img src="https://i.pravatar.cc/150?u=author-v3" alt="Author" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-1">Автор</span>
                    <span className="text-base font-black hover:text-blue-400 transition-colors cursor-pointer">modmuss50</span>
                  </div>
                </div>
                <div className="h-10 w-[1px] bg-white/10 hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-1">Обновление</span>
                  <span className="text-base font-black">2 дня назад</span>
                </div>
                <div className="h-10 w-[1px] bg-white/10 hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-1">Загрузки</span>
                  <span className="text-base font-black">245.6K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 mt-16">
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <div className="flex gap-12 border-b border-white/5 mb-12 overflow-x-auto no-scrollbar">
            {['Описание', 'Скриншоты', 'Файлы'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-5 text-[14px] font-black uppercase tracking-[0.2em] transition-all relative border-none bg-transparent cursor-pointer whitespace-nowrap ${
                  activeTab === tab ? 'text-white' : 'text-zinc-600 hover:text-white'
                }`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full"></div>}
              </button>
            ))}
          </div>

          <div className="animate-in fade-in duration-700">
            {activeTab === 'Описание' && (
              <div className="space-y-10">
                <p className="text-zinc-400 text-xl leading-relaxed font-medium">
                  Этот мод полностью перерабатывает графическую составляющую игры, добавляя поддержку 4K текстур, 
                  улучшенные тени и реалистичную физику воды. Ultra Realism HD Pack — это результат двух лет разработки, 
                  целью которой было сделать картинку максимально приближенной к реальности без потери производительности.
                </p>
                <div className="p-8 bg-white/[0.02] rounded-2xl border border-white/5">
                   <h3 className="text-2xl font-black uppercase tracking-tight mb-6">Ключевые особенности:</h3>
                   <ul className="space-y-5 text-zinc-500 font-bold list-none p-0">
                    <li className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Полная совместимость с последними шейдерами
                    </li>
                    <li className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Более 500 новых текстур высокого разрешения
                    </li>
                    <li className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Оптимизация для RTX и современного железа
                    </li>
                  </ul>
                </div>
              </div>
            )}
            {activeTab === 'Скриншоты' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-video bg-[#24262b] rounded-2xl overflow-hidden border border-white/5 cursor-zoom-in group shadow-xl">
                    <img 
                      src={`https://picsum.photos/seed/mod-screen-${i}/1200/675`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                      alt="" 
                    />
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'Файлы' && <FilesTab />}
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="lg:col-span-4 space-y-10">
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className={`w-full py-7 rounded-2xl font-black uppercase tracking-[0.2em] text-[15px] transition-all shadow-[0_20px_50px_rgba(0,0,0,0.4)] active:scale-95 border-none cursor-pointer flex items-center justify-center gap-4 ${
              isDownloading ? 'bg-[#27292e] text-zinc-600' : 'bg-white text-zinc-950 hover:bg-zinc-200'
            }`}
          >
            {isDownloading ? (
              <>
                <div className="w-6 h-6 border-3 border-zinc-600 border-t-transparent rounded-full animate-spin"></div>
                Проверка...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Скачать сейчас
              </>
            )}
          </button>

          <div className="space-y-6">
            <SidebarLinks />
            <SidebarCreators />
            <SidebarDetails />
          </div>

          <button className="w-full flex items-center justify-between p-6 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl group cursor-pointer transition-all">
            <span className="text-[13px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">В избранное</span>
            <svg className="w-6 h-6 text-zinc-600 group-hover:text-white transition-all transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModDetailsPage;
