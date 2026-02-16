
import React from 'react';
import SidebarCreators from './SidebarCreators';
import SidebarLinks from './SidebarLinks';
import SidebarDetails from './SidebarDetails';
import FilesTab from './FilesTab';

interface SkinDetailsProps {
    modData: any;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    setSelectedImageIndex: (index: number) => void;
    isOwner: boolean;
    tabs: string[];
}

export const SkinDetails: React.FC<SkinDetailsProps> = ({
    modData,
    activeTab,
    setActiveTab,
    setSelectedImageIndex,
    isOwner,
    tabs
}) => {
    return (
        <div className="max-w-[1300px] mx-auto px-8 mt-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-8 space-y-12">
                    {/* Visual Gallery for Skins - Hero sized */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {modData.gallery.slice(0, 2).map((img: string, idx: number) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedImageIndex(idx)}
                                className="aspect-[3/4] rounded-3xl bg-[#24262b] overflow-hidden cursor-pointer group relative shadow-2xl border border-white/5"
                            >
                                <img src={img} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" alt="Skin Preview" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-1 mb-10 bg-white/5 p-1.5 rounded-2xl w-fit">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-8 py-3.5 text-[13px] font-black uppercase tracking-widest transition-all border-none rounded-xl cursor-pointer ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'bg-transparent text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="animate-in fade-in duration-500">
                        {activeTab === 'Описание' && (
                            <div className="bg-[#24262b] p-10 rounded-3xl space-y-8 shadow-xl">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Подробности скина</h2>
                                <p className="text-lg text-zinc-400 leading-relaxed font-medium">{modData.description}</p>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 bg-white/2 rounded-2xl border border-white/5">
                                        <span className="block text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1">Разрешение</span>
                                        <span className="text-white font-bold">64x64 (Standard)</span>
                                    </div>
                                    <div className="p-6 bg-white/2 rounded-2xl border border-white/5">
                                        <span className="block text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1">Модель</span>
                                        <span className="text-white font-bold">Slim / Classic</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'Версии' && (
                            <FilesTab
                                availableVersions={modData.versions}
                                availableLoaders={modData.loaders}
                                files={modData.files}
                            />
                        )}
                        {activeTab === 'Галерея' && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {modData.gallery.map((img: string, idx: number) => (
                                    <div key={idx} onClick={() => setSelectedImageIndex(idx)} className="aspect-square rounded-2xl overflow-hidden cursor-pointer border border-white/5 bg-[#24262b]">
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-10">
                    <SidebarDetails
                        attributes={modData.attributes}
                        stats={modData.stats}
                        createdAt={modData.created_at}
                        updatedAt={modData.updated_at}
                    />
                    <SidebarCreators authorName={modData.author_name} />
                    <SidebarLinks />
                </div>
            </div>
        </div>
    );
};
