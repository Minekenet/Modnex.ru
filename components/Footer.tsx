
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0a0a0b] border-t border-white/5 pt-20 pb-12 px-8 mt-auto font-['Inter',_sans-serif]">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">

        {/* Column 1: MODNEX */}
        <div className="flex flex-col gap-8">
          <h4 className="text-white font-black text-[11px] uppercase tracking-[0.4em]">MODNEX LEGAL</h4>
          <ul className="flex flex-col gap-4 p-0 m-0 list-none">
            <li><ReactRouterDOM.Link to="/terms" className="text-zinc-500 hover:text-white transition-colors text-[13px] font-bold no-underline uppercase tracking-wider">Условия использования</ReactRouterDOM.Link></li>
            <li><ReactRouterDOM.Link to="/privacy" className="text-zinc-500 hover:text-white transition-colors text-[13px] font-bold no-underline uppercase tracking-wider">Конфиденциальность</ReactRouterDOM.Link></li>
            <li><ReactRouterDOM.Link to="/dmca" className="text-zinc-500 hover:text-white transition-colors text-[13px] font-bold no-underline uppercase tracking-wider">Правообладателям (DMCA)</ReactRouterDOM.Link></li>
          </ul>
        </div>

        {/* Column 2: DISCOVER */}
        <div className="flex flex-col gap-8">
          <h4 className="text-white font-black text-[11px] uppercase tracking-[0.4em]">ОБЗОР</h4>
          <ul className="flex flex-col gap-4 p-0 m-0 list-none">
            <li><ReactRouterDOM.Link to="/" className="text-zinc-500 hover:text-white transition-colors text-[13px] font-bold no-underline uppercase tracking-wider">Каталог игр</ReactRouterDOM.Link></li>
            <li><ReactRouterDOM.Link to="/rules" className="text-zinc-500 hover:text-white transition-colors text-[13px] font-bold no-underline uppercase tracking-wider">Правила сообщества</ReactRouterDOM.Link></li>
          </ul>
        </div>

        {/* Column 3: SUPPORT */}
        <div className="flex flex-col gap-8">
          <h4 className="text-white font-black text-[11px] uppercase tracking-[0.4em]">АВТОРАМ</h4>
          <ul className="flex flex-col gap-4 p-0 m-0 list-none">
            <li><ReactRouterDOM.Link to="/publish-rules" className="text-zinc-500 hover:text-white transition-colors text-[13px] font-bold no-underline uppercase tracking-wider">Регламент публикации</ReactRouterDOM.Link></li>
            <li><ReactRouterDOM.Link to="/create-project" className="text-zinc-500 hover:text-white transition-colors text-[13px] font-bold no-underline uppercase tracking-wider">Создать проект</ReactRouterDOM.Link></li>
            <li><ReactRouterDOM.Link to="/faq" className="text-zinc-500 hover:text-white transition-colors text-[13px] font-bold no-underline uppercase tracking-wider">База знаний</ReactRouterDOM.Link></li>
          </ul>
        </div>

        {/* Column 4: SOCIALS */}
        <div className="flex flex-col gap-8 lg:items-end">
          <h4 className="text-white font-black text-[11px] uppercase tracking-[0.4em]">КОНТАКТЫ</h4>
          <div className="flex flex-col lg:items-end gap-2 text-[13px] font-bold text-zinc-500 leading-relaxed uppercase tracking-tight">
            <span>support@modnex.project</span>
            <span>abuse@modnex.project</span>
            <span className="mt-4 opacity-40 text-[9px]">г. Москва, ул. Цифровая, д. 404<br />БЦ "Моднекс Хаб"</span>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1400px] mx-auto pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-2xl font-black tracking-tighter text-white uppercase">
          MODNEX
        </div>

        <div className="flex flex-col md:items-end gap-2">
          <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">Copyright © 2026 Modnex Project. Все права защищены.</p>
          <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.3em]">Разработано для геймеров, создано авторами.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
