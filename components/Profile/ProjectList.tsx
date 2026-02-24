import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Skeleton from '../UI/Skeleton';
import { GridCard } from '../Catalog/StandardCards';
import { SkinCard } from '../Catalog/SkinCard';

interface ProjectListProps {
    loading: boolean;
    myMods: any[];
    paginatedList: any[];
    profileData: any;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    totalPages: number;
}

const ProjectList: React.FC<ProjectListProps> = ({
    loading,
    myMods,
    paginatedList,
    profileData,
    currentPage,
    setCurrentPage,
    totalPages
}) => {
    const Pagination = () => {
        if (totalPages <= 1) return null;
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        return (
            <div className="mt-12 py-8 flex items-center justify-center gap-6 border-t border-white/5">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className="text-zinc-600 hover:text-white transition-colors bg-transparent border-none cursor-pointer disabled:opacity-20"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex items-center gap-5">
                    {pages.map(n => (
                        <button
                            key={n}
                            onClick={() => setCurrentPage(n)}
                            className={`text-[15px] font-black border-none bg-transparent cursor-pointer transition-all ${currentPage === n ? 'text-white underline underline-offset-8' : 'text-zinc-600 hover:text-white'}`}
                        >
                            {n}
                        </button>
                    ))}
                </div>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className="text-zinc-600 hover:text-white transition-colors bg-transparent border-none cursor-pointer disabled:opacity-20"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-[#24262b] p-5 rounded-xl flex items-center gap-6">
                        <Skeleton className="w-24 h-24 rounded-lg" />
                        <div className="flex-grow space-y-3">
                            <Skeleton className="w-20 h-3" />
                            <Skeleton className="w-48 h-5" />
                            <Skeleton className="w-32 h-3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {myMods.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedList.map((item: any) => {
                        const mod = { ...item, author_name: profileData?.display_name || profileData?.username };
                        const isSkin = String(item.section_slug || '').toLowerCase().includes('skin');
                        const to = `/game/${item.game_slug}/${item.section_slug}/${item.slug}`;
                        return (
                            <ReactRouterDOM.Link to={to} key={item.id} className="block no-underline">
                                {isSkin ? (
                                    <SkinCard mod={mod} onClick={() => { }} />
                                ) : (
                                    <GridCard mod={mod} gameSlug={item.game_slug} onClick={() => { }} />
                                )}
                            </ReactRouterDOM.Link>
                        );
                    })}
                </div>
            ) : (
                <div className="py-24 flex flex-col items-center justify-center bg-[#24262b] rounded-3xl border border-dashed border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.02] to-transparent pointer-events-none"></div>
                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                        <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-white font-black uppercase tracking-tight text-xl mb-2">Проектов пока нет</h3>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-10 max-w-[200px] text-center leading-loose opacity-60">Ваш список проектов пуст. Самое время это исправить!</p>

                    <ReactRouterDOM.Link
                        to="/create-project"
                        className="flex items-center gap-4 px-10 py-5 bg-white text-black font-black text-[12px] uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all border-none shadow-2xl active:scale-95 cursor-pointer rounded-2xl no-underline"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Добавить проект
                    </ReactRouterDOM.Link>
                </div>
            )}
            <Pagination />
        </div>
    );
};

export default ProjectList;
