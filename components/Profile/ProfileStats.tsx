import React from 'react';
import Skeleton from '../UI/Skeleton';

interface ProfileStatsProps {
    profileData: any;
    loading: boolean;
    myModsCount: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ profileData, loading, myModsCount }) => {
    // We compute totals if myMods is available in a real app,
    // or assume they are returned in profileData.
    // For now we'll sum up what's in profileData.stats if it exists, 
    // or calculate based on the user's mods.
    // Since myMods isn't passed here directly, we rely on profileData exposing stats,
    // or we'll need to update ProfilePage to pass totalDownloads and totalLikes.

    const totalDownloads = profileData?.total_downloads ?? '0';
    const totalLikes = profileData?.total_likes ?? '0';

    const stats = [
        { label: 'Скачиваний', val: loading ? <Skeleton className="w-10 h-6" /> : totalDownloads },
        { label: 'Проекты', val: loading ? <Skeleton className="w-10 h-6" /> : myModsCount },
        { label: 'Лайки', val: loading ? <Skeleton className="w-10 h-6" /> : totalLikes },
        { label: 'Регистрация', val: profileData ? new Date(profileData.created_at).getFullYear() : <Skeleton className="w-10 h-6" /> }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-white/5">
            {stats.map((stat, i) => (
                <div key={i} className="bg-[#1a1b23] p-6 rounded-xl border border-white/[0.02]">
                    <span className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">{stat.label}</span>
                    <div className="flex items-end">
                        <span className="text-2xl font-black text-zinc-300">{stat.val}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProfileStats;
