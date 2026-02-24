import React from 'react';

interface ProfileSettingsModalProps {
    isSettingsOpen: boolean;
    setIsSettingsOpen: (val: boolean) => void;
    profileData: any;
    setProfileData: (data: any) => void;
    handleApplySettings: (e: React.FormEvent) => void;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
    isSettingsOpen,
    setIsSettingsOpen,
    profileData,
    setProfileData,
    handleApplySettings
}) => {
    if (!isSettingsOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/90" onClick={() => setIsSettingsOpen(false)}></div>
            <div className="relative bg-[#24262b] w-full max-w-xl rounded-xl overflow-hidden shadow-2xl p-10 border border-white/5">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Настройки</h2>
                    <button onClick={() => setIsSettingsOpen(false)} className="text-zinc-600 hover:text-white bg-transparent border-none cursor-pointer p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form className="space-y-6" onSubmit={handleApplySettings}>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Отображаемое имя</label>
                        <input
                            type="text"
                            value={profileData.display_name || ''}
                            onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                            className="w-full bg-[#1a1b23] border-none p-4 rounded-xl text-white font-bold outline-none"
                            placeholder={profileData.username}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">О себе</label>
                        <div className="relative">
                            <textarea
                                rows={3}
                                value={profileData.bio || ''}
                                onChange={(e) => {
                                    if (e.target.value.length <= 150) {
                                        setProfileData({ ...profileData, bio: e.target.value });
                                    }
                                }}
                                className="w-full bg-[#1a1b23] border-none p-4 rounded-xl text-white font-medium outline-none resize-none"
                                placeholder="Расскажите о себе (макс. 150 символов)"
                            />
                            <div className={`text-right text-[10px] font-bold mt-1 ${profileData.bio?.length >= 150 ? 'text-red-500' : 'text-zinc-600'}`}>
                                {profileData.bio?.length || 0}/150
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Ссылки и Соцсети</label>
                            <button
                                type="button"
                                onClick={() => setProfileData({ ...profileData, links: [...(profileData.links || []), { label: '', url: '' }] })}
                                className="text-blue-500 hover:text-blue-400 text-[10px] font-black uppercase tracking-widest bg-transparent border-none cursor-pointer"
                            >
                                + Добавить
                            </button>
                        </div>
                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {(profileData.links || []).map((link: any, i: number) => (
                                <div key={i} className="flex gap-2 items-start bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                    <div className="flex-grow space-y-2">
                                        <input
                                            type="text"
                                            value={link.label}
                                            onChange={(e) => {
                                                const newLinks = [...profileData.links];
                                                newLinks[i].label = e.target.value;
                                                setProfileData({ ...profileData, links: newLinks });
                                            }}
                                            placeholder="Название (напр. VK)"
                                            className="w-full bg-[#1a1b23] border-none p-3 rounded-lg text-white font-bold text-xs outline-none"
                                        />
                                        <input
                                            type="text"
                                            value={link.url}
                                            onChange={(e) => {
                                                const newLinks = [...profileData.links];
                                                newLinks[i].url = e.target.value;
                                                setProfileData({ ...profileData, links: newLinks });
                                            }}
                                            placeholder="URL"
                                            className="w-full bg-[#1a1b23] border-none p-3 rounded-lg text-white font-medium text-xs outline-none"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newLinks = profileData.links.filter((_: any, idx: number) => idx !== i);
                                            setProfileData({ ...profileData, links: newLinks });
                                        }}
                                        className="p-3 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 border-none cursor-pointer group transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-white text-black font-black py-5 rounded-2xl uppercase tracking-widest text-[11px] border-none cursor-pointer hover:bg-zinc-200 transition-all shadow-xl active:scale-95">Сохранить изменения</button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettingsModal;
