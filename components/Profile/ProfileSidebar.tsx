import React from 'react';

interface ProfileSidebarProps {
    profileData: any;
    isOwnProfile: boolean;
    onRemoveLink: (index: number) => void;
    onAddLink: () => void;
    showAddLinkForm: boolean;
    setShowAddLinkForm: (val: boolean) => void;
    newLinkUrl: string;
    setNewLinkUrl: (val: string) => void;
    newLinkLabel: string;
    setNewLinkLabel: (val: string) => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
    profileData,
    isOwnProfile,
    onRemoveLink,
    onAddLink,
    showAddLinkForm,
    setShowAddLinkForm,
    newLinkUrl,
    setNewLinkUrl,
    newLinkLabel,
    setNewLinkLabel
}) => {
    return (
        <aside className="lg:col-span-4 space-y-6">
            <div className="bg-[#24262b] rounded-2xl p-8 border border-white/[0.03] shadow-xl relative overflow-hidden group/social">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover/social:bg-white/10 transition-all duration-700"></div>
                <h3 className="text-white font-black text-xl tracking-tight mb-7 flex items-center gap-3">
                    Ссылки и Соцсети
                </h3>

                <div className="flex flex-col gap-2 relative z-10">
                    {profileData?.links && profileData.links.length > 0 ? (
                        profileData.links.map((link: any, i: number) => {
                            let domain = '';
                            try { domain = new URL(link.url).hostname; } catch { domain = link.url || ''; }
                            const favicon = domain && domain !== 'localhost' && domain !== '127.0.0.1'
                                ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
                                : null;

                            return (
                                <div key={i} className="flex items-center gap-3 group/link">
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-between py-3 px-3 -mx-3 rounded-lg hover:bg-white/[0.04] transition-all no-underline group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:bg-white/20 transition-colors border border-white/10 shadow-sm">
                                                {favicon ? (
                                                    <img
                                                        src={favicon}
                                                        className="w-5 h-5 object-contain"
                                                        alt=""
                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                    />
                                                ) : (
                                                    <span className="text-[12px]">🔗</span>
                                                )}
                                            </div>
                                            <span className="text-[14px] font-bold text-white group-hover:text-blue-400 transition-colors min-w-0 truncate">
                                                {link.label || domain}
                                            </span>
                                        </div>
                                        <svg className="w-4 h-4 text-zinc-400 group-hover:text-blue-500 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                    {isOwnProfile && (
                                        <button
                                            type="button"
                                            onClick={() => onRemoveLink(i)}
                                            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-500 border border-red-500/20 cursor-pointer transition-all opacity-0 group-hover/link:opacity-100"
                                            aria-label="Удалить"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-10 flex flex-col items-center justify-center bg-white/[0.03] rounded-xl border border-dashed border-white/20 group/empty transition-all hover:bg-white/[0.05]">
                            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover/empty:scale-110 transition-transform duration-500 border border-white/10">
                                <svg className="w-7 h-7 text-zinc-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                            <p className="text-zinc-200 font-black uppercase tracking-widest text-[11px] m-0">Нет ссылок</p>
                        </div>
                    )}
                    {isOwnProfile && (
                        <div className="mt-6">
                            {showAddLinkForm ? (
                                <div className="p-5 bg-white/[0.05] rounded-xl border border-white/20 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-zinc-100 uppercase tracking-widest ml-1">Ссылка</label>
                                        <input
                                            type="url"
                                            value={newLinkUrl}
                                            onChange={(e) => setNewLinkUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full bg-[#1a1b23] border border-white/20 rounded-lg px-4 py-3 text-[14px] text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-zinc-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-zinc-100 uppercase tracking-widest ml-1">Название (необязательно)</label>
                                        <input
                                            type="text"
                                            value={newLinkLabel}
                                            onChange={(e) => setNewLinkLabel(e.target.value)}
                                            placeholder="Напр. VK, Telegram..."
                                            className="w-full bg-[#1a1b23] border border-white/20 rounded-lg px-4 py-3 text-[14px] text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-zinc-600"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={onAddLink} className="flex-1 py-3 bg-blue-600 text-white text-[12px] font-black uppercase tracking-widest rounded-lg border-none cursor-pointer hover:bg-blue-500 transition-all active:scale-95 shadow-xl shadow-blue-600/30">Добавить</button>
                                        <button type="button" onClick={() => { setShowAddLinkForm(false); setNewLinkUrl(''); setNewLinkLabel(''); }} className="px-5 py-3 bg-white/10 text-white text-[12px] font-black uppercase tracking-widest rounded-lg border-none cursor-pointer hover:bg-white/20 transition-all border border-white/10">Отмена</button>
                                    </div>
                                </div>
                            ) : (profileData?.links?.length ?? 0) < 5 && (
                                <button
                                    type="button"
                                    onClick={() => setShowAddLinkForm(true)}
                                    className="w-full flex items-center justify-center gap-4 py-4 px-4 rounded-xl border-2 border-dashed border-white/20 text-white hover:border-blue-500/50 hover:bg-blue-600/10 hover:text-blue-400 transition-all cursor-pointer group shadow-lg"
                                >
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors border border-white/20">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <span className="text-[14px] font-black uppercase tracking-widest">Добавить ссылку</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default ProfileSidebar;
