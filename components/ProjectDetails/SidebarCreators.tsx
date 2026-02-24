
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import SidebarBlock from './SidebarBlock';

interface SidebarCreatorsProps {
  authorName?: string;
  authorAvatar?: string;
}

const SidebarCreators: React.FC<SidebarCreatorsProps> = ({ authorName = 'Неизвестен', authorAvatar }) => {
  const creators = [
    {
      name: authorName,
      role: 'Владелец',
      avatar: authorAvatar,
      isOwner: true
    }
  ];

  return (
    <SidebarBlock title="Авторы">
      <div className="grid grid-cols-1 gap-3">
        {creators.map((c, i) => (
          <ReactRouterDOM.Link
            key={i}
            to={`/user/${c.name}`}
            className="flex items-center gap-3 group cursor-pointer p-1.5 -m-1.5 rounded-lg hover:bg-white/[0.03] transition-all no-underline"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 transition-all duration-300 group-hover:scale-105 shadow-sm shrink-0 relative">
              {c.avatar ? (
                <img src={c.avatar} className="w-full h-full object-cover" alt={c.name} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-white/5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
              {c.isOwner && (
                <div className="absolute inset-0 border border-blue-500/30 rounded-full"></div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold text-zinc-300 tracking-tight group-hover:text-white transition-colors truncate">{c.name}</span>
                {c.isOwner && (
                  <svg className="w-3 h-3 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                )}
              </div>
              <span className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.1em] mt-0.5">{c.role}</span>
            </div>
          </ReactRouterDOM.Link>
        ))}
      </div>
    </SidebarBlock>
  );
};

export default SidebarCreators;
