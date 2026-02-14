
import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { ROTATING_WORDS, GAMES_DATA } from '../constants';

const Hero: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredGames = searchQuery.trim() === '' 
    ? [] 
    : GAMES_DATA.filter(game => 
        game.title.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);

  return (
    <div className="relative w-full min-h-[500px] flex flex-col items-center justify-center font-['Inter',_sans-serif] bg-[#1c1c1f]">
      {/* Background Grid - Colorful and vibrant */}
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none overflow-hidden">
        <div className="grid grid-cols-6 gap-6 p-4 transform -rotate-2 scale-110 origin-center">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-zinc-800 overflow-hidden shadow-xl border-none">
              <img 
                src={`https://picsum.photos/seed/hero-vibrant-${i}/400/400`} 
                className="w-full h-full object-cover transition-transform duration-[10s] hover:scale-125" 
                alt="" 
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Soft gradient matching the lighter #1c1c1f background */}
      <div className="absolute inset-0 z-1 bg-gradient-to-b from-transparent via-[#1c1c1f]/85 to-[#1c1c1f]"></div>

      <div className="relative z-10 w-full max-w-7xl px-8 flex flex-col items-center text-center pt-16 pb-4">
        <div className="flex flex-col items-center gap-2 mb-10">
          <div className="flex flex-col sm:flex-row items-center gap-x-6 gap-y-2 text-white font-black text-5xl md:text-7xl uppercase tracking-tighter">
            <span>ВСЕ ВАШИ</span>
            <div className="relative h-20 w-[320px] md:w-[450px] flex items-center justify-center overflow-hidden bg-white/5 rounded-2xl">
              {ROTATING_WORDS.map((word, i) => (
                <span
                  key={word}
                  className={`absolute transition-all duration-700 text-orange-500 text-5xl md:text-7xl font-black uppercase ${
                    i === index ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-90'
                  }`}
                >
                  {word}
                </span>
              ))}
            </div>
            <span>ТУТ</span>
          </div>
        </div>

        <div className="w-full max-w-3xl mt-4 relative z-[60]" ref={searchRef}>
          <div className="relative group">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Какую игру обновим сегодня?" 
              className="w-full bg-[#2a2b30] text-white py-6 pl-16 pr-8 rounded-2xl text-lg border-none outline-none shadow-2xl placeholder:text-zinc-600 font-bold transition-all focus:bg-[#323339]"
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-[#2a2b30] rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] z-[100] overflow-hidden border-none animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 bg-black/20 flex items-center">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Результаты поиска</span>
              </div>
              
              <div className="max-h-[380px] overflow-y-auto no-scrollbar">
                {filteredGames.length > 0 ? (
                  filteredGames.map((game) => (
                    <ReactRouterDOM.Link 
                      to={`/game/${game.slug}`}
                      key={game.id}
                      onClick={() => setIsSearchFocused(false)}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors group no-underline"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-zinc-700 border-none">
                        <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-white font-bold text-[15px] uppercase tracking-tight group-hover:text-white transition-colors">
                          {game.title}
                        </span>
                        <div className="flex gap-3 mt-0.5">
                          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">{game.modCount} модов</span>
                          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">{game.downloadCount} скачиваний</span>
                        </div>
                      </div>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </ReactRouterDOM.Link>
                  ))
                ) : (
                  <div className="py-12 px-8 text-center">
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Ничего не найдено</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
