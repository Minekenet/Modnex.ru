
import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { GAMES_DATA } from '../constants';
import SidebarLinks from '../components/ModDetails/SidebarLinks';
import SidebarCreators from '../components/ModDetails/SidebarCreators';
import SidebarDetails from '../components/ModDetails/SidebarDetails';
import FilesTab from '../components/ModDetails/FilesTab';

const ReportModal: React.FC<{ isOpen: boolean; onClose: () => void; modTitle: string }> = ({ isOpen, onClose, modTitle }) => {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const reasons = [
    'Нарушение авторских прав',
    'Вирусы / Вредоносный код',
    'Не работает / Ошибки',
    'Ненормативный контент',
    'Спам / Обман'
  ];

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/90" onClick={onClose}></div>
      <div className="relative bg-[#24262b] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-10 border border-white/5 animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-black uppercase tracking-tight mb-2 text-white">Жалоба</h2>
        <p className="text-zinc-500 text-sm font-medium mb-8 uppercase tracking-wide">Проект: {modTitle}</p>
        
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Ваша жалоба отправлена на рассмотрение.'); onClose(); }}>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Причина</label>
            <select 
              required
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#1a1b23] border-none p-4 rounded-xl text-white font-bold outline-none appearance-none cursor-pointer"
            >
              <option value="">Выберите причину...</option>
              {reasons.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Дополнительно</label>
            <textarea 
              rows={3} 
              placeholder="Опишите проблему подробнее..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-[#1a1b23] border-none p-4 rounded-xl text-white font-medium outline-none resize-none"
            />
          </div>
          <div className="flex gap-4">
             <button type="button" onClick={onClose} className="flex-grow bg-white/5 text-white font-black py-4 rounded-xl uppercase tracking-widest text-[11px] border-none cursor-pointer hover:bg-white/10 transition-all">Отмена</button>
             <button type="submit" className="flex-grow bg-red-600 text-white font-black py-4 rounded-xl uppercase tracking-widest text-[11px] border-none cursor-pointer hover:bg-red-500 transition-all shadow-lg">Отправить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ModDetailsPage: React.FC = () => {
  const { gameSlug, modId } = ReactRouterDOM.useParams();
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState('Описание');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  const game = useMemo(() => GAMES_DATA.find(g => g.slug === gameSlug), [gameSlug]);
  
  const modData = useMemo(() => {
    return {
      title: game?.title === 'Minecraft' ? 'Fabric API' : `${game?.title} Enhancement`,
      author: 'Gecko',
      gameName: game?.title || 'Unknown Game',
      description: `Ультимативное дополнение для ${game?.title}. Позволяет значительно расширить возможности игрового процесса и улучшить совместимость.`,
      banner: game?.imageUrl || 'https://picsum.photos/seed/mod/800/400',
      stats: { downloads: '130.67M', likes: '27.6k' },
      versions: game?.filters?.find(f => f.label.includes('Версия'))?.options || ['1.0.0'],
      loaders: game?.filters?.find(f => f.label.includes('Загрузчик') || f.label.includes('Платформа'))?.options || ['Standart'],
      gallery: [
        `https://picsum.photos/seed/${modId}-1/1200/800`,
        `https://picsum.photos/seed/${modId}-2/800/1200`,
        `https://picsum.photos/seed/${modId}-3/1200/800`,
        `https://picsum.photos/seed/${modId}-4/1200/400`,
        `https://picsum.photos/seed/${modId}-5/1200/800`,
      ],
      files: Array.from({ length: 15 }, (_, i) => ({
        id: i,
        fileName: `${modId}-v1.2.${i}.jar`,
        gameVer: game?.filters?.[0]?.options?.[i % (game?.filters?.[0]?.options?.length || 1)] || '1.0',
        loader: game?.filters?.[1]?.options?.[i % (game?.filters?.[1]?.options?.length || 1)] || 'Default',
        date: 'Nov 14, 2025',
        downloads: '1.2K',
        size: '15.4 MB',
        type: 'R'
      }))
    };
  }, [game, modId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [modId]);

  const tabs = ['Описание', 'Версии', 'Галерея'];
  if (isOwner) tabs.push('Управление');

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % modData.gallery.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + modData.gallery.length) % modData.gallery.length);
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1c1f] text-zinc-300 pb-32 font-['Inter',_sans-serif]">
      <button onClick={() => setIsOwner(!isOwner)} className="fixed bottom-4 left-4 z-[100] bg-white/5 text-[9px] px-3 py-1 rounded-full border-none cursor-pointer hover:bg-white/10 transition-all text-zinc-600 uppercase font-black">{isOwner ? 'Режим: Владелец' : 'Режим: Гость'}</button>

      <div className="bg-[#1c1c1f] py-14">
        <div className="max-w-[1300px] mx-auto px-8 flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-[354px] aspect-video rounded-2xl bg-[#24262b] overflow-hidden shrink-0 shadow-2xl relative">
            <img src={modData.banner} className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500" alt="Banner" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>

          <div className="flex-grow">
            <div className="mb-4">
              <h1 className="text-5xl font-black text-white uppercase tracking-tight m-0 leading-tight">{modData.title}</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-[12px] font-black text-zinc-500 uppercase tracking-[0.3em]">Автор: {modData.author}</span>
                <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full"></div>
                <ReactRouterDOM.Link to={`/game/${game?.slug}`} className="text-[12px] font-black text-zinc-500 uppercase tracking-[0.3em] no-underline hover:text-white transition-colors">{modData.gameName}</ReactRouterDOM.Link>
              </div>
            </div>
            <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-2xl mb-8">{modData.description}</p>
            <div className="flex flex-wrap items-center gap-8 text-[14px] font-bold">
              <span className="text-zinc-500 flex items-center gap-2">Downloads: <span className="text-zinc-300">{modData.stats.downloads}</span></span>
              <span className="text-zinc-500 flex items-center gap-2">Likes: <span className="text-zinc-300">{modData.stats.likes}</span></span>
              <button 
                onClick={() => setIsReportOpen(true)}
                className="flex items-center gap-2 text-zinc-600 hover:text-red-500 transition-colors uppercase tracking-widest text-[11px] font-black bg-transparent border-none cursor-pointer ml-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                Пожаловаться
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto px-8 mt-4 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8">
          <div className="flex gap-1 mb-10 bg-white/5 p-1.5 rounded-2xl w-fit">
            {tabs.map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`px-8 py-3.5 text-[13px] font-black uppercase tracking-widest transition-all border-none rounded-xl cursor-pointer ${
                  activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="animate-in fade-in duration-500">
            {activeTab === 'Описание' && (
              <div className="bg-[#24262b] p-10 md:p-14 rounded-3xl space-y-12 shadow-xl leading-relaxed text-zinc-300 overflow-hidden">
                <div className="space-y-6">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">Обзор модификации</h2>
                  <p className="text-lg text-zinc-400">
                    Этот проект полностью переосмысляет стандартные механики {game?.title}, добавляя глубину и новые возможности. 
                    Мы создали этот инструмент для тех, кто хочет получить максимум от игры без ущерба для производительности.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Ключевые особенности</h3>
                    <ul className="space-y-4 p-0 m-0 list-none">
                      {[
                        'Улучшенная оптимизация кода',
                        'Поддержка сторонних шейдеров',
                        'Динамическое освещение объектов',
                        'Исправление более 50 банильных багов'
                      ].map(item => (
                        <li key={item} className="flex items-start gap-4 text-[15px] font-semibold text-zinc-400 group">
                          <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                            <svg className="w-3 h-3 text-blue-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
                          </div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-3xl overflow-hidden bg-black/40 aspect-[4/3] shadow-2xl relative">
                    <img src={`https://picsum.photos/seed/${modId}-desc-img/600/600`} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                </div>

                <div className="bg-white/5 p-10 rounded-3xl border-l-4 border-blue-600 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full"></div>
                  <h4 className="text-white font-black uppercase text-sm tracking-widest mb-4 flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                    Обратите внимание
                  </h4>
                  <p className="text-zinc-500 text-[15px] m-0 font-medium">
                    Данная версия находится в активной разработке. Мы рекомендуем использовать только последние версии 
                    загрузчиков (Forge/Fabric) для обеспечения максимальной совместимости с другими модами.
                  </p>
                </div>

                <div className="space-y-8">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Руководство по установке</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { step: '01', title: 'Скачивание', text: 'Выберите нужную версию во вкладке файлов.' },
                      { step: '02', title: 'Установка', text: 'Поместите файл в папку mods вашего игрового клиента.' },
                      { step: '03', title: 'Запуск', text: 'Убедитесь, что выбран нужный профиль загрузчика.' }
                    ].map(step => (
                      <div key={step.step} className="bg-white/2 p-6 rounded-2xl border border-white/5">
                        <span className="text-2xl font-black text-blue-600 mb-3 block">{step.step}</span>
                        <h5 className="text-white font-bold text-sm uppercase tracking-wider mb-2">{step.title}</h5>
                        <p className="text-zinc-500 text-[13px] leading-relaxed m-0 font-medium">{step.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Версии' && (
              <FilesTab 
                availableVersions={modData.versions} 
                availableLoaders={modData.loaders} 
                files={modData.files} 
              />
            )}

            {activeTab === 'Галерея' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                {modData.gallery.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedImageIndex(idx)}
                    className="aspect-video rounded-2xl bg-[#24262b] overflow-hidden cursor-pointer group relative shadow-lg"
                  >
                    <img src={img} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110" alt={`Screenshot ${idx + 1}`} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Управление' && isOwner && (
              <div className="text-white font-black uppercase tracking-widest p-10 bg-white/5 rounded-3xl">
                Панель администратора мода
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <SidebarDetails />
          <SidebarCreators />
          <SidebarLinks />
        </div>
      </div>

      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} modTitle={modData.title} />

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center p-6 animate-in fade-in duration-300 select-none"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button 
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-8 right-8 w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border-none cursor-pointer transition-all z-[610]"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>

          <button 
            onClick={prevImage}
            className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border-none cursor-pointer transition-all z-[610]"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
          </button>

          <button 
            onClick={nextImage}
            className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border-none cursor-pointer transition-all z-[610]"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
          </button>

          <div className="relative w-full max-w-7xl flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            <div className="w-full aspect-video bg-[#0a0a0c] shadow-[0_0_150px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center border border-white/5">
              <img 
                src={modData.gallery[selectedImageIndex]} 
                className="w-full h-full object-contain animate-in zoom-in-95 duration-500" 
                alt="" 
              />
            </div>
            <div className="mt-8 flex items-center gap-6">
              <span className="text-zinc-600 font-black uppercase text-[10px] tracking-[0.5em]">
                {selectedImageIndex + 1} / {modData.gallery.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModDetailsPage;
