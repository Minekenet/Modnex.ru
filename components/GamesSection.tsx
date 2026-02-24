
import React, { useState, useRef, useEffect, useMemo } from 'react';
import GameCard from './GameCard';
import { gamesService } from '../api/games';
import Skeleton from './UI/Skeleton';

interface GamesSectionProps {
  onSuggestClick: () => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

const GamesSection: React.FC<GamesSectionProps> = ({ onSuggestClick, favorites, onToggleFavorite }) => {
  const [sortBy, setSortBy] = useState('ПОПУЛЯРНЫЕ');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const sortOptions = ['ПОПУЛЯРНЫЕ', 'КОЛИЧЕСТВО МОДОВ'];

  const parseCount = (count: string | number | null | undefined) => {
    if (typeof count === 'number') return count;
    if (typeof count !== 'string') return 0;
    const multiplier = count.endsWith('B') ? 1000000000 :
      count.endsWith('M') ? 1000000 :
        count.endsWith('K') ? 1000 : 1;
    return parseFloat(count) * multiplier;
  };

  useEffect(() => {
    let isCancelled = false;

    const fetchGames = async () => {
      try {
        setLoading(true);
        // Ensure games array is empty during loading to prevent flickering
        setGames([]);

        const data = await gamesService.getAll();

        // Only update if component is still mounted
        if (!isCancelled && Array.isArray(data)) {
          const mapped = data.map(g => {
            const stats = typeof g.stats === 'string' ? JSON.parse(g.stats) : (g.stats || {});
            return {
              ...g,
              imageUrl: g.cover_url || '',
              modCount: stats.modCount || '0',
              downloadCount: stats.downloads || '0'
            };
          });
          setGames(mapped);
        }
      } catch (err: unknown) {
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchGames();

    return () => {
      isCancelled = true;
    };
  }, []);

  const displayedGames = useMemo(() => {
    let filtered = [...games];

    // Filter by favorites if toggle is enabled
    if (showFavoritesOnly) {
      filtered = filtered.filter(g => favorites.includes(g.id));
    }

    // Apply sorting
    if (sortBy === 'ПОПУЛЯРНЫЕ') {
      filtered.sort((a, b) => parseCount(b.downloadCount) - parseCount(a.downloadCount));
    } else if (sortBy === 'КОЛИЧЕСТВО МОДОВ') {
      filtered.sort((a, b) => parseCount(b.modCount) - parseCount(a.modCount));
    }

    return filtered.slice(0, 10);
  }, [sortBy, favorites, games, showFavoritesOnly]);

  return (
    <section className="max-w-[1400px] mx-auto px-8 pt-4 pb-16 font-['Inter',_sans-serif]">
      <div className="mb-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-8 w-full">
          <div className="flex flex-col items-start">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Игры</h2>
            <span className="text-zinc-500 font-bold text-[14px] uppercase tracking-[0.2em]">ПОПУЛЯРНЫЕ ИГРЫ</span>
          </div>
          <div className="flex items-center gap-4 md:ml-auto">
            {/* Favorites Toggle */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border-none text-[13px] font-bold transition-all cursor-pointer outline-none shadow-lg ${showFavoritesOnly
                ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                : 'bg-[#2f3131] text-zinc-300 hover:bg-[#3f4141]'
                }`}
            >
              <svg className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} fill={showFavoritesOnly ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="uppercase text-[12px] font-black">Избранное</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-4 px-6 py-2.5 bg-[#2f3131] rounded-xl border-none text-[13px] font-bold text-zinc-300 hover:bg-[#3f4141] transition-all cursor-pointer outline-none shadow-lg"
              >
                Сорт: <span className="text-white uppercase text-[12px] font-black">{sortBy}</span>
                <svg className={`w-4 h-4 text-white transition-transform ${isSortOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isSortOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-[#2f3131] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-40 py-2 border border-white/5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setSortBy(opt); setIsSortOpen(false); }}
                      className={`w-full text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors border-none bg-transparent cursor-pointer ${sortBy === opt ? 'text-white bg-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-full h-[1px] bg-white/5" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12 mb-20 min-h-[300px] mt-12">
        {loading || games.length === 0 ? (
          // Show skeletons until data is fully loaded
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="w-full aspect-[4/5] rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-1/2 h-3" />
              </div>
            </div>
          ))
        ) : displayedGames.length === 0 && showFavoritesOnly ? (
          <div className="col-span-full py-24 flex flex-col items-center justify-center bg-[#242626]/50 rounded-3xl border border-dashed border-white/5">
            <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-yellow-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-white font-black uppercase tracking-tight text-lg mb-2">Нет избранных игр</h3>
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px] text-center max-w-[240px] leading-loose">Вы еще не добавили ни одной игры в избранное для быстрого доступа.</p>
          </div>
        ) : (
          displayedGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isFavorite={favorites.includes(game.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))
        )}
      </div>

      <div className="relative overflow-hidden bg-[#242626] rounded-3xl border border-white/5 p-8 md:p-12 group transition-all shadow-xl">
        <div className="absolute -right-8 -bottom-8 text-white/[0.02] pointer-events-none group-hover:text-white/[0.04] transition-colors">
          <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-grow max-w-2xl text-center md:text-left">
            <h3 className="text-3xl md:text-4xl font-black text-white uppercase mb-4 tracking-tighter">Не нашли игру?</h3>
            <p className="text-zinc-500 text-base font-medium tracking-tight leading-relaxed">
              Напишите нам, и мы добавим её в каталог в течение <span className="text-white font-bold">24 часов</span>.
            </p>
          </div>

          <button
            onClick={onSuggestClick}
            className="shrink-0 flex items-center gap-4 px-10 py-5 bg-blue-600 text-white font-black text-[13px] uppercase tracking-[0.2em] hover:bg-blue-500 transition-all border-none shadow-xl active:scale-95 cursor-pointer rounded-2xl group/btn"
          >
            <span>Предложить игру</span>
            <svg className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default GamesSection;
