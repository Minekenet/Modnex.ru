
import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { GAMES_DATA, DEFAULT_GAME_CONFIG } from '../constants';

interface GamePageProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

type ViewMode = 'grid' | 'compact' | 'list';

import { gamesService } from '../api/games';

const GamePage: React.FC<GamePageProps> = ({ favorites, onToggleFavorite }) => {
  const { gameSlug, categorySlug } = ReactRouterDOM.useParams();
  const navigate = ReactRouterDOM.useNavigate();

  const [game, setGame] = useState<any>(() => {
    return GAMES_DATA.find(g => g.slug === gameSlug) || GAMES_DATA[0];
  });

  useEffect(() => {
    const fetchGame = async () => {
      if (!gameSlug) return;
      try {
        const data = await gamesService.getBySlug(gameSlug);
        if (data) {
          const local = GAMES_DATA.find(l => l.slug === data.slug);
          const stats = typeof data.stats === 'string' ? JSON.parse(data.stats) : (data.stats || {});
          setGame({
            ...data,
            imageUrl: data.cover_url || local?.imageUrl || '',
            modCount: stats.modCount || local?.modCount || '0',
            downloadCount: stats.downloads || local?.downloadCount || '0'
          });
        }
      } catch (err) {
        console.warn('API fetch failed for game, using local data', err);
      }
    };
    fetchGame();
  }, [gameSlug]);

  const categories = game.categories || DEFAULT_GAME_CONFIG.categories;
  const filterGroups = game.filters || DEFAULT_GAME_CONFIG.filters;

  // Helper to slugify category name
  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-');

  // Derive active category from URL or default
  const activeCategory = useMemo(() => {
    if (!categorySlug) return categories[0];
    const found = categories.find(c => slugify(c) === categorySlug);
    return found || categories[0];
  }, [categorySlug, categories]);

  const [searchMod, setSearchMod] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState('Relevance');
  const [perPage, setPerPage] = useState('20');
  const [currentPage, setCurrentPage] = useState(1);
  const [collapsedFilters, setCollapsedFilters] = useState<Record<string, boolean>>({});
  const [filterSearch, setFilterSearch] = useState<Record<string, string>>({});
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  const totalPages = 500;
  const isFavorite = favorites.includes(game.id);

  // Сброс при смене игры или категории
  useEffect(() => {
    setCurrentPage(1);
    setSelectedFilters({});
    setFilterSearch({});
    window.scrollTo(0, 0);
  }, [gameSlug, categorySlug]);

  // Генерация модов
  const mods = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => {
      const attributes: Record<string, string> = {};
      filterGroups.forEach(group => {
        attributes[group.label] = group.options[Math.floor(Math.random() * group.options.length)];
      });

      return {
        id: `mod-${i}-${currentPage}-${activeCategory}`,
        name: i === 0 ? 'Ultra Realistic Pack' : `${game.title} Content #${i + 1 + (currentPage - 1) * 20}`,
        author: ['eldeston', 'tsptds', 'modder99', 'pro_gamer'][i % 4],
        downloads: `${(Math.random() * 10).toFixed(1)}M`,
        relativeDate: `${i + 1} days ago`,
        size: `${(Math.random() * 500).toFixed(1)} MB`,
        desc: 'Universal content description for testing functional filters and dynamic layouts.',
        attributes
      };
    });
  }, [game.id, currentPage, filterGroups, activeCategory]);

  const filteredMods = useMemo(() => {
    return mods.filter(mod => {
      const matchesSearch = mod.name.toLowerCase().includes(searchMod.toLowerCase());
      const matchesFilters = (Object.entries(selectedFilters) as [string, string[]][]).every(([groupLabel, selectedOptions]) => {
        if (!selectedOptions || selectedOptions.length === 0) return true;
        return selectedOptions.includes(mod.attributes[groupLabel]);
      });
      return matchesSearch && matchesFilters;
    });
  }, [mods, searchMod, selectedFilters]);

  const toggleFilter = (groupLabel: string, option: string) => {
    setSelectedFilters(prev => {
      const current = prev[groupLabel] || [];
      const next = current.includes(option) ? current.filter(o => o !== option) : [...current, option];
      return { ...prev, [groupLabel]: next };
    });
  };

  const handlePageChange = (page: number | string) => {
    if (typeof page === 'number') {
      setCurrentPage(page);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'grid' ? 'compact' : prev === 'compact' ? 'list' : 'grid'));
  };

  const getViewModeIcon = () => {
    if (viewMode === 'grid') return <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />;
    if (viewMode === 'compact') return <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />;
    return <path d="M4 6h2v2H4V6zm4 0h12v2H8V6zM4 11h2v2H4v-2zm4 0h12v2H8v-2zm-4 5h2v2H4v-2zm4 0h12v2H8v-2z" />;
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) pages.push(1, 2, 3, 4, 5, '...', totalPages);
      else if (currentPage >= totalPages - 3) pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      else pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const isSkinsCategory = activeCategory.toLowerCase().includes('skin') || activeCategory.toLowerCase().includes('скин');

  return (
    <div className="min-h-screen bg-[#1c1c1f] text-white selection:bg-white selection:text-black font-['Inter',_sans-serif]">
      <div className="relative w-full overflow-hidden pt-6 pb-12">
        <div className="absolute inset-0 z-0">
          <img src={game.imageUrl} className="w-full h-full object-cover opacity-20 grayscale-[0.3] scale-105 blur-[2px]" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1f] via-[#1c1c1f]/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-[1300px] mx-auto w-full px-8">
          <nav className="flex items-center gap-2 text-[14px] font-medium text-zinc-500 mb-8">
            <ReactRouterDOM.Link to="/" className="hover:text-white transition-colors no-underline">Home</ReactRouterDOM.Link>
            <svg className="w-3 h-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            <ReactRouterDOM.Link to={`/game/${game.slug}`} className="hover:text-white transition-colors no-underline">{game.title}</ReactRouterDOM.Link>
            <svg className="w-3 h-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            <span className="text-white">{activeCategory}</span>
          </nav>

          <div className="flex flex-col md:flex-row items-start gap-10">
            <div className="w-40 h-56 shrink-0 overflow-hidden shadow-2xl rounded-lg bg-[#27292e] border border-white/5">
              <img src={game.imageUrl} className="w-full h-full object-cover" alt={game.title} />
            </div>
            <div className="flex flex-col gap-6 pt-2">
              <div className="flex flex-wrap items-center gap-6">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-none">{game.title}</h1>
                <button onClick={() => onToggleFavorite(game.id)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-none cursor-pointer shadow-lg active:scale-90 ${isFavorite ? 'bg-yellow-400 text-zinc-950' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'}`}>
                  <svg className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-10 text-zinc-500 uppercase tracking-widest text-[10px] font-bold">
                <div className="flex flex-col gap-1">
                  <span className="opacity-50">Файлов</span>
                  <span className="text-white text-lg">{game.modCount}</span>
                </div>
                <div className="w-[1px] h-8 bg-white/10"></div>
                <div className="flex flex-col gap-1">
                  <span className="opacity-50">Загрузок</span>
                  <span className="text-white text-lg">{game.downloadCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-5 gap-10 py-6">
        {/* Sidebar Filters */}
        <div className="hidden lg:block space-y-4">
          <div className="mb-6 flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <ReactRouterDOM.Link
                key={cat}
                to={`/game/${game.slug}/${slugify(cat)}`}
                className={`px-3 py-1.5 text-[14px] font-bold transition-all border-none cursor-pointer rounded-md no-underline ${activeCategory === cat ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'
                  }`}
              >
                {cat}
              </ReactRouterDOM.Link>
            ))}
          </div>

          {!isSkinsCategory && filterGroups.map((group, i) => {
            const hasManyOptions = group.options.length > 10;
            const searchTerm = filterSearch[group.label] || '';
            const filteredOptions = group.options.filter(opt =>
              opt.toLowerCase().includes(searchTerm.toLowerCase())
            );

            return (
              <div key={i} className="bg-[#27292e] rounded-xl overflow-hidden">
                <button
                  onClick={() => setCollapsedFilters(p => ({ ...p, [group.label]: !p[group.label] }))}
                  className="w-full px-5 py-3.5 flex items-center justify-between bg-transparent border-none cursor-pointer text-left"
                >
                  <span className="text-[14px] font-bold text-zinc-400 tracking-wider">
                    {group.label.charAt(0).toUpperCase() + group.label.slice(1).toLowerCase()}
                  </span>
                  <svg className={`w-3.5 h-3.5 text-zinc-600 transition-transform ${collapsedFilters[group.label] ? '-rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                </button>

                {!collapsedFilters[group.label] && (
                  <div className="px-5 pb-5 flex flex-col gap-2">
                    {hasManyOptions && (
                      <div className="mb-3">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setFilterSearch(p => ({ ...p, [group.label]: e.target.value }))}
                          placeholder="Поиск..."
                          className="w-full bg-[#1c1c1f] text-[13px] px-3 py-2 rounded-lg border-none text-zinc-300 placeholder:text-zinc-600 outline-none"
                        />
                      </div>
                    )}
                    <div className="relative">
                      <div className={`space-y-2 ${hasManyOptions ? 'max-h-60 overflow-y-auto no-scrollbar pr-1' : ''}`}>
                        {filteredOptions.map(opt => (
                          <label key={opt} className="flex items-center gap-3 cursor-pointer group py-0.5">
                            <div className="relative flex items-center h-4 w-4 shrink-0">
                              <input
                                type="checkbox"
                                checked={(selectedFilters[group.label] || []).includes(opt)}
                                onChange={() => toggleFilter(group.label, opt)}
                                className="peer absolute inset-0 opacity-0 cursor-pointer z-10"
                              />
                              <div className="h-4 w-4 rounded bg-[#1c1c1f] peer-checked:bg-blue-500 transition-colors flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            </div>
                            <span className="text-[14px] font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">
                              {opt}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <div className="mb-8 space-y-4">
            <div className="relative w-full h-11 bg-[#27292e] rounded-lg px-4 flex items-center group transition-all">
              <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                value={searchMod}
                onChange={(e) => setSearchMod(e.target.value)}
                placeholder="Search content..."
                className="flex-grow h-full bg-transparent px-3 text-[14px] font-medium border-none text-white placeholder:text-zinc-600 outline-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#27292e] text-zinc-300 px-4 py-2 rounded-lg text-[13px] font-bold border-none outline-none cursor-pointer"
                >
                  <option value="Relevance">Sort by: Relevance</option>
                  <option value="Newest">Sort by: Newest</option>
                  <option value="Popularity">Sort by: Popularity</option>
                </select>
                <button
                  onClick={toggleViewMode}
                  className="h-10 w-10 flex items-center justify-center bg-[#27292e] rounded-lg text-zinc-400 hover:text-white transition-all border-none cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">{getViewModeIcon()}</svg>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`text-zinc-600 hover:text-white transition-colors cursor-pointer bg-transparent border-none ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex items-center gap-1.5">
                  {getPageNumbers().map((n, i) => (
                    <button
                      key={i}
                      onClick={() => typeof n === 'number' && handlePageChange(n)}
                      className={`text-[15px] font-bold transition-all bg-transparent border-none cursor-pointer flex items-center justify-center min-w-[28px] ${currentPage === n ? 'text-white underline underline-offset-4' : 'text-zinc-500 hover:text-white'
                        }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={`text-zinc-600 hover:text-white transition-colors cursor-pointer bg-transparent border-none ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>

          <div className={`grid gap-6 ${isSkinsCategory
            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
            : viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
            }`}>
            {filteredMods.map((mod) => (
              <div
                key={mod.id}
                className="bg-[#27292e] rounded-xl overflow-hidden flex flex-col group cursor-pointer border border-white/[0.03] transition-all hover:bg-white/[0.02]"
                onClick={() => navigate(`/game/${game.slug}/mod/${mod.id}`)}
              >
                <div className={`${isSkinsCategory ? 'aspect-[2/3]' : 'aspect-video'} relative overflow-hidden bg-[#1c1c1f]`}>
                  <img src={`https://picsum.photos/seed/${mod.id}/${isSkinsCategory ? '400/600' : '600/350'}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  {isSkinsCategory && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  )}
                  {isSkinsCategory && (
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-bold text-[13px] text-white truncate">{mod.name}</h3>
                      <span className="text-[10px] text-zinc-400">By {mod.author}</span>
                    </div>
                  )}
                </div>
                {!isSkinsCategory && (
                  <div className="p-5 flex flex-col gap-2">
                    <h3 className="font-bold text-[15px] text-white line-clamp-2 leading-snug">{mod.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-[#1c1c1f]"><img src={`https://i.pravatar.cc/50?u=${mod.author}`} className="w-full h-full object-cover" alt="" /></div>
                      <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-tight">{mod.author}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 py-8 flex items-center justify-center gap-6">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className={`text-zinc-600 hover:text-white transition-colors border-none bg-transparent cursor-pointer ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex items-center gap-5">
              {getPageNumbers().map((n, i) => (
                <button
                  key={i}
                  onClick={() => typeof n === 'number' && handlePageChange(n)}
                  className={`text-[16px] font-bold border-none bg-transparent cursor-pointer transition-all ${currentPage === n ? 'text-white underline underline-offset-8' : 'text-zinc-600 hover:text-white'
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className={`text-zinc-600 hover:text-white transition-colors border-none bg-transparent cursor-pointer ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
