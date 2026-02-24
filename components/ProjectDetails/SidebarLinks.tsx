
import React from 'react';
import SidebarBlock from './SidebarBlock';

interface SidebarLinksProps {
  links?: { label: string; url: string }[];
}

const SidebarLinks: React.FC<SidebarLinksProps> = ({ links = [] }) => {

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      if (domain === 'localhost' || domain === '127.0.0.1') return null;
      return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
    } catch (e) {
      return null;
    }
  };

  if (!links || links.length === 0) return null;

  return (
    <SidebarBlock title="Ссылки">
      <div className="flex flex-col gap-2">
        {links.map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg hover:bg-white/[0.04] transition-all no-underline group"
          >
            <div className="flex items-center gap-4">
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden shrink-0 group-hover:bg-white/10 transition-colors border border-white/5">
                <img
                  src={getFavicon(link.url) || ''}
                  alt=""
                  className="w-5 h-5 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-[13px] font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors">{link.label || link.name}</span>
            </div>
            <svg className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        ))}
      </div>
    </SidebarBlock>
  );
};

export default SidebarLinks;
