import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Skeleton from '../UI/Skeleton';

interface ProfileHeaderProps {
    profileData: any;
    loading: boolean;
    isOwnProfile: boolean;
    myModsCount: number;
    bannerInputRef: React.RefObject<HTMLInputElement>;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => void;
    editingBio: boolean;
    localBio: string;
    setLocalBio: (val: string) => void;
    handleSaveBio: () => void;
    setEditingBio: (val: boolean) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    profileData,
    loading,
    isOwnProfile,
    myModsCount,
    bannerInputRef,
    fileInputRef,
    handleFileSelect,
    editingBio,
    localBio,
    setLocalBio,
    handleSaveBio,
    setEditingBio
}) => {
    return (
        <div className="bg-[#24262b] rounded-2xl overflow-hidden shadow-2xl mb-12 relative">
            <div
                onClick={() => isOwnProfile && bannerInputRef.current?.click()}
                className={`h-80 relative overflow-hidden bg-[#16161a] ${isOwnProfile ? 'cursor-pointer group' : ''}`}
            >
                <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'banner')} />
                {profileData?.banner_url ? (
                    <img src={profileData.banner_url} className="w-full h-full object-cover" alt="" />
                ) : loading ? (
                    <Skeleton className="w-full h-full opacity-30" />
                ) : (
                    <div className="absolute inset-0 bg-[#0a0a0c]"></div>
                )}
                {isOwnProfile && profileData && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-white/10 px-6 py-3 rounded-xl border border-white/10 text-[11px] font-black uppercase tracking-widest">Изменить баннер</span>
                    </div>
                )}
            </div>
            <div className="px-12 pb-12 pt-4 relative">
                <div className="absolute -top-24 left-12 group shrink-0 z-10 w-48 h-48">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'avatar')} />
                    <div
                        onClick={() => isOwnProfile && fileInputRef.current?.click()}
                        className={`w-48 h-48 rounded-full border-[10px] border-[#24262b] overflow-hidden bg-[#1a1b23] shadow-2xl transition-all ${isOwnProfile ? 'cursor-pointer hover:brightness-110' : ''}`}
                    >
                        {profileData?.avatar_url ? (
                            <img src={profileData.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : loading ? (
                            <Skeleton className="w-full h-full" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-800">
                                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 md:pl-[220px] mb-12 mt-4 relative z-0">
                    <div className="flex-grow">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-5">
                                    {profileData ? (
                                        <h1 className="text-3xl font-black tracking-tight uppercase leading-none text-white m-0">{profileData.display_name || profileData.username}</h1>
                                    ) : (
                                        <Skeleton className="w-64 h-8" />
                                    )}
                                    <span className={`text-[10px] font-black px-3 py-1.5 rounded tracking-[0.2em] self-center ${myModsCount >= 1 ? 'bg-blue-500 text-white' : 'bg-white/5 text-zinc-500 border border-white/5'}`}>
                                        {myModsCount >= 1 ? 'АВТОР' : 'ИГРОК'}
                                    </span>
                                </div>
                                {loading ? (
                                    <Skeleton className="w-full max-w-md h-4" />
                                ) : editingBio ? (
                                    <div className="flex flex-col gap-2 max-w-xl">
                                        <div className="relative">
                                            <textarea
                                                value={localBio}
                                                onChange={(e) => {
                                                    if (e.target.value.length <= 150) {
                                                        setLocalBio(e.target.value);
                                                    }
                                                }}
                                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveBio(); } }}
                                                className="bg-[#24262b] border border-white/10 rounded-xl px-4 py-3 text-[15px] text-white font-medium resize-none h-[120px] w-full outline-none focus:border-white/20"
                                                placeholder="О себе (макс. 150 символов)"
                                                autoFocus
                                            />
                                            <div className={`absolute bottom-3 right-4 text-[11px] font-bold tracking-widest ${localBio.length >= 150 ? 'text-red-500' : 'text-zinc-600'}`}>
                                                {localBio.length}/150
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={handleSaveBio} className="px-5 py-2.5 bg-blue-600 text-white text-[12px] font-black uppercase tracking-widest rounded-xl border-none cursor-pointer hover:bg-blue-500 transition-colors">Сохранить</button>
                                            <button type="button" onClick={() => { setEditingBio(false); setLocalBio(profileData?.bio || ''); }} className="px-5 py-2.5 bg-white/10 text-zinc-400 text-[12px] font-black uppercase tracking-widest rounded-xl border-none cursor-pointer hover:bg-white/20 transition-colors">Отмена</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-2 w-full max-w-2xl">
                                        {profileData?.bio ? <p className="text-zinc-500 text-[15px] font-medium leading-relaxed m-0 break-words whitespace-pre-wrap w-[90%] max-w-2xl">{profileData.bio}</p> : <p className="text-zinc-600 text-[15px] font-medium m-0 w-full">Нет описания</p>}
                                        {isOwnProfile && (
                                            <button type="button" onClick={() => { setLocalBio(profileData?.bio || ''); setEditingBio(true); }} className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 border-none cursor-pointer transition-all" aria-label="Редактировать"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 shrink-0">
                                {isOwnProfile && (
                                    <>
                                        <ReactRouterDOM.Link to="/create-project" className="w-12 h-12 flex items-center justify-center bg-white text-black hover:bg-zinc-200 rounded-xl border-none cursor-pointer shadow-xl no-underline transition-all active:scale-95" title="Создать проект"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg></ReactRouterDOM.Link>
                                        <ReactRouterDOM.Link to="/settings" className="w-12 h-12 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl border-none cursor-pointer transition-all shadow-xl no-underline active:scale-95" title="Настройки системы"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></ReactRouterDOM.Link>
                                    </>
                                )}
                                {/* 
                  Hide "Follow" and "Message" buttons as requested: 
                  "Скрыть/удалить кнопку 'Подписаться' в профиле и на карточках пользователей."
                  "Скрыть/удалить UI элементы личных сообщений (P2P)."
                */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
