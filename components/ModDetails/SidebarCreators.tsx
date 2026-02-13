
import React from 'react';
import SidebarBlock from './SidebarBlock';

const SidebarCreators: React.FC = () => {
  const creators = [
    { name: 'modmuss50', role: 'Владелец', avatar: 'https://i.pravatar.cc/100?u=modmuss50', isOwner: true },
    { name: 'Player7457', role: 'Разработчик', avatar: 'https://i.pravatar.cc/100?u=player7457', isOwner: false }
  ];

  return (
    <SidebarBlock title="Создатели">
      <div className="flex flex-col gap-5">
        {creators.map((c, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-white/5 bg-zinc-800">
              <img src={c.avatar} className="w-full h-full object-cover" alt={c.name} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold text-white tracking-tight">{c.name}</span>
                {c.isOwner && (
                  <svg className="w-4 h-4 text-orange-400 fill-current" viewBox="0 0 24 24">
                    <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-1h14v1z"/>
                  </svg>
                )}
              </div>
              <span className="text-zinc-500 text-[13px] font-bold">{c.role}</span>
            </div>
          </div>
        ))}
      </div>
    </SidebarBlock>
  );
};

export default SidebarCreators;
