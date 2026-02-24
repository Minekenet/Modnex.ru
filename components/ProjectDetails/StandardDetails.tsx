
import React from 'react';
import SidebarCreators from './SidebarCreators';
import SidebarLinks from './SidebarLinks';
import SidebarDetails from './SidebarDetails';
import FilesTab from './FilesTab';
import { ManageTab } from './ManageTab';

interface StandardDetailsProps {
    modData: any;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    setSelectedImageIndex: (index: number) => void;
    isOwner: boolean;
    tabs: string[];
    modId?: string;
    gameSlug?: string;
    sectionSlug?: string;
    projectSlug?: string;
    onUpdateProject?: (data: { title?: string; summary?: string; description?: string; attributes?: Record<string, any>; status?: string }) => Promise<void>;
    onUploadVersion?: (file: File, version: string, extraData?: Record<string, string>) => Promise<void>;
    onReload?: () => void;
    fileSchema?: { key: string; label: string; type: string; required?: boolean; options?: { value: string; label: string }[] }[];
}

export const StandardDetails: React.FC<StandardDetailsProps> = ({
    modData,
    activeTab,
    setActiveTab,
    setSelectedImageIndex,
    isOwner,
    tabs,
    modId,
    gameSlug,
    sectionSlug,
    projectSlug,
    onUpdateProject,
    onUploadVersion,
    onReload,
    fileSchema
}) => {
    return (
        <div className="max-w-[1300px] mx-auto px-8 mt-4 grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8">
                <div className="flex gap-1 mb-10 bg-white/5 p-1.5 rounded-2xl w-fit">
                    {tabs.map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-3.5 text-[13px] font-black uppercase tracking-widest transition-all border-none rounded-xl cursor-pointer ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'bg-transparent text-zinc-500 hover:text-zinc-300'}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="animate-in fade-in duration-500">
                    {activeTab === 'Описание' && (
                        <div className="space-y-12 leading-relaxed text-zinc-300">
                            <div className="space-y-6">
                                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Обзор проекта</h2>
                                <div className="text-lg text-zinc-400 whitespace-pre-wrap">
                                    {modData.description || 'Описание отсутствует.'}
                                </div>
                            </div>

                            {/* Optional: Add decorative sections only if description is short or as extra details */}
                            {(!modData.description || modData.description.length < 100) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center opacity-50">
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Возможности</h3>
                                        <ul className="space-y-4 p-0 m-0 list-none">
                                            {['Оптимизация', 'Поддержка дополнений', 'Исправление ошибок'].map(item => (
                                                <li key={item} className="flex items-start gap-4 text-[15px] font-semibold text-zinc-400">
                                                    <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0">
                                                        <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'Версии' && (
                        <FilesTab availableVersions={modData.versions} availableLoaders={modData.loaders} files={modData.files} />
                    )}

                    {activeTab === 'Галерея' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                            {modData.gallery.map((img: string, idx: number) => (
                                <div key={idx} onClick={() => setSelectedImageIndex(idx)} className="aspect-video rounded-2xl bg-[#24262b] overflow-hidden cursor-pointer group relative shadow-lg">
                                    <img src={img} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110" alt="" />
                                </div>
                            ))}
                        </div>
                    )}

                    {isOwner && activeTab === 'Управление' && (
                        <ManageTab
                            modData={modData}
                            gameSlug={gameSlug}
                            sectionSlug={sectionSlug}
                            projectSlug={projectSlug}
                            fileSchema={fileSchema}
                            onUpdateProject={onUpdateProject}
                            onUploadVersion={onUploadVersion}
                            onReload={onReload}
                        />
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
                <SidebarCreators authorName={modData.author_name} authorAvatar={modData.author_avatar} />
                {modData.links && modData.links.length > 0 && <SidebarLinks links={modData.links} />}
            </div>
        </div>
    );
};
