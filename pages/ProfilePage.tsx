
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [activeTab, setActiveTab] = useState('Мои проекты');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGame, setFilterGame] = useState('Все игры');
  
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  // Кроппер
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [cropType, setCropType] = useState<'avatar' | 'banner'>('avatar');
  const [tempImageUrl, setTempImageUrl] = useState('');
  
  // Состояние кроп-бокса (в процентах от изображения)
  const [cropBox, setCropBox] = useState({ x: 25, y: 25, width: 40, height: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'move' | 'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startBox, setStartBox] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const cropperContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [profileData, setProfileData] = useState({
    username: 'MINEKENET',
    bio: 'Разрабатываю инструменты для Minecraft и Cyberpunk. Ценю стабильность и открытый исходный код.',
    boostyUrl: 'https://boosty.to/modnex',
    patreonUrl: 'https://patreon.com/modnex',
    avatarUrl: '',
    bannerUrl: ''
  });

  const [myMods, setMyMods] = useState([
    { id: '1', title: 'Realistic Water Physics', game: 'Minecraft', category: 'Моды', downloads: '12K', likes: '1.2K', date: '2 дня назад', img: 'https://picsum.photos/seed/water/300/200' },
    { id: '2', title: 'Cyberpunk UI Redesign', game: 'Cyberpunk 2077', category: 'Интерфейс', downloads: '5.4K', likes: '420', date: '1 неделю назад', img: 'https://picsum.photos/seed/ui/300/200' },
    { id: '3', title: 'Advanced Shaders Pack', game: 'Minecraft', category: 'Шейдеры', downloads: '45K', likes: '3.8K', date: '1 месяц назад', img: 'https://picsum.photos/seed/shader/300/200' },
    { id: '4', title: 'Better Leaves Addon', game: 'Minecraft', category: 'Моды', downloads: '8.2K', likes: '900', date: '3 месяца назад', img: 'https://picsum.photos/seed/leaves/300/200' },
  ]);

  const filteredList = useMemo(() => {
    const list = activeTab === 'Мои проекты' ? myMods : [];
    return list.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGame = filterGame === 'Все игры' || item.game === filterGame;
      return matchesSearch && matchesGame;
    });
  }, [activeTab, searchQuery, filterGame, myMods]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTempImageUrl(url);
      setCropType(type);
      setIsCropOpen(true);
    }
    e.target.value = '';
  };

  const onImageLoad = () => {
    if (!imageRef.current) return;
    const { width, height } = imageRef.current;
    const targetRatio = cropType === 'avatar' ? 1.0 : (760 / 280);
    const imgRatio = width / height;

    let cropW, cropH;
    if (imgRatio > targetRatio) {
      cropH = 60; 
      cropW = (cropH / imgRatio) * targetRatio;
    } else {
      cropW = 60; 
      cropH = (cropW * imgRatio) / targetRatio;
    }

    setCropBox({
      x: (100 - cropW) / 2,
      y: (100 - cropH) / 2,
      width: cropW,
      height: cropH
    });
  };

  const saveCroppedImage = () => {
    if (!imageRef.current) return;
    const img = imageRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    const cropX = (cropBox.x / 100) * img.width * scaleX;
    const cropY = (cropBox.y / 100) * img.height * scaleY;
    const cropWidth = (cropBox.width / 100) * img.width * scaleX;
    const cropHeight = (cropBox.height / 100) * img.height * scaleY;

    canvas.width = cropType === 'avatar' ? 200 : 760;
    canvas.height = cropType === 'avatar' ? 200 : 280;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.98);
    if (cropType === 'avatar') setProfileData({ ...profileData, avatarUrl: croppedDataUrl });
    else setProfileData({ ...profileData, bannerUrl: croppedDataUrl });
    setIsCropOpen(false);
  };

  const handleMouseDown = (e: React.MouseEvent, type: typeof dragType) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    setDragType(type);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartBox({ ...cropBox });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !imageRef.current) return;

    const container = imageRef.current.getBoundingClientRect();
    const dx = ((e.clientX - startPos.x) / container.width) * 100;
    const dy = ((e.clientY - startPos.y) / container.height) * 100;

    setCropBox(prev => {
      let next = { ...prev };
      const imgRatio = container.width / container.height;
      const targetRatio = cropType === 'avatar' ? 1.0 : (760 / 280);
      const k = imgRatio / targetRatio;

      if (dragType === 'move') {
        next.x = Math.max(0, Math.min(100 - prev.width, startBox.x + dx));
        next.y = Math.max(0, Math.min(100 - prev.height, startBox.y + dy));
      } else if (dragType) {
        let deltaW = (dragType === 'se' || dragType === 'ne') ? dx : -dx;
        let newW = Math.max(10, startBox.width + deltaW);
        
        if (dragType === 'se' || dragType === 'ne') {
           newW = Math.min(newW, 100 - startBox.x);
        } else {
           newW = Math.min(newW, startBox.x + startBox.width);
        }

        let newH = newW * k;

        if (dragType === 'se' || dragType === 'sw') {
           if (startBox.y + newH > 100) {
             newH = 100 - startBox.y;
             newW = newH / k;
           }
        } else {
           if (startBox.y + startBox.height - newH < 0) {
             newH = startBox.y + startBox.height;
             newW = newH / k;
           }
        }

        next.width = newW;
        next.height = newH;

        if (dragType === 'nw') {
          next.x = startBox.x + (startBox.width - newW);
          next.y = startBox.y + (startBox.height - newH);
        } else if (dragType === 'ne') {
          next.y = startBox.y + (startBox.height - newH);
        } else if (dragType === 'sw') {
          next.x = startBox.x + (startBox.width - newW);
        }
      }
      return next;
    });
  }, [isDragging, dragType, startPos, startBox, cropType]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const Pagination = () => {
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
      <div className="mt-12 py-8 flex items-center justify-center gap-6 border-t border-white/5">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="text-zinc-600 hover:text-white transition-colors bg-transparent border-none cursor-pointer disabled:opacity-20"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg></button>
        <div className="flex items-center gap-5">{pages.map(n => (<button key={n} onClick={() => setCurrentPage(n)} className={`text-[15px] font-black border-none bg-transparent cursor-pointer transition-all ${currentPage === n ? 'text-white underline underline-offset-8' : 'text-zinc-600 hover:text-white'}`}>{n}</button>))}</div>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="text-zinc-600 hover:text-white transition-colors bg-transparent border-none cursor-pointer disabled:opacity-20"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg></button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1c1c1f] text-white font-['Inter',_sans-serif] pb-20 relative">
      <button onClick={() => setIsOwnProfile(!isOwnProfile)} className="fixed bottom-4 left-4 z-[100] bg-white/5 text-[9px] px-3 py-1 rounded-full border-none cursor-pointer hover:bg-white/10 transition-all text-zinc-600 uppercase font-black">{isOwnProfile ? 'Владелец' : 'Гость'}</button>
      <div className="max-w-[1300px] mx-auto px-6 pt-10">
        <div className="bg-[#24262b] rounded-2xl overflow-hidden shadow-2xl mb-12 relative">
          <div onClick={() => isOwnProfile && bannerInputRef.current?.click()} className={`h-80 relative overflow-hidden bg-[#16161a] ${isOwnProfile ? 'cursor-pointer group' : ''}`}>
            <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'banner')} />
            {profileData.bannerUrl ? (<img src={profileData.bannerUrl} className="w-full h-full object-cover" alt="" />) : (<div className="absolute inset-0 bg-[#0a0a0c]"></div>)}
            {isOwnProfile && (<div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"><span className="bg-white/10 px-6 py-3 rounded-xl border border-white/10 text-[11px] font-black uppercase tracking-widest">Изменить баннер</span></div>)}
          </div>
          <div className="px-12 pb-12 pt-24 relative"> 
            <div className="flex flex-col md:flex-row items-end gap-10 -mt-36 mb-12">
              <div className="relative group shrink-0">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'avatar')} />
                <div onClick={() => isOwnProfile && fileInputRef.current?.click()} className={`w-48 h-48 rounded-full border-[10px] border-[#24262b] overflow-hidden bg-[#1a1b23] shadow-2xl transition-all ${isOwnProfile ? 'cursor-pointer hover:brightness-110' : ''}`}>
                  {profileData.avatarUrl ? (<img src={profileData.avatarUrl} className="w-full h-full object-cover" alt="" />) : (<div className="w-full h-full flex items-center justify-center text-zinc-800"><svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg></div>)}
                </div>
              </div>
              <div className="flex-grow pb-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-5">
                      <h1 className="text-3xl font-black tracking-tight uppercase leading-none text-white m-0">{profileData.username}</h1>
                      <span className="bg-white/5 text-zinc-600 text-[10px] font-black px-3 py-1.5 rounded border border-white/5 tracking-[0.2em] self-center">АВТОР</span>
                    </div>
                    <p className="text-zinc-500 text-[15px] font-medium max-w-xl leading-relaxed">{profileData.bio}</p>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    {isOwnProfile ? (<><button className="bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-xl text-[12px] font-black uppercase tracking-widest border-none cursor-pointer shadow-xl">Создать</button><button onClick={() => setIsSettingsOpen(true)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-4 rounded-xl border-none cursor-pointer transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg></button></>) : (<><button className="bg-white text-black hover:bg-zinc-200 px-10 py-4 rounded-xl text-[12px] font-black uppercase tracking-widest border-none cursor-pointer shadow-xl">Подписаться</button><button className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-xl border-none text-[12px] font-black uppercase tracking-widest cursor-pointer transition-all">Написать</button></>)}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-white/5">{[{ label: 'Скачиваний', val: '62.4K' }, { label: 'Проекты', val: myMods.length }, { label: 'Лайки', val: '1.2K' }, { label: 'Репутация', val: '9.8' }].map((stat, i) => (<div key={i} className="bg-[#1a1b23] p-6 rounded-xl border border-white/[0.02]"><span className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">{stat.label}</span><span className="text-2xl font-black text-zinc-300">{stat.val}</span></div>))}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <div className="flex gap-10 border-b border-white/5 mb-8">{['Мои проекты', 'Избранное', ...(isOwnProfile ? ['Черновики'] : [])].map((tab) => (<button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }} className={`pb-4 text-[13px] font-black uppercase tracking-widest transition-all relative border-none bg-transparent cursor-pointer ${activeTab === tab ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>{tab}{activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full"></div>}</button>))}</div>
            <div className="flex flex-col sm:flex-row gap-4 mb-8"><input type="text" placeholder="Поиск..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="flex-grow bg-[#24262b] border-none py-4 px-6 rounded-xl text-sm font-bold text-white outline-none focus:bg-[#2a2c33] transition-all" /><select value={filterGame} onChange={(e) => { setFilterGame(e.target.value); setCurrentPage(1); }} className="bg-[#24262b] border-none px-6 py-4 rounded-xl text-sm font-bold text-zinc-400 outline-none appearance-none cursor-pointer min-w-[200px]"><option>Все игры</option><option>Minecraft</option><option>Cyberpunk 2077</option></select></div>
            <div className="space-y-4">
              {paginatedList.length > 0 ? paginatedList.map((item) => (
                <div key={item.id} className="group bg-[#24262b] p-5 rounded-xl flex items-center justify-between hover:bg-[#2a2c33] transition-all relative">
                  <div className="flex items-center gap-6"><img src={item.img} className="w-24 h-24 bg-[#1a1b23] rounded-lg object-cover" alt="" /><div><span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{item.game} • {item.category}</span><h3 className="text-xl font-black text-zinc-100 uppercase tracking-tight m-0">{item.title}</h3><div className="flex gap-4 mt-3 text-[11px] font-bold text-zinc-600 uppercase tracking-widest"><span>{item.downloads} downloads</span><span>{item.likes} likes</span></div></div></div>
                  <div className="relative" ref={openMenuId === item.id ? menuRef : null}>
                    <button onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)} className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-zinc-600 hover:text-white border-none cursor-pointer transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></button>
                    {openMenuId === item.id && (<div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1b23] border border-white/5 rounded-xl shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95"><button className="w-full text-left px-5 py-3 text-[12px] font-black uppercase tracking-widest hover:bg-white/5 transition-all bg-transparent border-none text-zinc-400 hover:text-white cursor-pointer flex items-center gap-3"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>В избранное</button>{isOwnProfile && <button className="w-full text-left px-5 py-3 text-[12px] font-black uppercase tracking-widest hover:bg-white/5 transition-all bg-transparent border-none text-zinc-400 hover:text-white cursor-pointer flex items-center gap-3"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>Редактировать</button>}<button className="w-full text-left px-5 py-3 text-[12px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all bg-transparent border-none text-zinc-600 hover:text-red-500 cursor-pointer flex items-center gap-3"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>Удалить</button></div>)}
                  </div>
                </div>
              )) : (<div className="py-32 text-center bg-[#24262b] rounded-xl border border-dashed border-white/5"><p className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">Список пуст</p></div>)}
              <Pagination />
            </div>
          </div>
          <aside className="lg:col-span-4 space-y-6"><div className="bg-[#24262b] rounded-xl p-8 border border-white/[0.03]"><h3 className="text-zinc-600 font-black text-[10px] uppercase tracking-[0.2em] mb-6">Донаты</h3><div className="flex flex-col gap-3"><a href={profileData.boostyUrl} target="_blank" className="flex items-center gap-4 p-4 bg-orange-500/10 rounded-xl hover:bg-orange-500 transition-all group no-underline border border-orange-500/20"><div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg">B</div><span className="text-orange-500 group-hover:text-white font-black text-[12px] uppercase">Boosty</span></a><a href={profileData.patreonUrl} target="_blank" className="flex items-center gap-4 p-4 bg-red-500/10 rounded-xl hover:bg-red-500 transition-all group no-underline border border-red-500/20"><div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg">P</div><span className="text-red-500 group-hover:text-white font-black text-[12px] uppercase">Patreon</span></a></div></div></aside>
        </div>
      </div>

      {/* Интерактивный Кроппер */}
      {isCropOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 select-none overflow-hidden bg-black/98">
          <div className="absolute inset-0" onClick={() => setIsCropOpen(false)}></div>
          <div className="relative bg-[#1c1c21] w-full max-w-4xl rounded-[40px] overflow-hidden shadow-[0_60px_150px_rgba(0,0,0,0.9)] border border-white/5 animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#232329]">
              <h2 className="text-2xl font-black uppercase tracking-tighter m-0 text-white/90">
                {cropType === 'avatar' ? 'Обрезка аватара' : 'Обрезка баннера'}
              </h2>
              <button onClick={() => setIsCropOpen(false)} className="bg-white/5 hover:bg-white/10 text-white rounded-full w-12 h-12 flex items-center justify-center border-none cursor-pointer transition-all">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Main Editor Area */}
            <div className="p-0 bg-[#070708] relative flex items-center justify-center h-[550px] overflow-hidden">
              <div ref={cropperContainerRef} className="relative inline-block border border-white/10">
                {/* Original Image Background */}
                <img 
                  ref={imageRef} 
                  src={tempImageUrl} 
                  onLoad={onImageLoad} 
                  className="max-h-[480px] w-auto block select-none pointer-events-none" 
                  alt="Original" 
                  onDragStart={(e) => e.preventDefault()} 
                />

                {/* Darkened area (Overlay) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                   <div className="absolute top-0 left-0 right-0 bg-black/85" style={{ height: `${cropBox.y}%` }}></div>
                   <div className="absolute bottom-0 left-0 right-0 bg-black/85" style={{ height: `${100 - cropBox.y - cropBox.height}%` }}></div>
                   <div className="absolute left-0 bg-black/85" style={{ top: `${cropBox.y}%`, height: `${cropBox.height}%`, width: `${cropBox.x}%` }}></div>
                   <div className="absolute right-0 bg-black/85" style={{ top: `${cropBox.y}%`, height: `${cropBox.height}%`, width: `${100 - cropBox.x - cropBox.width}%` }}></div>
                </div>

                {/* Selection Box (Hole) */}
                <div 
                  className={`absolute cursor-move border-[4px] border-[#3b82f6] box-border shadow-[0_0_0_2px_rgba(0,0,0,0.6)] z-20 ${cropType === 'avatar' ? 'rounded-full' : ''}`} 
                  style={{ top: `${cropBox.y}%`, left: `${cropBox.x}%`, width: `${cropBox.width}%`, height: `${cropBox.height}%` }} 
                  onMouseDown={(e) => handleMouseDown(e, 'move')}
                >
                  {/* Visual content hole */}
                  <div className={`w-full h-full overflow-hidden pointer-events-none relative ${cropType === 'avatar' ? 'rounded-full' : ''}`}>
                    <img 
                      src={tempImageUrl} 
                      className="absolute max-w-none" 
                      style={{ 
                        top: `-${(cropBox.y / 100) * (imageRef.current?.height || 0)}px`, 
                        left: `-${(cropBox.x / 100) * (imageRef.current?.width || 0)}px`, 
                        width: `${imageRef.current?.width}px`, 
                        height: `${imageRef.current?.height}px` 
                      }} 
                      alt="" 
                    />
                  </div>

                  {/* Corner Handles - Sharp White Squares with Blue Border */}
                  <div className="absolute -top-4 -left-4 w-9 h-9 bg-white border-[4px] border-[#3b82f6] cursor-nw-resize z-50 shadow-2xl" onMouseDown={(e) => handleMouseDown(e, 'nw')}></div>
                  <div className="absolute -top-4 -right-4 w-9 h-9 bg-white border-[4px] border-[#3b82f6] cursor-ne-resize z-50 shadow-2xl" onMouseDown={(e) => handleMouseDown(e, 'ne')}></div>
                  <div className="absolute -bottom-4 -left-4 w-9 h-9 bg-white border-[4px] border-[#3b82f6] cursor-sw-resize z-50 shadow-2xl" onMouseDown={(e) => handleMouseDown(e, 'sw')}></div>
                  <div className="absolute -bottom-4 -right-4 w-9 h-9 bg-white border-[4px] border-[#3b82f6] cursor-se-resize z-50 shadow-2xl" onMouseDown={(e) => handleMouseDown(e, 'se')}></div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-8 flex justify-end gap-6 border-t border-white/5 bg-[#232329]">
              <button onClick={() => setIsCropOpen(false)} className="bg-white/5 hover:bg-white/10 text-white px-14 py-5 rounded-2xl font-black uppercase tracking-widest text-[12px] border-none cursor-pointer transition-all active:scale-95">
                Отмена
              </button>
              <button onClick={saveCroppedImage} className="bg-white text-zinc-950 hover:bg-zinc-200 px-14 py-5 rounded-2xl font-black uppercase tracking-widest text-[12px] border-none cursor-pointer transition-all active:scale-95 shadow-2xl">
                Готово
              </button>
            </div>
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90" onClick={() => setIsSettingsOpen(false)}></div>
          <div className="relative bg-[#24262b] w-full max-w-xl rounded-xl overflow-hidden shadow-2xl p-10 border border-white/5">
            <div className="flex items-center justify-between mb-10"><h2 className="text-2xl font-black uppercase tracking-tighter">Настройки</h2><button onClick={() => setIsSettingsOpen(false)} className="text-zinc-600 hover:text-white bg-transparent border-none cursor-pointer p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsSettingsOpen(false); }}>
              <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Никнейм</label><input type="text" value={profileData.username} onChange={(e) => setProfileData({...profileData, username: e.target.value})} className="w-full bg-[#1a1b23] border-none p-4 rounded-xl text-white font-bold outline-none" /></div>
              <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">О себе</label><textarea rows={3} value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} className="w-full bg-[#1a1b23] border-none p-4 rounded-xl text-white font-medium outline-none resize-none" /></div>
              <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-widest text-[11px] border-none cursor-pointer">Применить</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
