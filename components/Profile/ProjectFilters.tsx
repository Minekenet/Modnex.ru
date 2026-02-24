import React from 'react';

interface ProjectFiltersProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    filterGame: string;
    setFilterGame: (val: string) => void;
    filterCategory: string;
    setFilterCategory: (val: string) => void;
    uniqueGames: string[];
    uniqueCategories: string[];
    activeTab: string;
    myModsLength: number;
    setCurrentPage: (page: number) => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
    searchQuery,
    setSearchQuery,
    filterGame,
    setFilterGame,
    filterCategory,
    setFilterCategory,
    uniqueGames,
    uniqueCategories,
    activeTab,
    myModsLength,
    setCurrentPage
}) => {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-8 flex-wrap">
            <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="flex-grow min-w-[200px] bg-[#24262b] border-none py-4 px-6 rounded-xl text-sm font-bold text-white outline-none focus:bg-[#2a2c33] transition-all"
            />
            {activeTab === 'Мои проекты' && myModsLength > 0 && (
                <>
                    <select
                        value={filterGame}
                        onChange={(e) => { setFilterGame(e.target.value); setFilterCategory(''); setCurrentPage(1); }}
                        className="bg-[#24262b] border-none py-4 px-5 rounded-xl text-sm font-bold text-white outline-none focus:bg-[#2a2c33] cursor-pointer"
                    >
                        <option value="">Все игры</option>
                        {uniqueGames.map((slug: string) => (
                            <option key={slug} value={slug}>{slug}</option>
                        ))}
                    </select>
                    <select
                        value={filterCategory}
                        onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                        className="bg-[#24262b] border-none py-4 px-5 rounded-xl text-sm font-bold text-white outline-none focus:bg-[#2a2c33] cursor-pointer"
                    >
                        <option value="">Все категории</option>
                        {uniqueCategories.map((slug: string) => (
                            <option key={slug} value={slug}>{slug}</option>
                        ))}
                    </select>
                </>
            )}
        </div>
    );
};

export default ProjectFilters;
