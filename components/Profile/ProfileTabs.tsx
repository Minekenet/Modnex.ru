import React from 'react';

interface ProfileTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOwnProfile: boolean;
    setCurrentPage: (page: number) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, setActiveTab, isOwnProfile, setCurrentPage }) => {
    const tabs = ['Мои проекты', 'Избранное', ...(isOwnProfile ? ['Черновики'] : [])];

    return (
        <div className="flex gap-10 border-b border-white/5 mb-8">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                    className={`pb-4 text-[13px] font-black uppercase tracking-widest transition-all relative border-none bg-transparent cursor-pointer ${activeTab === tab ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                >
                    {tab}
                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full"></div>}
                </button>
            ))}
        </div>
    );
};

export default ProfileTabs;
