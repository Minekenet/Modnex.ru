
import React from 'react';

const SidebarLinks: React.FC = () => {
  const links = [
    { name: 'Сообщить об ошибке', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
    )},
    { name: 'Исходный код', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
    )},
    { name: 'Вики', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
    )},
    { name: 'Discord сервер', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515..."></path></svg>
    )}
  ];

  return (
    <div className="bg-[#24262b] rounded-3xl p-10 border border-white/5 shadow-xl">
      <h3 className="text-white font-black text-[18px] uppercase tracking-tight mb-8">Ссылки</h3>
      <div className="flex flex-col gap-4">
        {links.map((link, i) => (
          <a key={i} href="#" className="flex items-center justify-between py-2.5 text-zinc-500 hover:text-white transition-colors no-underline group">
            <div className="flex items-center gap-4">
              <span className="opacity-60 group-hover:opacity-100 transition-opacity">{link.icon}</span>
              <span className="text-[15px] font-bold">{link.name}</span>
            </div>
            <svg className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SidebarLinks;
