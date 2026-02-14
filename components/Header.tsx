
import React, { useState, useRef, memo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { GAMES_DATA } from '../constants';

type MenuType = 'games' | 'authors' | 'community' | 'help' | null;

const GameSearchInput = memo(({ value, onChange }: { value: string, onChange: (val: string) => void }) => (
  <div className="relative group">
    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 z-10 pointer-events-none">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input 
      type="text" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="ПОИСК ПО ИГРАМ..."
      className="w-full bg-[#282933]/60 backdrop-blur-xl py-4 pl-14 pr-6 rounded-xl text-[13px] font-bold text-white border-none outline-none transition-all placeholder:text-zinc-600 tracking-widest focus:bg-[#2d2e3a]"
      autoFocus
    />
  </div>
));

const Header: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<MenuType>(null);
  const [gameSearch, setGameSearch] = useState('');
  const timeoutRef = useRef<number | null>(null);

  // Используем slug для ссылок
  const navGames = GAMES_DATA.map(game => ({
    id: game.id,
    slug: game.slug,
    name: game.title,
    icon: game.imageUrl
  }));

  const authorsContent = {
    columns: [
      {
        title: 'УПРАВЛЕНИЕ',
        links: [
          { name: 'Создать проект', to: '/create-project' },
          { name: 'Правила публикации', to: '/publish-rules' }
        ]
      }
    ]
  };

  const communityContent = {
    columns: [
      {
        title: 'МЫ В СЕТИ',
        links: [
          { name: 'Telegram канал', to: '#' },
          { name: 'Boosty поддержка', to: '#' }
        ]
      }
    ]
  };

  const helpContent = {
    columns: [
      {
        title: 'ПОДДЕРЖКА И ПРАВИЛА',
        links: [
          { name: 'База знаний / FAQ', to: '/faq' },
          { name: 'Правила сайта', to: '/rules' },
          { name: 'Конфиденциальность', to: '/privacy' }
        ]
      }
    ]
  };

  const handleMouseEnter = (menu: MenuType) => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setActiveMenu(null);
    }, 300); 
  };

  const NavItem = ({ children, active, onMouseEnter, to = "#" }: { children?: React.ReactNode, active?: boolean, onMouseEnter?: () => void, to?: string }) => (
    <ReactRouterDOM.Link 
      to={to}
      onMouseEnter={onMouseEnter}
      className={`px-6 h-full transition-all flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider no-underline border-none bg-transparent cursor-pointer font-['Inter',_sans-serif] ${
        active 
        ? 'bg-white/5 text-white' 
        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {children}
    </ReactRouterDOM.Link>
  );

  const DropdownContainer = ({ children, width = "auto", padding = "p-8" }: { children?: React.ReactNode, width?: string, padding?: string }) => (
    <div 
      className={`absolute top-[calc(100%-1px)] left-0 bg-[#242626] shadow-[0_40px_80px_rgba(0,0,0,0.8)] ${padding} animate-in fade-in slide-in-from-top-1 duration-200 rounded-2xl z-[60] border border-white/5 font-['Inter',_sans-serif]`}
      style={{ width }}
      onMouseEnter={() => handleMouseEnter(activeMenu)}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#242626] h-16 shadow-2xl border-b border-white/5 outline-none">
      <div className="w-full px-8 h-full flex items-center justify-between border-none">
        <div className="flex items-center h-full border-none">
          <ReactRouterDOM.Link to="/" className="text-xl font-bold tracking-tighter text-white uppercase shrink-0 mr-10 hover:opacity-80 transition-opacity no-underline font-['Inter',_sans-serif]">
            MODNEX
          </ReactRouterDOM.Link>
          
          <div className="h-6 w-[1px] bg-white/10 mr-6 hidden lg:block"></div>
          
          <nav className="hidden lg:flex items-center h-full border-none">
            <div className="relative h-full flex items-center border-none" onMouseLeave={handleMouseLeave}>
              <NavItem active={activeMenu === 'games'} onMouseEnter={() => handleMouseEnter('games')} to="/">
                Игры
                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${activeMenu === 'games' ? 'rotate-180 text-white' : 'text-zinc-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
              </NavItem>
              {activeMenu === 'games' && (
                <div className="pt-0">
                  <DropdownContainer width="700px" padding="p-8">
                    <div className="mb-8">
                      <GameSearchInput value={gameSearch} onChange={setGameSearch} />
                    </div>
                    <div className="grid grid-cols-6 gap-x-4 gap-y-8 max-h-[400px] overflow-y-auto no-scrollbar min-h-[100px]">
                      {navGames.filter(g => g.name.toLowerCase().includes(gameSearch.toLowerCase())).map((game, idx) => (
                        <ReactRouterDOM.Link 
                          to={`/game/${game.slug}`} 
                          key={idx} 
                          onClick={() => setActiveMenu(null)}
                          className="flex flex-col items-center gap-3 cursor-pointer text-center w-full group no-underline"
                        >
                          <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-zinc-800 transition-all duration-300 group-hover:brightness-125 shadow-lg border-none">
                            <img src={game.icon} alt={game.name} className="w-full h-full object-cover object-center" />
                          </div>
                          <span className="text-[10px] font-bold text-zinc-400 leading-snug truncate w-full px-1 uppercase tracking-tight group-hover:text-white transition-colors">
                            {game.name}
                          </span>
                        </ReactRouterDOM.Link>
                      ))}
                    </div>
                  </DropdownContainer>
                </div>
              )}
            </div>

            <div className="relative h-full flex items-center border-none" onMouseLeave={handleMouseLeave}>
              <NavItem active={activeMenu === 'authors'} onMouseEnter={() => handleMouseEnter('authors')}>
                Авторам
                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${activeMenu === 'authors' ? 'rotate-180 text-white' : 'text-zinc-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
              </NavItem>
              {activeMenu === 'authors' && (
                <div className="pt-0">
                  <DropdownContainer width="260px">
                    <div className="flex flex-col">
                      {authorsContent.columns.map((col, i) => (
                        <div key={i}>
                          <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-6 opacity-40">{col.title}</h4>
                          <ul className="space-y-4 p-0 m-0 list-none">
                            {col.links.map((link, j) => (
                              <li key={j}>
                                <ReactRouterDOM.Link 
                                  to={link.to} 
                                  onClick={() => setActiveMenu(null)}
                                  className="text-zinc-400 hover:text-white transition-colors text-[13px] font-bold no-underline block uppercase tracking-wider"
                                >
                                  {link.name}
                                </ReactRouterDOM.Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </DropdownContainer>
                </div>
              )}
            </div>

            <div className="relative h-full flex items-center border-none" onMouseLeave={handleMouseLeave}>
              <NavItem active={activeMenu === 'community'} onMouseEnter={() => handleMouseEnter('community')}>
                Сообщество
                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${activeMenu === 'community' ? 'rotate-180 text-white' : 'text-zinc-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
              </NavItem>
              {activeMenu === 'community' && (
                <div className="pt-0">
                  <DropdownContainer width="260px">
                    <div className="flex flex-col">
                      {communityContent.columns.map((col, i) => (
                        <div key={i}>
                          <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-6 opacity-40">{col.title}</h4>
                          <ul className="space-y-4 p-0 m-0 list-none">
                            {col.links.map((link, j) => (
                              <li key={j}>
                                <ReactRouterDOM.Link 
                                  to={link.to} 
                                  onClick={() => setActiveMenu(null)}
                                  className="text-zinc-400 hover:text-white transition-colors text-[13px] font-bold no-underline block uppercase tracking-wider"
                                >
                                  {link.name}
                                </ReactRouterDOM.Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </DropdownContainer>
                </div>
              )}
            </div>

            <div className="relative h-full flex items-center border-none" onMouseLeave={handleMouseLeave}>
              <NavItem active={activeMenu === 'help'} onMouseEnter={() => handleMouseEnter('help')}>
                Помощь
                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${activeMenu === 'help' ? 'rotate-180 text-white' : 'text-zinc-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
              </NavItem>
              {activeMenu === 'help' && (
                <div className="pt-0">
                  <DropdownContainer width="320px">
                    <div className="flex flex-col">
                      {helpContent.columns.map((col, i) => (
                        <div key={i}>
                          <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-6 opacity-40">{col.title}</h4>
                          <ul className="space-y-4 p-0 m-0 list-none">
                            {col.links.map((link, j) => (
                              <li key={j}>
                                <ReactRouterDOM.Link 
                                  to={link.to} 
                                  onClick={() => setActiveMenu(null)}
                                  className="text-zinc-400 hover:text-white transition-colors text-[13px] font-bold no-underline block uppercase tracking-wider"
                                >
                                  {link.name}
                                </ReactRouterDOM.Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </DropdownContainer>
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-3 border-none">
          <button className="w-10 h-10 flex items-center justify-center bg-white/5 text-zinc-400 hover:text-white transition-all rounded-[12px] border-none cursor-pointer hover:bg-white/10 active:scale-95 outline-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          <button className="w-10 h-10 flex items-center justify-center bg-white/5 text-zinc-400 hover:text-white transition-all rounded-[12px] border-none cursor-pointer hover:bg-white/10 active:scale-95 outline-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>

          <ReactRouterDOM.Link 
            to="/auth" 
            className="text-[12px] font-black px-8 py-2.5 rounded-full transition-all border-none bg-[#2f3131] text-white hover:bg-white/10 uppercase tracking-[0.2em] no-underline cursor-pointer active:scale-95 font-['Inter',_sans-serif] ml-2 outline-none"
          >
            Войти
          </ReactRouterDOM.Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
