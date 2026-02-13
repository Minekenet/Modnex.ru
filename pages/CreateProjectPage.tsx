
import React, { useState } from 'react';
import { GAMES_DATA } from '../constants';

const CreateProjectPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    gameId: '',
    category: '',
    description: ''
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen bg-[#0f0f10] text-white py-24 px-8 font-['Inter',_sans-serif]">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16">
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-6">Создать проект</h1>
          <div className="flex items-center gap-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-2 ${
                  step === s ? 'bg-blue-600 border-blue-600 text-white' : 
                  step > s ? 'bg-green-500 border-green-500 text-white' : 'border-zinc-800 text-zinc-700'
                }`}>
                  {step > s ? '✓' : s}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${step === s ? 'text-white' : 'text-zinc-600'}`}>
                  {s === 1 ? 'Основы' : s === 2 ? 'Описание' : 'Файлы'}
                </span>
              </div>
            ))}
          </div>
        </header>

        <div className="bg-[#1a1b23] rounded-3xl p-12 border border-white/5 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">Название проекта</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Напр: Ultra Realism Pack" 
                  className="w-full bg-[#0f0f10] border-none p-5 rounded-xl text-white font-bold outline-none focus:ring-2 focus:ring-blue-600/30 transition-all placeholder:text-zinc-800"
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">Целевая игра</label>
                <select 
                  value={formData.gameId}
                  onChange={(e) => setFormData({...formData, gameId: e.target.value})}
                  className="w-full bg-[#0f0f10] border-none p-5 rounded-xl text-white font-bold outline-none appearance-none cursor-pointer"
                >
                  <option value="">Выберите игру из списка...</option>
                  {GAMES_DATA.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">Описание (Markdown)</label>
                <textarea 
                  rows={8}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Расскажите о своем моде..." 
                  className="w-full bg-[#0f0f10] border-none p-5 rounded-xl text-white font-medium outline-none focus:ring-2 focus:ring-blue-600/30 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="border-2 border-dashed border-zinc-800 rounded-3xl p-16 flex flex-col items-center justify-center text-center group hover:border-blue-600/40 transition-colors cursor-pointer">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                </div>
                <h3 className="text-xl font-black uppercase mb-2">Перетащите архив здесь</h3>
                <p className="text-zinc-500 font-bold uppercase text-[11px] tracking-widest">ZIP, RAR (Макс. 500MB)</p>
              </div>
              <div className="bg-blue-600/5 border border-blue-600/10 p-6 rounded-2xl">
                 <p className="text-zinc-400 text-[13px] font-medium leading-relaxed">Нажимая кнопку "Завершить", вы подтверждаете согласие с <span className="text-blue-500 font-bold">Правилами публикации</span> и гарантируете авторство загружаемого контента.</p>
              </div>
            </div>
          )}

          <div className="mt-12 flex items-center justify-between">
            {step > 1 && (
              <button onClick={prevStep} className="px-8 py-4 text-zinc-500 font-black uppercase tracking-widest text-[11px] border-none bg-transparent cursor-pointer hover:text-white transition-colors">Назад</button>
            )}
            <button 
              onClick={step === 3 ? () => alert('Проект успешно создан!') : nextStep}
              className="ml-auto bg-blue-600 hover:bg-blue-500 text-white font-black px-12 py-5 rounded-2xl transition-all uppercase tracking-widest text-xs border-none cursor-pointer active:scale-95 shadow-xl"
            >
              {step === 3 ? 'Завершить' : 'Продолжить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage;
