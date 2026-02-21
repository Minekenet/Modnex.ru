
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import GamePage from './pages/GamePage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ProfilePage from './pages/ProfilePage';
import SuggestModal from './components/SuggestModal';
import InfoPage from './pages/InfoPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import CreateProjectPage from './pages/CreateProjectPage';
import SupportChat from './components/SupportChat';
import AdminPage from './pages/AdminPage';

import { usersService } from './api/users';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(!localStorage.getItem('cookiesAccepted'));
  if (!isVisible) return null;
  return (
    <div className="fixed bottom-10 left-10 z-[200] animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white rounded-[32px] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.15)] flex items-center gap-8 max-w-[600px]">
        {/* Premium Cookie Icon */}
        <div className="w-20 h-20 shrink-0 relative animate-bounce duration-[3000ms]">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
            <circle cx="50" cy="50" r="45" fill="#f4d4a8" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="#d9b685" strokeWidth="2" strokeDasharray="5 5" />
            {/* Chocolate Chips */}
            <circle cx="35" cy="35" r="4" fill="#5c4033" />
            <circle cx="65" cy="40" r="4" fill="#5c4033" />
            <circle cx="50" cy="65" r="5" fill="#5c4033" />
            <circle cx="28" cy="62" r="3" fill="#5c4033" />
            <circle cx="72" cy="70" r="4" fill="#5c4033" />
          </svg>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="text-[18px] font-black text-zinc-950 uppercase tracking-tight leading-none">
            Мы уважаем ваш выбор
          </h4>
          <p className="text-[12px] text-zinc-500 font-bold leading-relaxed m-0 uppercase tracking-[0.05em]">
            MODNEX использует файлы cookie и осуществляет <ReactRouterDOM.Link to="/privacy" className="text-zinc-950 hover:underline decoration-blue-500 underline-offset-4">обработку персональных данных</ReactRouterDOM.Link> согласно 152-ФЗ, чтобы сайт работал как швейцарские часы.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => {
                localStorage.setItem('cookiesAccepted', 'true');
                setIsVisible(false);
              }}
              className="px-10 py-4 bg-zinc-950 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 transition-all hover:scale-105 active:scale-95 cursor-pointer border-none shadow-xl shadow-zinc-950/20"
            >
              СОГЛАСЕН
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="px-6 py-4 bg-transparent text-zinc-400 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:text-zinc-600 transition-all cursor-pointer border-none"
            >
              ПОДРОБНЕЕ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useAuthStore } from './stores/authStore';
import { useFavoritesStore } from './stores/favoritesStore';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { isLoggedIn, checkAuth } = useAuthStore();
  const { favorites, loadFavorites, toggleFavorite, syncFavorites } = useFavoritesStore();

  useEffect(() => {
    checkAuth();
    loadFavorites(isLoggedIn);

    const onAuthChange = () => {
      checkAuth();
      loadFavorites(!!localStorage.getItem('token'));
    };

    window.addEventListener('storage', onAuthChange);
    window.addEventListener('auth_state_changed', onAuthChange);
    return () => {
      window.removeEventListener('storage', onAuthChange);
      window.removeEventListener('auth_state_changed', onAuthChange);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      syncFavorites();
    }
  }, [isLoggedIn]);

  const handleToggleFavorite = (gameId: string) => {
    toggleFavorite(gameId, isLoggedIn);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1c1c1f]">
      <Header />

      <main className="flex-grow pt-16">
        <ReactRouterDOM.Routes>
          <ReactRouterDOM.Route
            path="/"
            element={
              <HomePage
                onSuggestClick={() => setIsModalOpen(true)}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            }
          />
          <ReactRouterDOM.Route path="/auth" element={<AuthPage />} />
          <ReactRouterDOM.Route path="/profile" element={<ProfilePage />} />
          <ReactRouterDOM.Route path="/user/:username" element={<ProfilePage />} />

          {/* SEO Optimized Routes - Human-readable URLs */}
          <ReactRouterDOM.Route
            path="/game/:gameSlug"
            element={
              <GamePage
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            }
          />
          <ReactRouterDOM.Route
            path="/game/:gameSlug/:categorySlug"
            element={
              <GamePage
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            }
          />
          {/* New format: /game/:gameSlug/:categorySlug/:projectSlug (removed /project/) */}
          <ReactRouterDOM.Route path="/game/:gameSlug/:categorySlug/:projectSlug" element={<ProjectDetailsPage />} />

          <ReactRouterDOM.Route path="/privacy" element={<InfoPage type="privacy" />} />
          <ReactRouterDOM.Route path="/rules" element={<InfoPage type="rules" />} />
          <ReactRouterDOM.Route path="/publish-rules" element={<InfoPage type="publish" />} />
          <ReactRouterDOM.Route path="/dmca" element={<InfoPage type="dmca" />} />
          <ReactRouterDOM.Route path="/terms" element={<InfoPage type="terms" />} />

          <ReactRouterDOM.Route path="/faq" element={<KnowledgeBasePage />} />
          <ReactRouterDOM.Route path="/create-project" element={<CreateProjectPage />} />
          <ReactRouterDOM.Route path="/admin" element={<AdminPage />} />

          <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to="/" replace />} />
        </ReactRouterDOM.Routes>
      </main>

      <Footer />
      <SuggestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <SupportChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <CookieBanner />

      {/* Плавающая кнопка чата поддержки (для авторизованных) */}
      {isLoggedIn && (
        <div className="fixed bottom-8 right-8 z-[90] animate-in fade-in slide-in-from-bottom-8 duration-500">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:scale-110 transition-all border-none cursor-pointer relative ${isChatOpen ? 'bg-blue-600 text-white' : 'bg-white text-zinc-950'
              }`}
          >
            {isChatOpen ? (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            )}
            {!isChatOpen && <div className="absolute top-0 right-0 w-5 h-5 bg-blue-500 border-4 border-[#1c1c1f] rounded-full animate-pulse"></div>}
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
