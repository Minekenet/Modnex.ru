
import React from 'react';

interface StepMediaProps {
    gallery: { file: File; preview: string; isPrimary: boolean }[];
    setGallery: (val: { file: File; preview: string; isPrimary: boolean }[]) => void;
    handleGalleryUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const StepMedia: React.FC<StepMediaProps> = ({
    gallery, setGallery, handleGalleryUpload
}) => {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gallery.map((img, i) => (
                    <div key={i} className="aspect-video relative rounded-2xl overflow-hidden group bg-zinc-900/40">
                        <img src={img.preview} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                onClick={() => {
                                    const next = [...gallery];
                                    next.forEach(g => g.isPrimary = false);
                                    next[i].isPrimary = true;
                                    setGallery(next);
                                }}
                                className={`p-2 rounded-lg transition-all ${img.isPrimary ? 'bg-blue-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            >
                                ★
                            </button>
                            <button
                                onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))}
                                className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-500 transition-all"
                            >
                                ✕
                            </button>
                        </div>
                        {img.isPrimary && (
                            <div className="absolute top-2 left-2 bg-blue-600 text-[8px] font-black uppercase px-2 py-1 rounded-md tracking-widest shadow-lg">Обложка</div>
                        )}
                    </div>
                ))}
                <label className="aspect-video bg-[#161617] border-2 border-dashed border-white/[0.03] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-600/5 transition-all group">
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryUpload} />
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <span className="text-xl">+</span>
                    </div>
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Добавить</span>
                </label>
            </div>
            <div className="bg-blue-600/5 p-6 rounded-2xl">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">Совет</h4>
                <p className="text-blue-200/40 text-xs leading-relaxed">Первое загруженное изображение автоматически становится обложкой. Вы можете изменить это, нажав на иконку звезды.</p>
            </div>
        </div>
    );
};
