
import React from 'react';

interface StepFilesProps {
    file: File | null;
    setFile: (val: File | null) => void;
    fileAttributes: Record<string, string>;
    setFileAttributes: (updateFn: (prev: Record<string, string>) => Record<string, string>) => void;
    creationConfig: any;
}

export const StepFiles: React.FC<StepFilesProps> = ({
    file, setFile, fileAttributes, setFileAttributes, creationConfig
}) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label
                htmlFor="file-upload"
                className="border-2 border-dashed border-white/5 rounded-3xl p-24 flex flex-col items-center justify-center text-center group hover:border-blue-600/40 hover:bg-blue-600/5 transition-all cursor-pointer"
            >
                <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-600/20 transition-all">
                    <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                </div>
                <h3 className="text-2xl font-black uppercase mb-3 tracking-tight">
                    {file ? file.name : 'Главный файл проекта'}
                </h3>
                <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">
                    {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Drag & drop ZIP, JAR, RAR или нажмите для выбора'}
                </p>
            </label>

            {creationConfig?.file_schema && Array.isArray(creationConfig.file_schema) && (
                <>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Метаданные файла</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {creationConfig.file_schema.map((field: { key: string; label: string; type: string; options?: string[]; required?: boolean }) => (
                            <div key={field.key} className="space-y-4">
                                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest">{field.label}{field.required ? ' *' : ''}</label>
                                {field.type === 'select' && field.options ? (
                                    <div className="relative">
                                        <select
                                            value={fileAttributes[field.key] || ''}
                                            onChange={(e) => setFileAttributes(a => ({ ...a, [field.key]: e.target.value }))}
                                            className="w-full bg-[#161617] border-none p-5 rounded-2xl text-white font-bold outline-none cursor-pointer focus:ring-4 focus:ring-blue-600/10 transition-all appearance-none"
                                        >
                                            <option value="">—</option>
                                            {field.options.map((opt: string) => (
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
                                        value={fileAttributes[field.key] || ''}
                                        onChange={(e) => setFileAttributes(a => ({ ...a, [field.key]: e.target.value }))}
                                        placeholder={field.label}
                                        required={field.required}
                                        className="w-full bg-[#161617] border-none p-5 rounded-2xl text-white font-bold outline-none placeholder:text-zinc-800 transition-all focus:ring-4 focus:ring-blue-600/10"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            <div className="bg-[#161617] p-8 rounded-[24px]">
                <div className="flex gap-4">
                    <div className="w-6 h-6 bg-blue-600/10 rounded flex items-center justify-center shrink-0">
                        <span className="text-blue-500 text-[10px] font-black italic">!</span>
                    </div>
                    <p className="text-zinc-600 text-[13px] leading-relaxed m-0 font-medium">
                        Убедитесь, что ваш файл не содержит вредоносного ПО и соответствует <span className="text-white underline cursor-pointer">нашим стандартам качества</span>. Публикация нарушающего контента приведет к блокировке.
                    </p>
                </div>
            </div>
        </div>
    );
};
