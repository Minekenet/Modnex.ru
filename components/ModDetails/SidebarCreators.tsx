
import React from 'react';
import SidebarBlock from './SidebarBlock';

const SidebarCreators: React.FC = () => {
  const creators = [
    { name: 'modmuss50', role: 'Владелец', avatar: 'https://i.pravatar.cc/100?u=modmuss50', isOwner: true },
    { name: 'Player7457', role: 'Разработчик', avatar: 'https://i.pravatar.cc/100?u=player7457', isOwner: false }
  ];

  return (
    <SidebarBlock title="Создатели">
      <div className="flex flex-col gap-8 pt-2">
        {creators.map((c, i) => (
          <div key={i} className="flex items-center gap-5 group cursor-pointer">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/5 bg-zinc-800 transition-transform group-hover:scale-105">
              <img src={c.avatar} className="w-full h-full object-cover" alt={c.name} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5">
                <span className="text-[16px] font-black text-white tracking-tight group-hover:text-zinc-300 transition-colors">{c.name}</span>
                {c.isOwner && (
                  <svg className="w-4 h-4 text-zinc-500 fill-current" viewBox="0 0 24 24">
                    <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-1h14v1z"/>
                  </svg>
                )}
              </div>
              <span className="text-zinc-600 text-[11px] font-black uppercase tracking-widest">{c.role}</span>
            </div>
          </div>
        ))}
      </div>
    </SidebarBlock>
  );
};

export default SidebarCreators;
