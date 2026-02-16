
import React, { useState, useMemo, useEffect } from 'react';
import { projectsService } from '../api/projects';
import { gamesService } from '../api/games';
import { filesService } from '../api/files';
import { Game } from '../types';
import * as ReactRouterDOM from 'react-router-dom';

const CreateProjectPage: React.FC = () => {
    const navigate = ReactRouterDOM.useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [games, setGames] = useState<Game[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        gameSlug: '',
        sectionSlug: '',
        description: '',
        attributes: {
            version: '1.0.0',
        } as Record<string, any>
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

    const selectedGame = useMemo(() =>
        games.find(g => g.slug === formData.gameSlug),
        [formData.gameSlug, games]);

    const categories = useMemo(() =>
        (selectedGame as any)?.sections?.map((s: any) => s.name) || [],
        [selectedGame]);

    const creationConfig = useMemo(() => {
        if (!selectedGame || !formData.sectionSlug) return { creationType: 'standard' };

        const viewConfig = typeof selectedGame.view_config === 'string' ? JSON.parse(selectedGame.view_config) : (selectedGame.view_config || {});
        const gameSections = viewConfig.sections || {};

        return gameSections[formData.sectionSlug] || viewConfig.defaultConfig || { creationType: 'standard' };
    }, [selectedGame, formData.sectionSlug]);

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        if (!file) {
            alert('Пожалуйста, выберите файл для загрузки');
            return;
        }
        try {
            setLoading(true);
            // 1. Create project
            const project = await projectsService.create(formData.gameSlug, formData.sectionSlug, {
                title: formData.title,
                slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
                summary: formData.description.slice(0, 100),
                description: formData.description,
                attributes: formData.attributes
            });

            // 2. Upload file
            await filesService.uploadVersion(
                project.id,
                formData.attributes.version || '1.0.0',
                file,
                'Initial release'
            );

            alert('Проект успешно создан и файл загружен!');
            navigate(`/game/${formData.gameSlug}`);
        } catch (err) {
            console.error(err);
            alert('Ошибка при создании проекта');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f10] text-white py-24 px-8 font-['Inter',_sans-serif]">
            <div className="max-w-4xl mx-auto">
                <header className="mb-16">
                    <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-6">Создать проект</h1>
                    <div className="flex items-center gap-6">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-2 ${step === s ? 'bg-blue-600 border-blue-600 text-white' :
                                    step > s ? 'bg-green-500 border-green-500 text-white' : 'border-zinc-800 text-zinc-700'
                                    }`}>
                                    {step > s ? '✓' : s}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${step === s ? 'text-white' : 'text-zinc-600'}`}>
                                    {s === 1 ? 'Основы' : s === 2 ? 'Описание' : 'Файлы'}
                                </span>
                            </div>
                        ))}
                    </div>
                </header>

                <div className="bg-[#1a1b23] rounded-3xl p-12 border border-white/5 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>

                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">Название проекта</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Напр: Ultra Realism Pack"
                                    className="w-full bg-[#0f0f10] border-none p-5 rounded-xl text-white font-bold outline-none focus:ring-2 focus:ring-blue-600/30 transition-all placeholder:text-zinc-800"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">Целевая игра</label>
                                    <select
                                        value={formData.gameSlug}
                                        onChange={(e) => setFormData({ ...formData, gameSlug: e.target.value, sectionSlug: '' })}
                                        className="w-full bg-[#0f0f10] border-none p-5 rounded-xl text-white font-bold outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">Выберите игру...</option>
                                        {games.map(g => (
                                            <option key={g.slug} value={g.slug}>{g.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={`space-y-4 transition-all duration-500 ${formData.gameSlug ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">Раздел</label>
                                    <select
                                        value={formData.sectionSlug}
                                        onChange={(e) => setFormData({ ...formData, sectionSlug: e.target.value })}
                                        className="w-full bg-[#0f0f10] border-none p-5 rounded-xl text-white font-bold outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">Выберите раздел...</option>
                                        {(selectedGame as any)?.sections?.map((s: any) => (
                                            <option key={s.slug} value={s.slug}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">Описание (Markdown)</label>
                                <textarea
                                    rows={6}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Расскажите о своем моде..."
                                    className="w-full bg-[#0f0f10] border-none p-5 rounded-xl text-white font-medium outline-none focus:ring-2 focus:ring-blue-600/30 transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">Версия</label>
                                    <input
                                        type="text"
                                        value={formData.attributes.version || ''}
                                        onChange={(e) => setFormData({ ...formData, attributes: { ...formData.attributes, version: e.target.value } })}
                                        placeholder="Напр: 1.0.0"
                                        className="w-full bg-[#0f0f10] border-none p-5 rounded-xl text-white font-bold outline-none placeholder:text-zinc-800"
                                    />
                                </div>

                                {creationConfig.creationType === 'skin' && (
                                    <>
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">Разрешение</label>
                                            <select
                                                value={formData.attributes.resolution || ''}
                                                onChange={(e) => setFormData({ ...formData, attributes: { ...formData.attributes, resolution: e.target.value } })}
                                                className="w-full bg-[#0f0f10] border-none p-5 rounded-xl text-white font-bold outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="">Выберите...</option>
                                                <option value="64x64">64x64 (Standard)</option>
                                                <option value="128x128">128x128 (HD)</option>
                                                <option value="256x256">256x256 (Ultra HD)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">Модель</label>
                                            <select
                                                value={formData.attributes.model || ''}
                                                onChange={(e) => setFormData({ ...formData, attributes: { ...formData.attributes, model: e.target.value } })}
                                                className="w-full bg-[#0f0f10] border-none p-5 rounded-xl text-white font-bold outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="">Выберите...</option>
                                                <option value="Alex">Alex (Slim)</option>
                                                <option value="Steve">Steve (Classic)</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <label
                                htmlFor="file-upload"
                                className="border-2 border-dashed border-zinc-800 rounded-3xl p-16 flex flex-col items-center justify-center text-center group hover:border-blue-600/40 transition-colors cursor-pointer"
                            >
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                </div>
                                <h3 className="text-xl font-black uppercase mb-2">
                                    {file ? file.name : 'Выберите архив или перетащите сюда'}
                                </h3>
                                <p className="text-zinc-500 font-bold uppercase text-[11px] tracking-widest">
                                    {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'ZIP, RAR, JAR (Макс. 500MB)'}
                                </p>
                            </label>
                            <div className="bg-blue-600/5 border border-blue-600/10 p-6 rounded-2xl">
                                <p className="text-zinc-400 text-[13px] font-medium leading-relaxed">Нажимая кнопку "Завершить", вы подтверждаете согласие с <span className="text-blue-500 font-bold">Правилами публикации</span> и гарантируете авторство загружаемого контента.</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-12 flex items-center justify-between">
                        {step > 1 && (
                            <button onClick={prevStep} className="px-8 py-4 text-zinc-500 font-black uppercase tracking-widest text-[11px] border-none bg-transparent cursor-pointer hover:text-white transition-colors">Назад</button>
                        )}
                        <button
                            onClick={step === 3 ? handleSubmit : nextStep}
                            disabled={loading}
                            className={`ml-auto bg-blue-600 hover:bg-blue-500 text-white font-black px-12 py-5 rounded-2xl transition-all uppercase tracking-widest text-xs border-none cursor-pointer active:scale-95 shadow-xl ${loading ? 'opacity-50' : ''}`}
                        >
                            {loading ? 'Создание...' : step === 3 ? 'Завершить' : 'Продолжить'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateProjectPage;
