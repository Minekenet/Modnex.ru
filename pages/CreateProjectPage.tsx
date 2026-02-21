
import React, { useState, useMemo, useEffect } from 'react';
import { projectsService } from '../api/projects';
import { gamesService } from '../api/games';
import { filesService } from '../api/files';
import { Game } from '../types';
import * as ReactRouterDOM from 'react-router-dom';

import { useAuthStore } from '../stores/authStore';

const CreateProjectPage: React.FC = () => {
    const navigate = ReactRouterDOM.useNavigate();
    const { isLoggedIn } = useAuthStore();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/auth');
        }
    }, [isLoggedIn, navigate]);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [games, setGames] = useState<Game[]>([]);
    const [sectionsForGame, setSectionsForGame] = useState<{ slug: string; name: string; ui_config?: any }[]>([]);
    const [gameDetails, setGameDetails] = useState<Game & { sections?: any[] } | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [fileAttributes, setFileAttributes] = useState<Record<string, string>>({ version_number: '1.0.0' });
    const [gallery, setGallery] = useState<{ file: File; preview: string; isPrimary: boolean }[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        gameSlug: '',
        sectionSlug: '',
        description: '',
        attributes: {
            version: '1.0.0',
        } as Record<string, any>,
        links: [] as { label: string; url: string }[]
    });

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const data = await gamesService.getAll();
                setGames(data);
            } catch (err) {
                console.error('Failed to fetch games:', err);
            }
        };
        fetchGames();
    }, []);

    // Cascading: when game is selected, fetch categories (sections) for that game from API
    useEffect(() => {
        if (!formData.gameSlug) {
            setSectionsForGame([]);
            setGameDetails(null);
            return;
        }
        let cancelled = false;
        const fetchSections = async () => {
            try {
                const gameData = await gamesService.getBySlug(formData.gameSlug);
                if (!cancelled && gameData?.sections) {
                    setSectionsForGame(gameData.sections);
                    setGameDetails(gameData);
                } else if (!cancelled) {
                    setSectionsForGame([]);
                    setGameDetails(null);
                }
            } catch (err) {
                console.error('Failed to fetch sections for game:', err);
                if (!cancelled) {
                    setSectionsForGame([]);
                    setGameDetails(null);
                }
            }
        };
        fetchSections();
        return () => { cancelled = true; };
    }, [formData.gameSlug]);

    const selectedGame = useMemo(() =>
        games.find(g => g.slug === formData.gameSlug),
        [formData.gameSlug, games]);

    const creationConfig = useMemo(() => {
        if (!formData.sectionSlug) return { creationType: 'standard' };
        const game = gameDetails || selectedGame;
        if (!game) return { creationType: 'standard' };
        const section = (game as any).sections?.find((s: any) => s.slug === formData.sectionSlug);
        if (section?.ui_config) {
            const ui = typeof section.ui_config === 'string' ? JSON.parse(section.ui_config) : section.ui_config;
            return ui;
        }
        const viewConfig = typeof game.view_config === 'string' ? JSON.parse(game.view_config) : (game.view_config || {});
        const gameSections = viewConfig.sections || {};
        return gameSections[formData.sectionSlug] || viewConfig.defaultConfig || { creationType: 'standard' };
    }, [gameDetails, selectedGame, formData.sectionSlug]);

    const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newImages = files.map((file: any) => ({
            file,
            preview: URL.createObjectURL(file),
            isPrimary: gallery.length === 0
        }));
        setGallery([...gallery, ...newImages]);
    };

    const nextStep = () => {
        if (step === 1 && (!formData.title || !formData.gameSlug || !formData.sectionSlug)) return alert('Заполните базовые поля');
        setStep(s => s + 1);
    };
    const prevStep = () => setStep(s => s - 1);

    const submitWithStatus = async (status: 'draft' | 'published') => {
        const isDraft = status === 'draft';
        if (!isDraft && !file) return alert('Для публикации выберите файл проекта');
        try {
            setLoading(true);
            const project = await projectsService.create(formData.gameSlug, formData.sectionSlug, {
                title: formData.title,
                slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
                summary: formData.description.slice(0, 100),
                description: formData.description,
                attributes: formData.attributes,
                links: formData.links,
                status
            });

            for (const img of gallery) {
                await filesService.uploadGalleryImage(project.id, img.file, img.isPrimary);
            }

            if (file) {
                const version = fileAttributes.version_number || formData.attributes.version || '1.0.0';
                const extra: Record<string, string> = {};
                Object.entries(fileAttributes).forEach(([k, v]) => { if (v && k !== 'version_number') extra[k] = v; });
                await filesService.uploadVersion(project.id, version, file, 'Initial release', Object.keys(extra).length ? extra : undefined);
            }

            alert(isDraft ? 'Черновик сохранён!' : 'Проект успешно опубликован!');
            navigate(`/game/${formData.gameSlug}/${formData.sectionSlug}/${project.slug}`);
        } catch (err) {
            console.error(err);
            alert('Ошибка при сохранении');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDraft = () => submitWithStatus('draft');
    const handlePublish = () => submitWithStatus('published');

    return (
        <div className="min-h-screen bg-[#0f0f10] text-white py-24 px-8 font-['Inter',_sans-serif]">
            <div className="max-w-4xl mx-auto">
                <header className="mb-16">
                    <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-none">Новый проект</h1>
                    <div className="flex flex-wrap items-center gap-y-6 gap-x-12">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <div key={s} className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 shadow-2xl ${step === s ? 'bg-blue-600 rotate-12 scale-110 shadow-blue-600/20' :
                                    step > s ? 'bg-green-500 -rotate-12' : 'bg-zinc-900 text-zinc-700'
                                    }`}>
                                    {step > s ? '✓' : s}
                                </div>
                                <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${step === s ? 'text-white' : 'text-zinc-600'}`}>
                                    {s === 1 ? 'Основы' : s === 2 ? 'Медиа' : s === 3 ? 'Описание' : s === 4 ? 'Ссылки' : 'Файл'}
                                </span>
                            </div>
                        ))}
                    </div>
                </header>

                <div className="bg-[#1a1b23] rounded-[32px] p-12 border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>

                    {step === 1 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] block">Название шедевра</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Напр: Minecraft HD Textures"
                                    className="w-full bg-[#0f0f10] border border-white/[0.03] p-6 rounded-2xl text-white font-bold text-lg outline-none focus:ring-4 focus:ring-blue-600/20 transition-all placeholder:text-zinc-800"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] block">Игра</label>
                                    <div className="relative">
                                        <select
                                            value={formData.gameSlug}
                                            onChange={(e) => setFormData({ ...formData, gameSlug: e.target.value, sectionSlug: '' })}
                                            className="w-full bg-[#0f0f10] border border-white/[0.03] p-6 rounded-2xl text-white font-bold outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-blue-600/20 transition-all"
                                        >
                                            <option value="">Выберите игру...</option>
                                            {games.map(g => (
                                                <option key={g.slug} value={g.slug}>{g.title}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className={`space-y-4 transition-all duration-700 ${formData.gameSlug ? 'opacity-100' : 'opacity-20 pointer-events-none blur-sm'}`}>
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] block">Раздел каталога</label>
                                    <div className="relative">
                                        <select
                                            value={formData.sectionSlug}
                                            onChange={(e) => setFormData({ ...formData, sectionSlug: e.target.value })}
                                            className="w-full bg-[#0f0f10] border border-white/[0.03] p-6 rounded-2xl text-white font-bold outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-blue-600/20 transition-all"
                                        >
                                            <option value="">Выберите раздел...</option>
                                            {sectionsForGame.map((s) => (
                                                <option key={s.slug} value={s.slug}>{s.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {gallery.map((img, i) => (
                                    <div key={i} className="aspect-video relative rounded-2xl overflow-hidden group border border-white/5">
                                        <img src={img.preview} className="w-full h-full object-cover" alt="" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    const next = [...gallery];
                                                    next.forEach(g => g.isPrimary = false);
                                                    next[i].isPrimary = true;
                                                    setGallery(next);
                                                }}
                                                className={`p-2 rounded-lg transition-all ${img.isPrimary ? 'bg-blue-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                            >
                                                ★
                                            </button>
                                            <button
                                                onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))}
                                                className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-500 transition-all"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        {img.isPrimary && (
                                            <div className="absolute top-2 left-2 bg-blue-600 text-[8px] font-black uppercase px-2 py-1 rounded-md tracking-widest shadow-lg">Обложка</div>
                                        )}
                                    </div>
                                ))}
                                <label className="aspect-video bg-[#0f0f10] border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-600/40 hover:bg-blue-600/5 transition-all group">
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryUpload} />
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <span className="text-xl">+</span>
                                    </div>
                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Добавить</span>
                                </label>
                            </div>
                            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/[0.02]">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Совет</h4>
                                <p className="text-zinc-500 text-xs leading-relaxed">Первое загруженное изображение автоматически становится обложкой. Вы можете изменить это, нажав на иконку звезды.</p>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] block">Описание</label>
                                <textarea
                                    rows={8}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Опубликуйте историю вашего проекта..."
                                    className="w-full bg-[#0f0f10] border border-white/[0.03] p-6 rounded-2xl text-white font-medium outline-none focus:ring-4 focus:ring-blue-600/20 transition-all resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] block">ID Версии</label>
                                    <input
                                        type="text"
                                        value={formData.attributes.version}
                                        onChange={(e) => setFormData({ ...formData, attributes: { ...formData.attributes, version: e.target.value } })}
                                        className="w-full bg-[#0f0f10] border border-white/[0.03] p-6 rounded-2xl text-white font-bold outline-none focus:ring-4 focus:ring-blue-600/20 transition-all"
                                    />
                                </div>
                                {creationConfig.creationType === 'skin' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] block">Scale</label>
                                            <select
                                                value={formData.attributes.resolution}
                                                onChange={(e) => setFormData({ ...formData, attributes: { ...formData.attributes, resolution: e.target.value } })}
                                                className="w-full bg-[#0f0f10] border-none p-5 rounded-xl text-white font-bold outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="64x64">64x</option>
                                                <option value="128x128">128x</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Внешние ссылки</h3>
                                <button
                                    onClick={() => setFormData({ ...formData, links: [...formData.links, { label: '', url: '' }] })}
                                    className="bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer"
                                >
                                    + Добавить
                                </button>
                            </div>
                            <div className="space-y-4">
                                {formData.links.map((link, i) => (
                                    <div key={i} className="flex gap-4 items-center bg-[#0f0f10] p-6 rounded-2xl border border-white/[0.02] group">
                                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center grayscale group-hover:grayscale-0 transition-all overflow-hidden p-2">
                                            {link.url ? (
                                                <img src={`https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=64`} alt="" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                            ) : (
                                                <span className="text-zinc-700">🔗</span>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            value={link.label}
                                            onChange={(e) => {
                                                const next = [...formData.links];
                                                next[i].label = e.target.value;
                                                setFormData({ ...formData, links: next });
                                            }}
                                            placeholder="Label"
                                            className="bg-transparent border-none text-white font-black uppercase text-[10px] tracking-widest outline-none w-24"
                                        />
                                        <input
                                            type="text"
                                            value={link.url}
                                            onChange={(e) => {
                                                const next = [...formData.links];
                                                next[i].url = e.target.value;
                                                setFormData({ ...formData, links: next });
                                            }}
                                            placeholder="https://..."
                                            className="flex-grow bg-white/5 border-none p-4 rounded-xl text-white font-medium text-xs outline-none"
                                        />
                                        <button
                                            onClick={() => setFormData({ ...formData, links: formData.links.filter((_, idx) => idx !== i) })}
                                            className="text-zinc-800 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer p-2"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <label
                                htmlFor="file-upload"
                                className="border-2 border-dashed border-white/5 rounded-3xl p-24 flex flex-col items-center justify-center text-center group hover:border-blue-600/40 hover:bg-blue-600/5 transition-all cursor-pointer"
                            >
                                <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-600/20 transition-all">
                                    <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                </div>
                                <h3 className="text-2xl font-black uppercase mb-3 tracking-tight">
                                    {file ? file.name : 'Главный файл проекта'}
                                </h3>
                                <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">
                                    {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Drag & drop ZIP, JAR, RAR или нажмите для выбора'}
                                </p>
                            </label>

                            {(creationConfig as any).file_schema && Array.isArray((creationConfig as any).file_schema) && (
                                <>
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Метаданные файла</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {(creationConfig as any).file_schema.map((field: { key: string; label: string; type: string; options?: string[]; required?: boolean }) => (
                                            <div key={field.key} className="space-y-2">
                                                <label className="block text-[10px] font-black text-white/80 uppercase tracking-widest">{field.label}{field.required ? ' *' : ''}</label>
                                                {field.type === 'select' && field.options ? (
                                                    <select
                                                        value={fileAttributes[field.key] || ''}
                                                        onChange={(e) => setFileAttributes(a => ({ ...a, [field.key]: e.target.value }))}
                                                        className="w-full bg-[#0f0f10] border border-white/[0.03] p-4 rounded-xl text-white font-bold outline-none cursor-pointer"
                                                    >
                                                        <option value="">—</option>
                                                        {field.options.map((opt: string) => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={fileAttributes[field.key] || ''}
                                                        onChange={(e) => setFileAttributes(a => ({ ...a, [field.key]: e.target.value }))}
                                                        placeholder={field.label}
                                                        required={field.required}
                                                        className="w-full bg-[#0f0f10] border border-white/[0.03] p-4 rounded-xl text-white font-bold outline-none placeholder:text-zinc-600"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {(file || Object.keys(fileAttributes).some(k => fileAttributes[k])) && (
                                        <div className="bg-[#1a1b23] rounded-2xl overflow-hidden border border-white/5">
                                            <div className="px-6 py-4 bg-[#0f0f10] text-[10px] font-black text-white/70 uppercase tracking-widest">Файл к загрузке</div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="border-b border-white/10">
                                                            <th className="px-6 py-3 text-[10px] font-black text-white/70 uppercase">Файл</th>
                                                            {(creationConfig as any).file_schema.map((f: { key: string; label: string }) => (
                                                                <th key={f.key} className="px-6 py-3 text-[10px] font-black text-white/70 uppercase">{f.label}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="border-b border-white/5">
                                                            <td className="px-6 py-3 text-white font-bold">{file?.name || '—'}</td>
                                                            {(creationConfig as any).file_schema.map((f: { key: string }) => (
                                                                <td key={f.key} className="px-6 py-3 text-white/80">{fileAttributes[f.key] || '—'}</td>
                                                            ))}
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="bg-zinc-900/50 p-8 rounded-[24px] border border-white/[0.02]">
                                <div className="flex gap-4">
                                    <div className="w-6 h-6 bg-blue-600/20 rounded flex items-center justify-center shrink-0">
                                        <span className="text-blue-500 text-xs font-black">!</span>
                                    </div>
                                    <p className="text-zinc-500 text-[13px] leading-relaxed m-0">
                                        Убедитесь, что ваш файл не содержит вредоносного ПО и соответствует <span className="text-white underline cursor-pointer">нашим стандартам качества</span>. Публикация нарушающего контента приведет к блокировке.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-16 flex items-center justify-between border-t border-white/5 pt-12">
                        {step > 1 && (
                            <button onClick={prevStep} className="px-10 py-5 text-zinc-600 font-black uppercase tracking-widest text-[10px] border-none bg-transparent cursor-pointer hover:text-white transition-colors group">
                                <span className="mr-2 group-hover:mr-4 transition-all">←</span> Назад
                            </button>
                        )}
                        <div className="ml-auto flex items-center gap-4">
                            {step === 5 ? (
                                <>
                                    <button
                                        onClick={handleSaveDraft}
                                        disabled={loading}
                                        className="px-10 py-5 text-zinc-300 font-black uppercase tracking-widest text-[10px] border border-white/20 rounded-[20px] cursor-pointer hover:bg-white/5 hover:text-white transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Сохранение...' : 'Сохранить черновик'}
                                    </button>
                                    <button
                                        onClick={handlePublish}
                                        disabled={loading}
                                        className="bg-white text-black font-black px-16 py-6 rounded-[20px] transition-all uppercase tracking-[0.2em] text-[11px] border-none cursor-pointer active:scale-95 shadow-2xl hover:shadow-white/10 disabled:opacity-50"
                                    >
                                        {loading ? 'Публикация...' : 'Опубликовать'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={nextStep}
                                    className="bg-white text-black font-black px-16 py-6 rounded-[20px] transition-all uppercase tracking-[0.2em] text-[11px] border-none cursor-pointer active:scale-95 shadow-2xl hover:shadow-white/10"
                                >
                                    Продолжить
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default CreateProjectPage;
