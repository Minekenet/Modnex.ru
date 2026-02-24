import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { usersService } from '../api/users';
import { useAuthStore } from '../stores/authStore';

const SettingsPage: React.FC = () => {
  const navigate = ReactRouterDOM.useNavigate();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuccess, setUsernameSuccess] = useState(false);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setUsername(user.username || '');
    setEmail((user as any).email || '');
  }, [user, navigate]);

  const handleCheckUsername = async () => {
    const trimmed = username.trim();
    if (trimmed.length < 2) {
      setUsernameError('Минимум 2 символа');
      return;
    }
    if (trimmed === user?.username) {
      setUsernameError('');
      return;
    }
    try {
      const { available } = await usersService.checkUsername(trimmed);
      if (!available) setUsernameError('Никнейм уже занят');
      else setUsernameError('');
    } catch {
      setUsernameError('Ошибка проверки');
    }
  };

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError('');
    setUsernameSuccess(false);
    const trimmed = username.trim();
    if (trimmed.length < 2) {
      setUsernameError('Минимум 2 символа');
      return;
    }
    if (trimmed === user?.username) return;
    setLoading(true);
    try {
      await usersService.updateUsername(trimmed);
      setUsernameSuccess(true);
    } catch (err: any) {
      setUsernameError(err.response?.data?.error || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess(false);
    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError('Введите email');
      return;
    }
    setLoading(true);
    try {
      await usersService.updateEmail(trimmed);
      setEmailSuccess(true);
    } catch (err: any) {
      setEmailError(err.response?.data?.error || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    if (!currentPassword || !newPassword) {
      setPasswordError('Заполните текущий и новый пароль');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Новый пароль минимум 6 символов');
      return;
    }
    setLoading(true);
    try {
      await usersService.updatePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || 'Ошибка смены пароля');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');
    if (!deletePassword) {
      setDeleteError('Введите пароль');
      return;
    }
    setLoading(true);
    try {
      await usersService.deleteAccount(deletePassword);
      logout();
      setDeleteModalOpen(false);
      navigate('/', { replace: true });
    } catch (err: any) {
      setDeleteError(err.response?.data?.error || 'Ошибка удаления');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#1c1c1f] text-white font-['Inter',_sans-serif] pt-24 pb-20">
      <div className="max-w-[640px] mx-auto px-6">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Настройки аккаунта</h1>
        <p className="text-zinc-500 text-sm mb-10">Управление профилем и безопасностью</p>

        <section className="mb-12">
          <h2 className="text-lg font-bold text-zinc-300 mb-4">Никнейм</h2>
          <form onSubmit={handleSaveUsername} className="space-y-3">
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setUsernameError(''); setUsernameSuccess(false); }}
              onBlur={handleCheckUsername}
              className="w-full bg-[#24262b] border border-white/10 rounded-xl px-4 py-3 text-white font-medium outline-none focus:border-white/20"
              placeholder="Никнейм"
            />
            {usernameError && <p className="text-red-400 text-sm">{usernameError}</p>}
            {usernameSuccess && <p className="text-green-400 text-sm">Никнейм обновлён</p>}
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl border-none cursor-pointer hover:bg-blue-500 disabled:opacity-50">
              Сохранить
            </button>
          </form>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-bold text-zinc-300 mb-4">Email</h2>
          <form onSubmit={handleSaveEmail} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); setEmailSuccess(false); }}
              className="w-full bg-[#24262b] border border-white/10 rounded-xl px-4 py-3 text-white font-medium outline-none focus:border-white/20"
              placeholder="Email"
            />
            {emailError && <p className="text-red-400 text-sm">{emailError}</p>}
            {emailSuccess && <p className="text-green-400 text-sm">Email обновлён</p>}
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl border-none cursor-pointer hover:bg-blue-500 disabled:opacity-50">
              Сохранить
            </button>
          </form>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-bold text-zinc-300 mb-4">Смена пароля</h2>
          <form onSubmit={handleSavePassword} className="space-y-3">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-[#24262b] border border-white/10 rounded-xl px-4 py-3 text-white font-medium outline-none focus:border-white/20"
              placeholder="Текущий пароль"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#24262b] border border-white/10 rounded-xl px-4 py-3 text-white font-medium outline-none focus:border-white/20"
              placeholder="Новый пароль"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#24262b] border border-white/10 rounded-xl px-4 py-3 text-white font-medium outline-none focus:border-white/20"
              placeholder="Повторите новый пароль"
            />
            {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
            {passwordSuccess && <p className="text-green-400 text-sm">Пароль изменён</p>}
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl border-none cursor-pointer hover:bg-blue-500 disabled:opacity-50">
              Сменить пароль
            </button>
          </form>
        </section>

        <section className="pt-8 border-t border-white/10">
          <h2 className="text-lg font-bold text-zinc-300 mb-4">Удаление аккаунта</h2>
          <p className="text-zinc-500 text-sm mb-4">После удаления восстановить аккаунт будет невозможно.</p>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="px-6 py-2.5 bg-red-600/20 text-red-400 text-sm font-bold rounded-xl border border-red-500/30 cursor-pointer hover:bg-red-600/30"
          >
            Удалить аккаунт
          </button>
        </section>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80">
          <div className="bg-[#24262b] rounded-2xl p-8 max-w-md w-full border border-white/10">
            <h3 className="text-xl font-black text-white mb-2">Удаление аккаунта</h3>
            <p className="text-zinc-500 text-sm mb-6">Введите ваш пароль для подтверждения удаления.</p>
            <form onSubmit={handleDeleteAccount}>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl px-4 py-3 text-white font-medium outline-none focus:border-white/20 mb-4"
                placeholder="Пароль"
                autoFocus
              />
              {deleteError && <p className="text-red-400 text-sm mb-4">{deleteError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-red-600 text-white text-sm font-bold rounded-xl border-none cursor-pointer hover:bg-red-500 disabled:opacity-50">
                  Удалить
                </button>
                <button type="button" onClick={() => { setDeleteModalOpen(false); setDeletePassword(''); setDeleteError(''); }} className="flex-1 py-3 bg-white/10 text-zinc-400 text-sm font-bold rounded-xl border-none cursor-pointer hover:bg-white/20">
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
