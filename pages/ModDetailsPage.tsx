
import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { GAMES_DATA } from '../constants';
import SidebarLinks from '../components/ModDetails/SidebarLinks';
import SidebarCreators from '../components/ModDetails/SidebarCreators';
import SidebarDetails from '../components/ModDetails/SidebarDetails';
import FilesTab from '../components/ModDetails/FilesTab';

const ModDetailsPage: React.FC = () => {
  const { gameId, modId } = ReactRouterDOM.useParams();
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState('Версии');
  
  // В продакшене здесь был бы запрос к API: fetch(`/api/mods/${modId}`)
  const game = useMemo(() => GAMES_DATA.find(g => g.id === gameId), [gameId]);
  
  // Имитация динамических данных мода
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

  return (
    <div className="min-h-screen bg-[#1c1c1f] text-zinc-300 pb-32">
      <button onClick={() => setIsOwner(!isOwner)} className="fixed bottom-4 left-4 z-[100] bg-white/5 text-[9px] px-3 py-1 rounded-full border-none cursor-pointer hover:bg-white/10 transition-all text-zinc-600 uppercase font-black">{isOwner ? 'Режим: Владелец' : 'Режим: Гость'}</button>

      <div className="bg-[#1c1c1f] py-14">
        <div className="max-w-[1300px] mx-auto px-8 flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-[354px] aspect-video rounded-2xl bg-[#24262b] border border-white/5 overflow-hidden shrink-0 shadow-2xl relative">
            <img src={modData.banner} className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500" alt="Banner" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>

          <div className="flex-grow">
            <div className="mb-4">
              <h1 className="text-5xl font-black text-white uppercase tracking-tight m-0">{modData.title}</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-[12px] font-black text-zinc-500 uppercase tracking-[0.3em]">Автор: {modData.author}</span>
                <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full"></div>
                <span className="text-[12px] font-black text-zinc-500 uppercase tracking-[0.3em]">{modData.gameName}</span>
              </div>
            </div>
            <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-2xl mb-8">{modData.description}</p>
            <div className="flex gap-8 text-[14px] font-bold">
              <span className="text-zinc-500 flex items-center gap-2">Downloads: <span className="text-zinc-300">{modData.stats.downloads}</span></span>
              <span className="text-zinc-500 flex items-center gap-2">Likes: <span className="text-zinc-300">{modData.stats.likes}</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto px-8 mt-4 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8">
          <div className="flex gap-8 mb-10 border-b border-white/5">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-[14px] font-black uppercase tracking-widest transition-all border-none bg-transparent cursor-pointer relative ${activeTab === tab ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>{tab}{activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full"></div>}</button>
            ))}
          </div>

          <div className="animate-in fade-in duration-500">
            {activeTab === 'Версии' && <FilesTab availableVersions={modData.versions} availableLoaders={modData.loaders} files={modData.files} />}
            {activeTab === 'Описание' && (
              <div className="bg-[#24262b] p-10 rounded-3xl border border-white/5 space-y-8 shadow-xl">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Подробности</h2>
                <p className="text-zinc-400 text-lg leading-relaxed">{modData.description}</p>
              </div>
            )}
            {activeTab === 'Управление' && isOwner && <div className="text-white font-black uppercase tracking-widest p-10 bg-white/5 rounded-3xl">Панель администратора мода</div>}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <SidebarDetails />
          <SidebarCreators />
          <SidebarLinks />
        </div>
      </div>
    </div>
  );
};

export default ModDetailsPage;
