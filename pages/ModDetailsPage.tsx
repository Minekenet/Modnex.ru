
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const ModDetailsPage: React.FC = () => {
  const { modId } = ReactRouterDOM.useParams();
  const [activeTab, setActiveTab] = useState('Описание');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      alert('Загрузка началась! Файл проверен Smart Check.');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white pb-20">
      {/* Hero Banner */}
      <div className="relative h-[450px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f10] via-transparent to-transparent z-10"></div>
        <img 
          src="https://picsum.photos/seed/mod-banner/1920/600" 
          className="w-full h-full object-cover opacity-30 grayscale blur-sm scale-105"
          alt="Banner"
        />
        <div className="absolute inset-0 z-20 flex items-end">
          <div className="max-w-7xl mx-auto w-full px-8 pb-12 flex flex-col md:flex-row items-end gap-10">
            <div className="w-64 aspect-[3/4] bg-zinc-900 rounded-sm shadow-2xl border border-white/10 overflow-hidden shrink-0 hidden md:block">
              <img src="https://picsum.photos/seed/mod-poster/600/800" className="w-full h-full object-cover" alt="Poster" />
            </div>
            <div className="flex-grow mb-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Minecraft
                </span>
                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Текстуры
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4">Ultra Realism HD Pack</h1>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/5 overflow-hidden">
                    <img src="https://i.pravatar.cc/150?u=author" alt="Author" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Автор</span>
                    <span className="text-sm font-black hover:underline cursor-pointer">ModMaster_RU</span>
                  </div>
                </div>
                <div className="h-8 w-[1px] bg-white/10"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Обновлено</span>
                  <span className="text-sm font-black">2 дня назад</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
        {/* Main Content */}
        <div className="lg:col-span-8">
          <div className="flex gap-10 border-b border-white/5 mb-10 overflow-x-auto no-scrollbar">
            {['Описание', 'Скриншоты', 'Файлы', 'Изменения', 'Комментарии'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-[13px] font-black uppercase tracking-[0.2em] transition-all relative border-none bg-transparent cursor-pointer ${
                  activeTab === tab ? 'text-white' : 'text-zinc-600 hover:text-white'
                }`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>}
              </button>
            ))}
          </div>

          <div className="prose prose-invert max-w-none">
            {activeTab === 'Описание' && (
              <div className="animate-in fade-in duration-500">
                <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                  Этот мод полностью перерабатывает графическую составляющую игры, добавляя поддержку 4K текстур, 
                  улучшенные тени и реалистичную физику воды. Ultra Realism HD Pack — это результат двух лет разработки, 
                  целью которой было сделать картинку максимально приближенной к реальности без потери производительности.
                </p>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4">Особенности:</h3>
                <ul className="space-y-4 text-zinc-500 font-medium list-none p-0">
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    Полная поддержка шейдеров последнего поколения
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    Более 500 новых текстур высокого разрешения
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    Оптимизация для видеокарт серии RTX
                  </li>
                </ul>
              </div>
            )}
            {activeTab === 'Скриншоты' && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-video bg-zinc-900 rounded-sm overflow-hidden border border-white/5 cursor-zoom-in group">
                    <img 
                      src={`https://picsum.photos/seed/screen-${i}/800/450`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      alt="" 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-8">
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className={`w-full py-6 rounded-sm font-black uppercase tracking-[0.2em] text-[14px] transition-all shadow-2xl active:scale-95 border-none cursor-pointer flex items-center justify-center gap-4 ${
                isDownloading ? 'bg-zinc-800 text-zinc-500' : 'bg-white text-zinc-950 hover:bg-zinc-200'
              }`}
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
                  Проверка файла...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Скачать бесплатно
                </>
              )}
            </button>

            <div className="bg-[#1a1b23] border border-white/5 rounded-sm p-8">
              <h4 className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.3em] mb-6">Информация</h4>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest">Версия мода</span>
                  <span className="text-[12px] font-black">2.4.1 (Stable)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest">Размер файла</span>
                  <span className="text-[12px] font-black">1.2 GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest">Всего скачиваний</span>
                  <span className="text-[12px] font-black">245,612</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest">Безопасность</span>
                  <span className="text-[11px] font-black text-green-500 uppercase tracking-tighter">Чист (Smart Check)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-white/5 rounded-sm group cursor-pointer hover:bg-white/5 transition-colors">
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Добавить в избранное</span>
              <svg className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModDetailsPage;
