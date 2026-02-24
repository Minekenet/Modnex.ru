import React, { useState, useMemo, useRef, useEffect } from 'react';
import { filesService } from '../../api/files';

interface FileItem {
  id: number | string;
  fileName: string;
  gameVer: string;
  loader: string;
  date: string;
  downloads: string | number;
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
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  const handleDownload = async (fileId: string | number) => {
    try {
      setLoadingFileId(String(fileId));
      const { url } = await filesService.getDownloadUrl(String(fileId));
      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', ''); // Suggested filename can be added if backend provides it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Не удалось получить ссылку на скачивание');
    } finally {
      setLoadingFileId(null);
    }
  };
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

      <div className="bg-[#0d0d0f] rounded-2xl shadow-2xl mt-8 overflow-x-auto">
        <div className="min-w-[1000px]">
          <div className="grid grid-cols-[1fr_130px_100px_110px_110px_100px_60px] gap-4 px-8 py-6 bg-[#080809] text-[12px] font-black uppercase tracking-widest text-zinc-500">
            <span>Название</span><span>Загружен</span><span>Размер</span><span>Версия</span><span>Доп.</span><span>Загрузки</span><span></span>
          </div>
          <div className="divide-y divide-white/[0.02]">
            {currentFiles.map((file) => (
              <div key={file.id} className="grid grid-cols-[1fr_130px_100px_110px_110px_100px_60px] gap-4 px-8 py-5 items-center hover:bg-white/[0.02] transition-colors group">
                <span className="text-[14px] font-bold text-zinc-200 group-hover:text-white transition-colors truncate block">{file.fileName}</span>
                <div className="text-[13px] font-medium text-zinc-500 whitespace-nowrap">{file.date}</div>
                <div className="text-[13px] font-medium text-zinc-500">{file.size}</div>
                <div className="text-[13px] font-bold text-zinc-400">{file.gameVer}</div>
                <div className="text-[13px] font-bold text-zinc-400">{file.loader}</div>
                <div className="text-[13px] font-bold text-zinc-400">{file.downloads}</div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleDownload(file.id)}
                    disabled={loadingFileId === String(file.id)}
                    className="w-10 h-10 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white border-none cursor-pointer transition-all flex items-center justify-center rounded-xl outline-none active:scale-90 disabled:opacity-50"
                  >
                    {loadingFileId === String(file.id) ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
            {currentFiles.length === 0 && <div className="py-32 text-center text-zinc-800 font-black uppercase tracking-[0.4em]">Ничего не найдено</div>}
          </div>
        </div>
        {renderPagination()}
      </div>
    </div>
  );
};

export default FilesTab;
