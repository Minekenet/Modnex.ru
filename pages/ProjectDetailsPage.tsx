
import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import SidebarCreators from '../components/ModDetails/SidebarCreators';
import SidebarDetails from '../components/ModDetails/SidebarDetails';
import FilesTab from '../components/ModDetails/FilesTab';
import { DetailsLayoutMapper } from '../components/ModDetails/DetailsLayoutMapper';
import { projectsService } from '../api/projects';
import { gamesService } from '../api/games';
import { filesService } from '../api/files';
import { Project } from '../types';

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

const ProjectDetailsPage: React.FC = () => {
  const { gameSlug, categorySlug, projectSlug } = ReactRouterDOM.useParams();
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState('Описание');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [game, setGame] = useState<any>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!gameSlug || !projectSlug) return;
      try {
        setLoading(true);
        const data = await projectsService.getBySlug(gameSlug, categorySlug || 'mods', projectSlug);
        setProject(data);

        // Fetch game info for config
        try {
          const gameData = await gamesService.getBySlug(gameSlug);
          setGame(gameData);
        } catch (gameErr) {
          console.error('Failed to fetch game for project:', gameErr);
        }

        // Fetch files
        try {
          const filesData = await filesService.listVersions(data.id);
          setFiles(filesData);
        } catch (fileErr) {
          console.error('Failed to fetch files:', fileErr);
        }

        setError(null);
      } catch (err) {
        console.error('Failed to fetch project:', err);
        setError('Проект не найден');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
    window.scrollTo(0, 0);
  }, [gameSlug, categorySlug, projectSlug]);

  const modData = useMemo(() => {
    if (!project) return null;
    return {
      ...project,
      banner: project.banner_url || `https://picsum.photos/seed/${project.id}/800/400`,
      gallery: project.gallery || [
        `https://picsum.photos/seed/${project.id}-1/1200/800`,
        `https://picsum.photos/seed/${project.id}-2/800/1200`,
        `https://picsum.photos/seed/${project.id}-3/1200/800`,
      ],
      // Map backend stats/fields to frontend expectations if needed
      author: project.author_name || 'Неизвестен',
      gameName: game?.title || 'Unknown Game',
      versions: project.attributes?.versions || [],
      loaders: project.attributes?.loaders || [],
      files: files.map(f => ({
        id: f.id,
        fileName: f.data?.filename || 'unknown',
        gameVer: f.version_number,
        loader: f.attributes?.loader || 'Common',
        date: new Date(f.created_at).toLocaleDateString('ru-RU'),
        downloads: f.download_count,
        size: 'N/A', // Size can be added to file data if needed
        type: f.data?.mimetype || 'zip'
      }))
    };
  }, [project, game, files]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [projectSlug]);

  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-');

  const detailsType = useMemo(() => {
    if (!game) return 'standard';

    const viewConfig = typeof game.view_config === 'string' ? JSON.parse(game.view_config) : (game.view_config || {});
    const gameSections = viewConfig.sections || {};
    const sectionSlug = project?.section_slug || categorySlug || 'mods';

    return gameSections[sectionSlug]?.detailsType || viewConfig.defaultConfig?.detailsType || 'standard';
  }, [game, project, categorySlug]);

  const tabs = ['Описание', 'Версии', 'Галерея'];
  if (isOwner) tabs.push('Управление');

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null && modData) {
      setSelectedImageIndex((selectedImageIndex + 1) % modData.gallery.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null && modData) {
      setSelectedImageIndex((selectedImageIndex - 1 + modData.gallery.length) % modData.gallery.length);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#1c1c1f] flex items-center justify-center text-white font-black uppercase tracking-widest">Загрузка...</div>;
  if (error || !modData) return <div className="min-h-screen bg-[#1c1c1f] flex items-center justify-center text-white font-black uppercase tracking-widest">{error || 'Проект не найден'}</div>;

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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Пожаловаться
              </button>
            </div>
          </div>
        </div>
      </div>

      <DetailsLayoutMapper
        detailsType={detailsType as any}
        modData={modData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setSelectedImageIndex={setSelectedImageIndex}
        isOwner={isOwner}
        tabs={tabs}
        modId={modData.id}
      />

      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} modTitle={modData.title} />

      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center p-6 animate-in fade-in duration-300 select-none"
          onClick={() => setSelectedImageIndex(null)}
        >
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-8 right-8 w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border-none cursor-pointer transition-all z-[610]"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <button
            onClick={prevImage}
            className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border-none cursor-pointer transition-all z-[610]"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          </button>

          <button
            onClick={nextImage}
            className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border-none cursor-pointer transition-all z-[610]"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
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

export default ProjectDetailsPage;
