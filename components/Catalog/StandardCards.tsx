
import React from 'react';
import { ViewType } from '../../types';

interface CardProps {
    mod: any;
    gameSlug: string;
    onClick: () => void;
}

export const GridCard: React.FC<CardProps> = ({ mod, onClick }) => (
    <div
        className="bg-[#27292e] rounded-xl overflow-hidden flex flex-col group cursor-pointer border border-white/[0.03] transition-all hover:bg-white/[0.02]"
        onClick={onClick}
    >
        <div className="aspect-video relative overflow-hidden bg-[#1c1c1f]">
            <img
                src={`https://picsum.photos/seed/${mod.id}/600/350`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt={mod.name}
            />
        </div>
        <div className="p-5 flex flex-col gap-2">
            <h3 className="font-bold text-[15px] text-white line-clamp-2 leading-snug">{mod.name}</h3>
            <div className="flex items-center gap-2 mt-2">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-[#1c1c1f]">
                    <img src={`https://i.pravatar.cc/50?u=${mod.author}`} className="w-full h-full object-cover" alt={mod.author} />
                </div>
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-tight">{mod.author}</span>
            </div>
        </div>
    </div>
);

export const CompactCard: React.FC<CardProps> = ({ mod, onClick }) => (
    <div
        className="bg-[#27292e] p-3 rounded-lg flex items-center gap-4 group cursor-pointer border border-white/[0.03] transition-all hover:bg-white/[0.02]"
        onClick={onClick}
    >
        <div className="w-16 h-10 rounded overflow-hidden bg-[#1c1c1f] shrink-0">
            <img src={`https://picsum.photos/seed/${mod.id}/100/600`} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="flex-grow">
            <h3 className="font-bold text-[14px] text-white truncate">{mod.name}</h3>
            <span className="text-[11px] text-zinc-500 uppercase font-black">{mod.author}</span>
        </div>
        <div className="text-[12px] font-bold text-zinc-600">{mod.downloads}</div>
    </div>
);

export const ListCard: React.FC<CardProps> = ({ mod, onClick }) => (
    <div
        className="bg-[#27292e] p-5 rounded-xl flex items-center justify-between group cursor-pointer border border-white/[0.03] transition-all hover:bg-white/[0.02]"
        onClick={onClick}
    >
        <div className="flex items-center gap-6">
            <div className="w-24 h-14 rounded-lg overflow-hidden bg-[#1c1c1f] shrink-0">
                <img src={`https://picsum.photos/seed/${mod.id}/200/120`} className="w-full h-full object-cover" alt="" />
            </div>
            <div>
                <h3 className="font-bold text-[16px] text-white mb-1">{mod.name}</h3>
                <p className="text-[13px] text-zinc-500 line-clamp-1">{mod.desc}</p>
            </div>
        </div>
        <div className="flex items-center gap-10">
            <div className="flex flex-col items-end">
                <span className="text-[11px] text-zinc-600 uppercase font-black tracking-widest">Downloads</span>
                <span className="text-white font-bold">{mod.downloads}</span>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-[11px] text-zinc-600 uppercase font-black tracking-widest">Date</span>
                <span className="text-white font-bold">{mod.relativeDate}</span>
            </div>
        </div>
    </div>
);
