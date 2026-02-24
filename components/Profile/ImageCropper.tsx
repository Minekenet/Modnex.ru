import React from 'react';

interface ImageCropperProps {
    isCropOpen: boolean;
    setIsCropOpen: (val: boolean) => void;
    cropType: 'avatar' | 'banner';
    tempImageUrl: string;
    cropBox: { x: number; y: number; width: number; height: number };
    handleMouseDown: (e: React.MouseEvent, type: 'move' | 'nw' | 'ne' | 'sw' | 'se') => void;
    imageRef: React.RefObject<HTMLImageElement>;
    cropperContainerRef: React.RefObject<HTMLDivElement>;
    onImageLoad: () => void;
    saveCroppedImage: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
    isCropOpen,
    setIsCropOpen,
    cropType,
    tempImageUrl,
    cropBox,
    handleMouseDown,
    imageRef,
    cropperContainerRef,
    onImageLoad,
    saveCroppedImage
}) => {
    if (!isCropOpen) return null;

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 select-none overflow-hidden bg-black/98">
            <div className="absolute inset-0" onClick={() => setIsCropOpen(false)}></div>
            <div className="relative bg-[#1c1c21] w-full max-w-4xl rounded-[40px] overflow-hidden shadow-[0_60px_150px_rgba(0,0,0,0.9)] border border-white/5 animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#232329]">
                    <h2 className="text-2xl font-black uppercase tracking-tighter m-0 text-white/90">
                        {cropType === 'avatar' ? 'Обрезка аватара' : 'Обрезка баннера'}
                    </h2>
                    <button onClick={() => setIsCropOpen(false)} className="bg-white/5 hover:bg-white/10 text-white rounded-full w-12 h-12 flex items-center justify-center border-none cursor-pointer transition-all">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Main Editor Area */}
                <div className="p-0 bg-[#070708] relative flex items-center justify-center h-[550px] overflow-hidden">
                    <div ref={cropperContainerRef} className="relative inline-block border border-white/10">
                        {/* Original Image Background */}
                        <img
                            ref={imageRef}
                            src={tempImageUrl}
                            onLoad={onImageLoad}
                            className="max-h-[480px] w-auto block select-none pointer-events-none"
                            alt="Original"
                            onDragStart={(e) => e.preventDefault()}
                        />

                        {/* Darkened area (Overlay) */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                            <div className="absolute top-0 left-0 right-0 bg-black/85" style={{ height: `${cropBox.y}%` }}></div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/85" style={{ height: `${100 - cropBox.y - cropBox.height}%` }}></div>
                            <div className="absolute left-0 bg-black/85" style={{ top: `${cropBox.y}%`, height: `${cropBox.height}%`, width: `${cropBox.x}%` }}></div>
                            <div className="absolute right-0 bg-black/85" style={{ top: `${cropBox.y}%`, height: `${cropBox.height}%`, width: `${100 - cropBox.x - cropBox.width}%` }}></div>
                        </div>

                        {/* Selection Box (Hole) */}
                        <div
                            className={`absolute cursor-move border-[4px] border-[#3b82f6] box-border shadow-[0_0_0_2px_rgba(0,0,0,0.6)] z-20 ${cropType === 'avatar' ? 'rounded-full' : ''}`}
                            style={{ top: `${cropBox.y}%`, left: `${cropBox.x}%`, width: `${cropBox.width}%`, height: `${cropBox.height}%` }}
                            onMouseDown={(e) => handleMouseDown(e, 'move')}
                        >
                            {/* Visual content hole */}
                            <div className={`w-full h-full overflow-hidden pointer-events-none relative ${cropType === 'avatar' ? 'rounded-full' : ''}`}>
                                <img
                                    src={tempImageUrl}
                                    className="absolute max-w-none"
                                    style={{
                                        top: `-${(cropBox.y / 100) * (imageRef.current?.height || 0)}px`,
                                        left: `-${(cropBox.x / 100) * (imageRef.current?.width || 0)}px`,
                                        width: `${imageRef.current?.width}px`,
                                        height: `${imageRef.current?.height}px`
                                    }}
                                    alt=""
                                />
                            </div>

                            {/* Corner Handles - Sharp White Squares with Blue Border */}
                            <div className="absolute -top-4 -left-4 w-9 h-9 bg-white border-[4px] border-[#3b82f6] cursor-nw-resize z-50 shadow-2xl" onMouseDown={(e) => handleMouseDown(e, 'nw')}></div>
                            <div className="absolute -top-4 -right-4 w-9 h-9 bg-white border-[4px] border-[#3b82f6] cursor-ne-resize z-50 shadow-2xl" onMouseDown={(e) => handleMouseDown(e, 'ne')}></div>
                            <div className="absolute -bottom-4 -left-4 w-9 h-9 bg-white border-[4px] border-[#3b82f6] cursor-sw-resize z-50 shadow-2xl" onMouseDown={(e) => handleMouseDown(e, 'sw')}></div>
                            <div className="absolute -bottom-4 -right-4 w-9 h-9 bg-white border-[4px] border-[#3b82f6] cursor-se-resize z-50 shadow-2xl" onMouseDown={(e) => handleMouseDown(e, 'se')}></div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 flex justify-end gap-6 border-t border-white/5 bg-[#232329]">
                    <button onClick={() => setIsCropOpen(false)} className="bg-white/5 hover:bg-white/10 text-white px-14 py-5 rounded-2xl font-black uppercase tracking-widest text-[12px] border-none cursor-pointer transition-all active:scale-95">
                        Отмена
                    </button>
                    <button onClick={saveCroppedImage} className="bg-white text-zinc-950 hover:bg-zinc-200 px-14 py-5 rounded-2xl font-black uppercase tracking-widest text-[12px] border-none cursor-pointer transition-all active:scale-95 shadow-2xl">
                        Готово
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropper;
