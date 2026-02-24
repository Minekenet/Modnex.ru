
import React, { useState, useMemo, useEffect } from 'react';
import { projectsService } from '../api/projects';
import { gamesService } from '../api/games';
import { filesService } from '../api/files';
import { Game } from '../types';
import * as ReactRouterDOM from 'react-router-dom';

import { useAuthStore } from '../stores/authStore';
import { generateSlug } from '../utils/slug';

import { StepBasics } from '../components/CreateProject/StepBasics';
import { StepMedia } from '../components/CreateProject/StepMedia';
import { StepDescription } from '../components/CreateProject/StepDescription';
import { StepLinks } from '../components/CreateProject/StepLinks';
import { StepFiles } from '../components/CreateProject/StepFiles';

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
    const [sectionsForGame, setSectionsForGame] = useState<{ slug: string; name: string; ui_config?: any; filter_config?: any }[]>([]);
    const [gameDetails, setGameDetails] = useState<Game & { sections?: any[] } | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [fileAttributes, setFileAttributes] = useState<Record<string, string>>({ version_number: '1.0.0' });
    const [gallery, setGallery] = useState<{ file: File; preview: string; isPrimary: boolean }[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        gameSlug: '',
        sectionSlug: '',
        summary: '',
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

    const currentSection = useMemo(() => {
        return sectionsForGame.find(s => s.slug === formData.sectionSlug);
    }, [sectionsForGame, formData.sectionSlug]);

    const creationConfig = useMemo(() => {
        if (!currentSection) return { creationType: 'standard' };
        if (currentSection.ui_config) {
            const ui = typeof currentSection.ui_config === 'string' ? JSON.parse(currentSection.ui_config) : currentSection.ui_config;
            return ui;
        }
        return { creationType: 'standard' };
    }, [currentSection]);

    const dynamicFilters = useMemo(() => {
        if (!currentSection?.filter_config) return [];
        return typeof currentSection.filter_config === 'string' ? JSON.parse(currentSection.filter_config) : currentSection.filter_config;
    }, [currentSection]);

    const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newImages = files.map((f: any) => ({
            file: f,
            preview: URL.createObjectURL(f),
            isPrimary: gallery.length === 0 && files.indexOf(f) === 0
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

        if (!formData.title || formData.title.length < 3) {
            return alert('Название проекта должно быть не менее 3 символов');
        }
        if (!formData.description || formData.description.length < 10) {
            return alert('Описание проекта должно быть не менее 10 символов');
        }
        if (!isDraft && !file) {
            return alert('Для публикации необходимо выбрать файл проекта');
        }

        try {
            setLoading(true);
            const slug = generateSlug(formData.title);

            if (!slug || slug.length < 3) {
                setLoading(false);
                return alert('Название слишком короткое или содержит недопустимые символы.');
            }

            const formattedLinks = formData.links
                .filter(link => link.label.trim() && link.url.trim())
                .map(link => {
                    let url = link.url.trim();
                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        url = 'https://' + url;
                    }
                    return { label: link.label.trim(), url };
                });

            const project = await projectsService.create(formData.gameSlug, formData.sectionSlug, {
                title: formData.title.trim(),
                slug: slug,
                summary: formData.summary || formData.description.slice(0, 100),
                description: formData.description,
                attributes: formData.attributes,
                links: formattedLinks,
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

    return (
        <div className="min-h-screen bg-[#1c1c1f] text-white py-24 px-8 font-['Inter',_sans-serif]">
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

                <div className="space-y-16 relative">
                    {step === 1 && (
                        <StepBasics
                            title={formData.title}
                            setTitle={(v) => setFormData({ ...formData, title: v })}
                            gameSlug={formData.gameSlug}
                            setGameSlug={(v) => setFormData({ ...formData, gameSlug: v, sectionSlug: '' })}
                            sectionSlug={formData.sectionSlug}
                            setSectionSlug={(v) => setFormData({ ...formData, sectionSlug: v })}
                            games={games}
                            sections={sectionsForGame}
                        />
                    )}

                    {step === 2 && (
                        <StepMedia
                            gallery={gallery}
                            setGallery={setGallery}
                            handleGalleryUpload={handleGalleryUpload}
                        />
                    )}

                    {step === 3 && (
                        <StepDescription
                            summary={formData.summary}
                            setSummary={(v) => setFormData({ ...formData, summary: v })}
                            description={formData.description}
                            setDescription={(v) => setFormData({ ...formData, description: v })}
                            attributes={formData.attributes}
                            setAttributes={(v) => setFormData({ ...formData, attributes: v })}
                            dynamicFilters={dynamicFilters}
                        />
                    )}

                    {step === 4 && (
                        <StepLinks
                            links={formData.links}
                            setLinks={(v) => setFormData({ ...formData, links: v })}
                        />
                    )}

                    {step === 5 && (
                        <StepFiles
                            file={file}
                            setFile={setFile}
                            fileAttributes={fileAttributes}
                            setFileAttributes={setFileAttributes}
                            creationConfig={creationConfig}
                        />
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
                                        onClick={() => submitWithStatus('draft')}
                                        disabled={loading}
                                        className="px-10 py-5 text-zinc-300 font-black uppercase tracking-widest text-[10px] border border-white/20 rounded-[20px] cursor-pointer hover:bg-white/5 hover:text-white transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Сохранение...' : 'Сохранить черновик'}
                                    </button>
                                    <button
                                        onClick={() => submitWithStatus('published')}
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
