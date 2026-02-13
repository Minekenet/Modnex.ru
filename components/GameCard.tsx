
import React, { useState, useRef, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, isFavorite, onToggleFavorite }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = ReactRouterDOM.useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(game.id);
    setShowMenu(false);
  };

  const handleCardClick = () => {
    navigate(`/game/${game.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group cursor-pointer relative w-full max-w-[260px] mx-auto animate-in fade-in duration-500"
    >
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#1a1b23] mb-4 transition-all duration-300 group-hover:brightness-110 shadow-2xl border border-white/5 rounded-sm">
        <img 
          src={game.imageUrl} 
          alt={game.title} 
          className="w-full h-full object-cover object-center"
        />
        {isFavorite && (
          <div className="absolute top-3 right-3 z-10 animate-in fade-in zoom-in duration-300">
            <svg className="w-6 h-6 text-white fill-current drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" viewBox="0 0 24 24">
              <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-5 7 5V5c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
      
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-[15px] truncate text-white leading-tight uppercase tracking-tight">
          {game.title}
        </h3>
        
        <div className="relative shrink-0" ref={menuRef}>
          <button 
            onClick={toggleMenu}
            className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-white transition-all border-none bg-transparent cursor-pointer p-0 rounded-full hover:bg-white/10"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-[240px] bg-[#1a1b23] shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-md z-50 py-2 overflow-hidden border border-white/5 animate-in fade-in zoom-in-95 duration-100">
              <button 
                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors border-none text-zinc-100 bg-transparent cursor-pointer"
                onClick={handleFavoriteClick}
              >
                <svg 
                  className={`w-5 h-5 transition-all ${isFavorite ? 'text-white fill-current scale-110' : 'text-zinc-500'}`} 
                  fill={isFavorite ? 'currentColor' : 'none'} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-5 7 5V5c0-1.1-.9-2-2-2z" 
                  />
                </svg>
                <span>{isFavorite ? 'В избранном' : 'В избранное'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-6 text-[12px] font-black text-zinc-500 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 fill-current opacity-60" viewBox="0 0 24 24">
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
          </svg>
          <span className="text-zinc-400">{game.modCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 fill-current opacity-60" viewBox="0 0 24 24">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
          <span className="text-zinc-400">{game.downloadCount}</span>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
