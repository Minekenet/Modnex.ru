import React, { useState } from 'react';
import { suggestionsService } from '../api/suggestions';

interface SuggestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuggestModal: React.FC<SuggestModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await suggestionsService.suggestGame({ title: title.trim(), link: link.trim() || undefined, comment: comment.trim() || undefined });
      onClose();
      setTitle('');
      setLink('');
      setComment('');
      alert('Спасибо! Ваше предложение отправлено на модерацию.');
    } catch (err) {
      console.error(err);
      alert('Не удалось отправить. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative bg-[#24262b] w-full max-w-[500px] rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/[0.05] animate-in zoom-in-95 fade-in duration-300">
        <div className="p-10 md:p-12">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Предложить игру</h2>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-2">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-white uppercase tracking-[0.3em] ml-1">Название игры</label>
              <input 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text" 
                placeholder="Напр: S.T.A.L.K.E.R. 2" 
                className="w-full bg-[#1a1b23] text-white py-5 px-6 rounded-2xl border-none outline-none placeholder:text-zinc-600 font-bold focus:bg-[#20212b] transition-all text-[15px]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-white uppercase tracking-[0.3em] ml-1">Ссылка (Steam / Epic)</label>
              <input 
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://store.steampowered.com/..." 
                className="w-full bg-[#1a1b23] text-white py-5 px-6 rounded-2xl border-none outline-none placeholder:text-zinc-600 font-bold focus:bg-[#20212b] transition-all text-[15px]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-white uppercase tracking-[0.3em] ml-1">Ваш комментарий</label>
              <textarea 
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Почему мы должны её добавить?" 
                className="w-full bg-[#1a1b23] text-white py-5 px-6 rounded-2xl border-none outline-none placeholder:text-zinc-600 font-bold focus:bg-[#20212b] transition-all text-[15px] resize-none"
              />
            </div>
            
            <div className="pt-6">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-white text-zinc-950 font-black py-5 rounded-2xl hover:bg-zinc-200 transition-all uppercase tracking-widest text-[13px] border-none cursor-pointer shadow-xl active:scale-[0.97] disabled:opacity-50"
              >
                {loading ? 'Отправка...' : 'Отправить в каталог'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuggestModal;
