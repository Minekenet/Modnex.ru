
import React from 'react';

interface StepLinksProps {
    links: { label: string; url: string }[];
    setLinks: (val: { label: string; url: string }[]) => void;
}

export const StepLinks: React.FC<StepLinksProps> = ({ links, setLinks }) => {
    const addLink = () => {
        if (links.length < 10) {
            setLinks([...links, { label: '', url: '' }]);
        }
    };

    const removeLink = (i: number) => {
        setLinks(links.filter((_, idx) => idx !== i));
    };

    const updateLink = (i: number, field: 'label' | 'url', val: string) => {
        const next = [...links];
        next[i][field] = val;
        setLinks(next);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Внешние ссылки</h3>
                <button
                    onClick={addLink}
                    disabled={links.length >= 10}
                    className="bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    + Добавить (макс 10)
                </button>
            </div>
            <div className="space-y-4">
                {links.map((link, i) => (
                    <div key={i} className="flex gap-4 items-center bg-[#161617] p-6 rounded-2xl group transition-all hover:bg-zinc-900/60">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center transition-all overflow-hidden p-2 group-hover:bg-white/10 border border-white/5">
                            {(() => {
                                try {
                                    const url = link.url.trim();
                                    if (url && !url.includes('localhost') && !url.includes('127.0.0.1')) {
                                        const domain = url.includes('://') ? new URL(url).hostname : url.split('/')[0];
                                        if (domain.includes('.')) {
                                            return (
                                                <img
                                                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                                                    alt=""
                                                    className="w-6 h-6 object-contain"
                                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                                />
                                            );
                                        }
                                    }
                                } catch (e) { }
                                return <span className="text-zinc-600 text-lg">🔗</span>;
                            })()}
                        </div>
                        <input
                            type="text"
                            value={link.label}
                            onChange={(e) => updateLink(i, 'label', e.target.value)}
                            placeholder="Название ссылки"
                            className="bg-transparent border-none text-white font-bold text-xs tracking-tight outline-none w-48"
                        />
                        <input
                            type="text"
                            value={link.url}
                            onChange={(e) => updateLink(i, 'url', e.target.value)}
                            placeholder="https://..."
                            className="flex-grow bg-white/5 border-none p-4 rounded-xl text-white font-medium text-xs outline-none"
                        />
                        <button
                            onClick={() => removeLink(i)}
                            className="text-zinc-800 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer p-2"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
