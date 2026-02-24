
import React from 'react';
import { Game } from '../../types';

interface StepBasicsProps {
    title: string;
    setTitle: (val: string) => void;
    gameSlug: string;
    setGameSlug: (val: string) => void;
    sectionSlug: string;
    setSectionSlug: (val: string) => void;
    games: Game[];
    sections: { slug: string; name: string }[];
}

export const StepBasics: React.FC<StepBasicsProps> = ({
    title, setTitle, gameSlug, setGameSlug, sectionSlug, setSectionSlug, games, sections
}) => {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] block">Название шедевра</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Напр: Minecraft HD Textures"
                    className="w-full bg-[#161617] border-none p-6 rounded-2xl text-white font-bold text-lg outline-none focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-zinc-800"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] block">Игра</label>
                    <div className="relative">
                        <select
                            value={gameSlug}
                            onChange={(e) => setGameSlug(e.target.value)}
                            className="w-full bg-[#161617] border-none p-6 rounded-2xl text-white font-bold outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-blue-600/10 transition-all"
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
                <div className={`space-y-4 transition-all duration-700 ${gameSlug ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] block">Раздел каталога</label>
                    <div className="relative">
                        <select
                            value={sectionSlug}
                            onChange={(e) => setSectionSlug(e.target.value)}
                            className="w-full bg-[#161617] border-none p-6 rounded-2xl text-white font-bold outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-blue-600/10 transition-all"
                        >
                            <option value="">Выберите раздел...</option>
                            {sections.map((s) => (
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
    );
};
