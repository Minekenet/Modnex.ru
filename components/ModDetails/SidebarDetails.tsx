
import React from 'react';
import SidebarBlock from './SidebarBlock';

const SidebarDetails: React.FC = () => {
  const details = [
    { label: 'Лицензия', value: 'Apache-2.0', isLink: true, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
    )},
    { label: 'Опубликован', value: '5 лет назад', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
    )},
    { label: 'Обновлен', value: '2 дня назад', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
    )}
  ];

  return (
    <SidebarBlock title="Детали">
      <div className="flex flex-col gap-4">
        {details.map((d, i) => (
          <div key={i} className="flex items-center gap-3 text-zinc-400">
            <span className="text-zinc-500 shrink-0">{d.icon}</span>
            <div className="flex gap-2 text-[15px] font-bold">
              <span>{d.label}</span>
              <span className={d.isLink ? 'text-blue-400 cursor-pointer hover:underline' : 'text-zinc-300'}>{d.value}</span>
            </div>
          </div>
        ))}
      </div>
    </SidebarBlock>
  );
};

export default SidebarDetails;
