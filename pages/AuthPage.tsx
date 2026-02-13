
import React, { useState, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';

type AuthMode = 'login' | 'register' | 'forgot-password' | 'verify-code' | 'new-password';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [prevMode, setPrevMode] = useState<AuthMode>('login');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = ReactRouterDOM.useNavigate();
  const codeInputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value !== '' && index < 5) codeInputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      codeInputs.current[index - 1]?.focus();
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      navigate('/profile');
    } else if (mode === 'register' || mode === 'forgot-password') {
      setPrevMode(mode);
      setMode('verify-code');
    } else if (mode === 'verify-code') {
      prevMode === 'forgot-password' ? setMode('new-password') : navigate('/profile');
    } else if (mode === 'new-password') {
      setMode('login');
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Вход через ${provider}...`);
    navigate('/profile');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#1a1b1e] p-6 font-['Inter',_sans-serif]">
      <div className="w-full max-w-[420px] bg-[#24262b] rounded-[32px] p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-500 border border-white/[0.02]">
        
        {/* Заголовок */}
        <div className="text-left mb-8">
          <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-none">
            {mode === 'login' && 'Войти через'}
            {mode === 'register' && 'Регистрация'}
            {mode === 'forgot-password' && 'Сброс пароля'}
            {mode === 'verify-code' && 'Подтверждение'}
            {mode === 'new-password' && 'Новый пароль'}
          </h2>
        </div>

        {/* Соцсети */}
        {(mode === 'login' || mode === 'register') && (
          <div className="grid grid-cols-2 gap-3 mb-10">
            <button 
              onClick={() => handleSocialLogin('Google')}
              className="flex items-center gap-3 px-5 py-4 bg-[#2e333a] hover:bg-[#383d46] rounded-2xl border-none cursor-pointer transition-all active:scale-95 group"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-[14px] font-black text-zinc-300 uppercase tracking-widest">Google</span>
            </button>
            <button 
              onClick={() => handleSocialLogin('Yandex')}
              className="flex items-center gap-3 px-5 py-4 bg-[#2e333a] hover:bg-[#383d46] rounded-2xl border-none cursor-pointer transition-all active:scale-95 group"
            >
              <div className="w-5 h-5 bg-[#ff0000] rounded-full flex items-center justify-center text-white font-black text-[10px]">Я</div>
              <span className="text-[14px] font-black text-zinc-300 uppercase tracking-widest">Яндекс</span>
            </button>
          </div>
        )}

        {(mode === 'login' || mode === 'register') && (
          <div className="text-left mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Или через пароль</h2>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleAuthSubmit}>
          {(mode === 'login' || mode === 'register' || mode === 'forgot-password' || mode === 'new-password') && (
            <div className="space-y-3">
              {mode === 'register' && (
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <input type="text" placeholder="Логин" required className="w-full h-16 bg-[#2e333a] text-white pl-14 pr-6 rounded-2xl border-none outline-none placeholder:text-zinc-600 font-bold focus:bg-[#383d46] transition-all text-[15px]" />
                </div>
              )}
              
              {mode !== 'new-password' && (
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <input type="email" placeholder="Электронная почта" required className="w-full h-16 bg-[#2e333a] text-white pl-14 pr-6 rounded-2xl border-none outline-none placeholder:text-zinc-600 font-bold focus:bg-[#383d46] transition-all text-[15px]" />
                </div>
              )}

              {(mode === 'login' || mode === 'register' || mode === 'new-password') && (
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder={mode === 'new-password' ? "Придумайте новый пароль" : "Пароль"} 
                    required 
                    className="w-full h-16 bg-[#2e333a] text-white pl-14 pr-14 rounded-2xl border-none outline-none placeholder:text-zinc-600 font-bold focus:bg-[#383d46] transition-all text-[15px]" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-1">
                    {showPassword ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L1 1m11.939 12.061l7.939 7.939" /></svg>}
                  </button>
                </div>
              )}

              {mode === 'new-password' && (
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <input type="password" placeholder="Повторите новый пароль" required className="w-full h-16 bg-[#2e333a] text-white pl-14 pr-6 rounded-2xl border-none outline-none placeholder:text-zinc-600 font-bold focus:bg-[#383d46] transition-all text-[15px]" />
                </div>
              )}
            </div>
          )}

          {mode === 'verify-code' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <p className="text-zinc-400 text-sm font-medium text-center">Код отправлен на вашу почту.<br/>Введите 6 цифр подтверждения.</p>
              <div className="flex justify-between gap-2.5">
                {code.map((num, i) => (
                  <input key={i} ref={el => { codeInputs.current[i] = el; }} type="text" maxLength={1} value={num} onChange={(e) => handleCodeChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)} className="w-full aspect-square bg-[#2e333a] border-none rounded-2xl text-center text-3xl font-black text-white outline-none focus:bg-[#383d46] transition-all" />
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center pt-8">
            <button 
              type="submit" 
              className="flex items-center gap-3 px-12 py-5 bg-[#3e3f47] hover:bg-white hover:text-black text-white font-black rounded-2xl transition-all border-none cursor-pointer active:scale-95 shadow-lg group/btn"
            >
              <span className="text-[16px] uppercase tracking-wider">
                {mode === 'login' ? 'Войти сейчас' : mode === 'register' ? 'Регистрация' : mode === 'new-password' ? 'Обновить пароль' : 'Продолжить'}
              </span>
              <svg className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        </form>

        <div className="mt-12 flex items-center justify-center gap-2">
          {mode === 'login' && (
            <>
              <button onClick={() => setMode('forgot-password')} className="text-[#58a6ff] hover:underline text-[14px] font-bold border-none bg-transparent cursor-pointer">Забыли пароль?</button>
              <span className="text-zinc-700 font-bold">•</span>
              <button onClick={() => setMode('register')} className="text-[#58a6ff] hover:underline text-[14px] font-bold border-none bg-transparent cursor-pointer">Создать аккаунт</button>
            </>
          )}
          {mode !== 'login' && (
            <button onClick={() => setMode('login')} className="text-[#58a6ff] hover:underline text-[14px] font-bold border-none bg-transparent cursor-pointer">Вернуться ко входу</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
