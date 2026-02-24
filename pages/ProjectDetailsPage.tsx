
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import SidebarCreators from '../components/ProjectDetails/SidebarCreators';
import SidebarDetails from '../components/ProjectDetails/SidebarDetails';
import FilesTab from '../components/ProjectDetails/FilesTab';
import { DetailsLayoutMapper } from '../components/ProjectDetails/DetailsLayoutMapper';
import { projectsService } from '../api/projects';
import { gamesService } from '../api/games';
import { filesService } from '../api/files';
import { reportsService } from '../api/reports';
import { Project } from '../types';
import { useAuthStore } from '../stores/authStore';

const ReportModal: React.FC<{ isOpen: boolean; onClose: () => void; modTitle: string; itemId: string }> = ({ isOpen, onClose, modTitle, itemId }) => {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const reasons = [
    'Нарушение авторских прав',
    'Вирусы / Вредоносный код',
    'Не работает / Ошибки',
    'Ненормативный контент',
    'Спам / Обман'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await reportsService.create({ item_id: itemId, reason, comment: comment.trim() || undefined });
      onClose();
      setReason('');
      setComment('');
      alert('Ваша жалоба отправлена на рассмотрение.');
    } catch (err) {
      console.error(err);
      alert('Не удалось отправить жалобу. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/90" onClick={onClose}></div>
      <div className="relative bg-[#24262b] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-10 border border-white/5 animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-black uppercase tracking-tight mb-2 text-white">Жалоба</h2>
        <p className="text-white/80 text-sm font-medium mb-8 uppercase tracking-wide">Проект: {modTitle}</p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white uppercase tracking-widest">Причина</label>
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
            <label className="text-[10px] font-black text-white uppercase tracking-widest">Дополнительно</label>
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
            <button type="submit" disabled={loading} className="flex-grow bg-red-600 text-white font-black py-4 rounded-xl uppercase tracking-widest text-[11px] border-none cursor-pointer hover:bg-red-500 transition-all shadow-lg disabled:opacity-50">{loading ? 'Отправка...' : 'Отправить'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProjectDetailsPage: React.FC = () => {
  const { gameSlug, categorySlug, projectSlug } = ReactRouterDOM.useParams();
  const { isLoggedIn } = useAuthStore();
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState('Описание');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const [game, setGame] = useState<any>(null);

  const fetchProject = useCallback(async (showLoader = true) => {
    if (!gameSlug || !projectSlug) return;
    try {
      if (showLoader) setLoading(true);
      const data = await projectsService.getBySlug(gameSlug, categorySlug || 'mods', projectSlug);
      setProject(data);

      if (isLoggedIn) {
        try {
          const liked = await projectsService.checkLike(data.id);
          setIsLiked(liked);
        } catch (e) {
          console.error('Failed to check like status', e);
        }
      }

      try {
        const gameData = await gamesService.getBySlug(gameSlug);
        setGame(gameData);
      } catch (gameErr) {
        console.error('Failed to fetch game for project:', gameErr);
      }

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
      if (showLoader) setLoading(false);
    }
  }, [gameSlug, categorySlug, projectSlug]);

  useEffect(() => {
    fetchProject(true);
    window.scrollTo(0, 0);
  }, [fetchProject]);

  const modData = useMemo(() => {
    if (!project) return null;
    return {
      ...project,
      banner: project.banner_url || `https://picsum.photos/seed/${project.id}/800/400`,
      gallery: (project.gallery && project.gallery.length > 0) ? project.gallery : [
        `https://picsum.photos/seed/${project.id}-1/1200/800`,
        `https://picsum.photos/seed/${project.id}-2/800/1200`,
        `https://picsum.photos/seed/${project.id}-3/1200/800`,
      ],
      // Map backend stats/fields to frontend expectations if needed
      author: project.author_name || 'Неизвестен',
      authorAvatar: project.author_avatar || '',
      gameName: game?.title || 'Unknown Game',
      versions: project.attributes?.versions || [],
      loaders: project.attributes?.loaders || [],
      files: files.map(f => {
        let size = 'N/A';
        try {
          if (f.data && f.data.size) {
            const mb = (f.data.size / (1024 * 1024)).toFixed(2);
            size = `${mb} MB`;
          }
        } catch (e) {
          // Error parsing size
        }
        return {
          id: f.id,
          fileName: f.data?.filename || 'unknown',
          gameVer: f.version_number,
          loader: f.attributes?.loader || 'Common',
          date: new Date(f.created_at).toLocaleDateString('ru-RU'),
          downloads: f.download_count,
          size,
          type: f.data?.mimetype || 'zip'
        };
      })
    };
  }, [project, game, files]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [projectSlug]);

  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-');

  const sectionSlug = categorySlug || 'mods';
  const fileSchema = useMemo(() => {
    const sections = (game as any)?.sections ?? [];
    const section = sections.find((s: any) => s.slug === sectionSlug);
    const ui = section?.ui_config;
    return (ui?.file_schema ?? []) as { key: string; label: string; type: string; required?: boolean; options?: { value: string; label: string }[] }[];
  }, [game, sectionSlug]);

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

  const handleLikeToggle = async () => {
    if (!isLoggedIn || !modData || likeLoading) return;
    setLikeLoading(true);
    try {
      const newStatus = await projectsService.toggleLike(modData.id, isLiked);
      setIsLiked(newStatus);
      if (project) {
        setProject({
          ...project,
          stats: {
            ...project.stats,
            likes: (project.stats.likes || 0) + (newStatus ? 1 : -1)
          }
        });
      }
    } catch (e) {
      console.error('Failed to toggle like', e);
    } finally {
      setLikeLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#1c1c1f] flex items-center justify-center text-white font-black uppercase tracking-widest">Загрузка...</div>;
  if (error || !modData) return <div className="min-h-screen bg-[#1c1c1f] flex items-center justify-center text-white font-black uppercase tracking-widest">{error || 'Проект не найден'}</div>;

  return (
    <div className="min-h-screen bg-[#1c1c1f] text-white pb-32 font-['Inter',_sans-serif]">
      <button onClick={() => setIsOwner(!isOwner)} className="fixed bottom-4 left-4 z-[100] bg-white/5 text-[9px] px-3 py-1 rounded-full border-none cursor-pointer hover:bg-white/10 transition-all text-white/80 uppercase font-black">{isOwner ? 'Режим: Владелец' : 'Режим: Гость'}</button>

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
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
                    {modData.authorAvatar ? (
                      <img
                        src={modData.authorAvatar}
                        alt={modData.author}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement?.querySelector('.avatar-fallback')?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`avatar-fallback w-full h-full flex items-center justify-center text-zinc-600 bg-white/5 ${modData.authorAvatar ? 'hidden' : ''}`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-[12px] font-black text-white/80 uppercase tracking-[0.3em]">{modData.author}</span>
                </div>
                <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                <ReactRouterDOM.Link to={`/game/${game?.slug}`} className="text-[12px] font-black text-white/80 uppercase tracking-[0.3em] no-underline hover:text-white transition-colors">{modData.gameName}</ReactRouterDOM.Link>
              </div>
            </div>
            <p className="text-white/90 text-lg font-medium leading-relaxed max-w-2xl mb-8">{modData.description}</p>
            <div className="flex flex-wrap items-center gap-8 text-[14px] font-bold">
              <span className="text-white/70 flex items-center gap-2">Просмотры: <span className="text-white">{modData.stats.views || 0}</span></span>
              <span className="text-white/70 flex items-center gap-2">Скачивания: <span className="text-white">{modData.stats.downloads}</span></span>

              <button
                onClick={handleLikeToggle}
                disabled={!isLoggedIn || likeLoading}
                className={`flex items-center gap-2 transition-colors uppercase tracking-widest text-[11px] font-black border-none cursor-pointer px-3 py-1.5 rounded-full ${isLiked ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'} disabled:opacity-50`}
              >
                <svg className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {modData.stats.likes}
              </button>

              <button
                onClick={() => setIsReportOpen(true)}
                className="flex items-center gap-2 text-white/70 hover:text-red-400 transition-colors uppercase tracking-widest text-[11px] font-black bg-transparent border-none cursor-pointer ml-auto"
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
        gameSlug={gameSlug}
        sectionSlug={sectionSlug}
        projectSlug={projectSlug}
        fileSchema={fileSchema}
        onUpdateProject={gameSlug && projectSlug ? async (data) => {
          await projectsService.update(gameSlug, sectionSlug, projectSlug, data);
          fetchProject(false);
        } : undefined}
        onUploadVersion={project?.id ? async (file, version, extraData) => {
          await filesService.uploadVersion(project.id, version, file, '', extraData);
          fetchProject(false);
        } : undefined}
        onReload={() => fetchProject(false)}
      />

      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} modTitle={modData.title} itemId={modData.id} />

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
              <span className="text-white/80 font-black uppercase text-[10px] tracking-[0.5em]">
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
