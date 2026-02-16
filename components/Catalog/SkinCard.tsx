
import React from 'react';

interface SkinCardProps {
    mod: any;
    onClick: () => void;
}

export const SkinCard: React.FC<SkinCardProps> = ({ mod, onClick }) => (
    <div
        className="relative aspect-[2/3] rounded-xl overflow-hidden group cursor-pointer border border-white/[0.03] transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
        onClick={onClick}
    >
        <img
            src={`https://picsum.photos/seed/${mod.id}/400/600`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt={mod.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-[14px] text-white truncate drop-shadow-lg">{mod.name}</h3>
            <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-zinc-400 font-medium truncate uppercase tracking-tighter">By {mod.author}</span>
                <span className="text-[10px] text-blue-400 font-black">{mod.downloads}</span>
            </div>
        </div>
    </div>
);
