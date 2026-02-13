
import React, { useState, useMemo, useRef, useEffect } from 'react';

interface FileItem {
  id: number | string;
  fileName: string;
  gameVer: string;
  loader: string;
  date: string;
  downloads: string;
  size: string;
  type: string;
}

interface FilesTabProps {
  availableLoaders?: string[];
  availableVersions?: string[];
  files?: FileItem[];
}

const FilesTab: React.FC<FilesTabProps> = ({ 
  availableLoaders = [], 
  availableVersions = [],
  files = [] 
}) => {
  const [activeLoader, setActiveLoader] = useState('Все типы');
  const [activeVersion, setActiveVersion] = useState('Все версии');
  const [searchFileName, setSearchFileName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoaderOpen, setIsLoaderOpen] = useState(false);
  const [isVersionOpen, setIsVersionOpen] = useState(false);
  
  const loaderRef = useRef<HTMLDivElement>(null);
  const versionRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 14;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (loaderRef.current && !loaderRef.current.contains(e.target as Node)) setIsLoaderOpen(false);
      if (versionRef.current && !versionRef.current.contains(e.target as Node)) setIsVersionOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredFiles = useMemo(() => {
    return files.filter(f => {
      const loaderMatch = activeLoader === 'Все типы' || f.loader === activeLoader;
      const versionMatch = activeVersion === 'Все версии' || f.gameVer === activeVersion;
      const searchMatch = f.fileName.toLowerCase().includes(searchFileName.toLowerCase());
      return loaderMatch && versionMatch && searchMatch;
    });
  }, [files, activeLoader, activeVersion, searchFileName]);

  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage) || 1;
  
  useEffect(() => {
    setCurrentPage(1);
  }, [activeLoader, activeVersion, searchFileName]);

  const currentFiles = filteredFiles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    if (totalPages <= 1) return null;
    for (let i = 1; i <= totalPages; i++) pages.push(i);

    return (
      <div className="flex items-center justify-center gap-6 py-12 text-[18px] font-bold select-none">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="bg-transparent border-none text-zinc-700 hover:text-white transition-colors cursor-pointer disabled:opacity-20"><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg></button>
        <div className="flex items-center gap-6">
          {pages.map((p) => (
            <button key={p} onClick={() => handlePageChange(p)} className={`border-none bg-transparent cursor-pointer transition-all ${currentPage === p ? 'text-white underline underline-offset-[14px] decoration-white decoration-2' : 'text-zinc-600 hover:text-white'}`}>{p}</button>
          ))}
        </div>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="bg-transparent border-none text-zinc-700 hover:text-white transition-colors cursor-pointer disabled:opacity-20"><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg></button>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-[#24262b] rounded-2xl flex items-center px-6 py-4 shadow-xl">
        <svg className="w-5 h-5 text-zinc-600 mr-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input 
          type="text" 
          placeholder="Поиск по названию файла..." 
          value={searchFileName}
          onChange={(e) => setSearchFileName(e.target.value)}
          className="w-full bg-transparent border-none text-zinc-300 placeholder:text-zinc-700 text-[15px] font-bold outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {availableVersions.length > 0 && (
          <div className="relative" ref={versionRef}>
            <button onClick={() => setIsVersionOpen(!isVersionOpen)} className="h-12 px-6 bg-[#24262b] text-[13px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-8 cursor-pointer hover:bg-[#2d2f36] transition-all min-w-[200px] justify-between border-none rounded-xl shadow-lg">
              <span className="truncate">{activeVersion}</span>
              <svg className={`w-3.5 h-3.5 text-zinc-700 transition-transform ${isVersionOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isVersionOpen && (
              <div className="absolute top-full left-0 mt-2 w-full bg-[#24262b] rounded-xl shadow-2xl z-[110] overflow-hidden py-2">
                 <div className="max-h-60 overflow-y-auto no-scrollbar">
                   <button onClick={() => { setActiveVersion('Все версии'); setIsVersionOpen(false); }} className="w-full text-left px-6 py-3 text-[12px] font-black uppercase text-zinc-500 hover:bg-white/5 bg-transparent border-none cursor-pointer">Все версии</button>
                   {availableVersions.map(v => (<button key={v} onClick={() => { setActiveVersion(v); setIsVersionOpen(false); }} className="w-full text-left px-6 py-3 text-[12px] font-black uppercase text-zinc-500 hover:bg-white/5 bg-transparent border-none cursor-pointer">{v}</button>))}
                 </div>
              </div>
            )}
          </div>
        )}

        {availableLoaders.length > 0 && (
          <div className="relative" ref={loaderRef}>
            <button onClick={() => setIsLoaderOpen(!isLoaderOpen)} className="h-12 px-6 bg-[#24262b] text-[13px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-8 cursor-pointer hover:bg-[#2d2f36] transition-all min-w-[200px] justify-between border-none rounded-xl shadow-lg">
              <span className="truncate">{activeLoader}</span>
              <svg className={`w-3.5 h-3.5 text-zinc-700 transition-transform ${isLoaderOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isLoaderOpen && (
              <div className="absolute top-full left-0 mt-2 w-full bg-[#24262b] rounded-xl shadow-2xl z-[110] overflow-hidden py-2">
                 <div className="max-h-60 overflow-y-auto no-scrollbar">
                   <button onClick={() => { setActiveLoader('Все типы'); setIsLoaderOpen(false); }} className="w-full text-left px-6 py-3 text-[12px] font-black uppercase text-zinc-500 hover:bg-white/5 bg-transparent border-none cursor-pointer">Все типы</button>
                   {availableLoaders.map(l => (<button key={l} onClick={() => { setActiveLoader(l); setIsLoaderOpen(false); }} className="w-full text-left px-6 py-3 text-[12px] font-black uppercase text-zinc-500 hover:bg-white/5 bg-transparent border-none cursor-pointer">{l}</button>))}
                 </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-[#0d0d0f] rounded-2xl border border-white/5 overflow-hidden shadow-2xl mt-8">
        <div className="grid grid-cols-[48px_minmax(180px,1fr)_130px_90px_100px_120px_100px_40px] gap-2 px-8 py-6 bg-[#080809] border-b border-white/5 text-[13px] font-black uppercase tracking-widest text-zinc-500">
          <span>Тип</span><span>Название</span><span>Загружен</span><span>Размер</span><span>Версия</span><span>Доп.</span><span>Загрузки</span><span></span>
        </div>
        <div className="divide-y divide-white/[0.02]">
          {currentFiles.map((file) => (
            <div key={file.id} className="grid grid-cols-[48px_minmax(180px,1fr)_130px_90px_100px_120px_100px_40px] gap-2 px-8 py-5 items-center hover:bg-white/[0.02] transition-colors group">
              <div className="w-6 h-6 bg-[#1a3a1c] text-[#4ade80] rounded-[4px] flex items-center justify-center text-[10px] font-black shadow-inner">{file.type}</div>
              <span className="text-[14px] font-bold text-zinc-300 group-hover:text-white transition-colors truncate block">{file.fileName}</span>
              <div className="text-[13px] font-medium text-zinc-500 whitespace-nowrap">{file.date}</div>
              <div className="text-[13px] font-medium text-zinc-500">{file.size}</div>
              <div className="text-[13px] font-bold text-zinc-400">{file.gameVer}</div>
              <div className="text-[13px] font-bold text-zinc-400">{file.loader}</div>
              <div className="text-[13px] font-bold text-zinc-400">{file.downloads}</div>
              <button className="bg-transparent border-none text-zinc-800 hover:text-white cursor-pointer transition-all p-2 flex items-center justify-center outline-none"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg></button>
            </div>
          ))}
          {currentFiles.length === 0 && <div className="py-32 text-center text-zinc-800 font-black uppercase tracking-[0.4em]">Ничего не найдено</div>}
        </div>
      </div>
      {renderPagination()}
    </div>
  );
};

export default FilesTab;
