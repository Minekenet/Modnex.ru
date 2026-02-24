
import React, { useState } from 'react';

interface StepDescriptionProps {
    summary: string;
    setSummary: (val: string) => void;
    description: string;
    setDescription: (val: string) => void;
    attributes: Record<string, any>;
    setAttributes: (val: Record<string, any>) => void;
    dynamicFilters: any[];
}

export const StepDescription: React.FC<StepDescriptionProps> = ({
    summary, setSummary, description, setDescription, attributes, setAttributes, dynamicFilters
}) => {
    const [preview, setPreview] = useState(false);

    // Very basic markdown simulation
    const formatPreview = (text: string) => {
        if (!text) return '';
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] block">Краткое описание (Summary)</label>
                <input
                    type="text"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Пара предложений о вашем проекте..."
                    className="w-full bg-[#161617] border-none p-6 rounded-2xl text-white font-bold outline-none focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-zinc-800"
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] block">Полное описание (Поддерживает базовый Markdown)</label>
                    <button
                        onClick={() => setPreview(!preview)}
                        className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-3 py-1 rounded-lg border-none cursor-pointer hover:bg-blue-500/20"
                    >
                        {preview ? 'Редактировать' : 'Предпросмотр'}
                    </button>
                </div>

                {!preview ? (
                    <textarea
                        rows={8}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Опубликуйте историю вашего проекта..."
                        className="w-full bg-[#161617] border-none p-6 rounded-2xl text-white font-medium outline-none focus:ring-4 focus:ring-blue-600/10 transition-all resize-none"
                    />
                ) : (
                    <div
                        className="w-full min-h-[200px] bg-[#161617] p-6 rounded-2xl text-zinc-300 font-medium overflow-auto leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatPreview(description) || '<span class="text-zinc-700 italic">Пусто...</span>' }}
                    />
                )}
            </div>

            {dynamicFilters.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                    {dynamicFilters.map((filter: any) => (
                        <div key={filter.label} className="space-y-4">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] block">{filter.label}</label>
                            {filter.options ? (
                                <div className="relative">
                                    <select
                                        value={attributes[filter.label.toLowerCase().replace(/\s+/g, '_')] || ''}
                                        onChange={(e) => setAttributes({
                                            ...attributes,
                                            [filter.label.toLowerCase().replace(/\s+/g, '_')]: e.target.value
                                        })}
                                        className="w-full bg-[#161617] border-none p-5 rounded-2xl text-white font-bold outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-blue-600/10 transition-all"
                                    >
                                        <option value="">—</option>
                                        {filter.options.map((opt: string) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={attributes[filter.label.toLowerCase().replace(/\s+/g, '_')] || ''}
                                    onChange={(e) => setAttributes({
                                        ...attributes,
                                        [filter.label.toLowerCase().replace(/\s+/g, '_')]: e.target.value
                                    })}
                                    className="w-full bg-[#161617] border-none p-5 rounded-2xl text-white font-bold outline-none focus:ring-4 focus:ring-blue-600/10 transition-all"
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 opacity-40">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] block">ID Версии (Внутренний)</label>
                    <input
                        type="text"
                        value={attributes.version || ''}
                        onChange={(e) => setAttributes({ ...attributes, version: e.target.value })}
                        className="w-full bg-[#161617] border-none p-5 rounded-2xl text-white font-bold outline-none"
                    />
                </div>
            </div>
        </div>
    );
};
