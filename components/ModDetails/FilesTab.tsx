
import React from 'react';

const FilesTab: React.FC = () => {
  const files = [
    { version: '0.1.2.63', subtitle: '[18w50a] Fabric API 0.1.2 build 63', gameVer: '18w50a', platform: 'Fabric', date: '5 лет назад', downloads: '185' },
    { version: '0.1.2.62', subtitle: '[18w50a] Fabric API 0.1.2 build 62', gameVer: '18w50a', platform: 'Fabric', date: '5 лет назад', downloads: '431' },
    { version: '0.1.1.61', subtitle: '[18w50a] Fabric API 0.1.1 build 61', gameVer: '18w50a', platform: 'Fabric', date: '5 лет назад', downloads: '90' },
    { version: '0.1.1.60', subtitle: '[18w50a] Fabric API 0.1.1 build 60', gameVer: '18w50a', platform: 'Fabric', date: '5 лет назад', downloads: '89' },
    { version: '0.1.1.58', subtitle: '[18w50a] Fabric API 0.1.1 build 58', gameVer: '18w50a', platform: 'Fabric', date: '5 лет назад', downloads: '77' },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      {/* Filters and Pagination Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2a2c33] rounded-xl border-none text-[13px] font-bold text-zinc-300 hover:bg-[#32353d] transition-all cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4.5h18m-18 5h18m-18 5h18m-18 5h18" /></svg>
            Версии игры
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2a2c33] rounded-xl border-none text-[13px] font-bold text-zinc-300 hover:bg-[#32353d] transition-all cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4.5h18m-18 5h18m-18 5h18m-18 5h18" /></svg>
            Каналы
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-[13px] font-bold text-zinc-500">
          <button className="p-1 hover:text-white transition-colors bg-transparent border-none cursor-pointer"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg></button>
          <div className="flex items-center gap-3">
            <span className="text-white">1</span>
            <span>...</span>
            <span>53</span>
            <span className="w-7 h-7 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">54</span>
          </div>
          <button className="p-1 hover:text-white transition-colors bg-transparent border-none cursor-pointer"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg></button>
        </div>
      </div>

      {/* Table-like List */}
      <div className="bg-[#24262b] rounded-2xl border border-white/5 overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_120px_120px_120px_40px_40px] gap-4 px-8 py-5 border-b border-white/5 text-[11px] font-black uppercase tracking-widest text-zinc-600">
          <span>Название</span>
          <span className="text-center">Версия</span>
          <span className="text-center">Платформы</span>
          <span className="text-center">Опубликовано</span>
          <span className="text-center">Загрузки</span>
          <span></span>
          <span></span>
        </div>

        <div className="divide-y divide-white/[0.03]">
          {files.map((file, i) => (
            <div key={i} className="grid grid-cols-[1fr_120px_120px_120px_120px_40px_40px] gap-4 px-8 py-5 items-center hover:bg-white/[0.01] transition-colors group cursor-pointer">
              <div className="flex items-center gap-5">
                <div className="w-9 h-9 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500 font-black text-sm shrink-0 border border-orange-500/20">B</div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-black text-zinc-200 group-hover:text-white transition-colors tracking-tight">{file.version}</span>
                  <span className="text-[11px] font-bold text-zinc-600">{file.subtitle}</span>
                </div>
              </div>

              <div className="flex justify-center">
                <span className="bg-white/5 border border-white/5 px-3 py-1 rounded-full text-[11px] font-bold text-zinc-400">
                  {file.gameVer}
                </span>
              </div>

              <div className="flex justify-center">
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 px-3 py-1 rounded-full text-[11px] font-bold text-zinc-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 7h.01M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2h10" /></svg>
                  {file.platform}
                </div>
              </div>

              <span className="text-[13px] font-bold text-zinc-500 text-center">{file.date}</span>
              <span className="text-[13px] font-bold text-zinc-400 text-center">{file.downloads}</span>

              <button className="text-green-500 hover:text-green-400 transition-colors bg-transparent border-none cursor-pointer p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>

              <button className="text-zinc-600 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilesTab;
