
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import GamePage from './pages/GamePage';
import ModDetailsPage from './pages/ModDetailsPage';
import ProfilePage from './pages/ProfilePage';
import SuggestModal from './components/SuggestModal';
import InfoPage from './pages/InfoPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import CreateProjectPage from './pages/CreateProjectPage';
import SupportChat from './components/SupportChat';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hasTicket, setHasTicket] = useState(false);

  useEffect(() => {
    const checkTicket = () => {
      setHasTicket(localStorage.getItem('hasActiveTicket') === 'true');
    };
    
    checkTicket();
    window.addEventListener('ticket_status_changed', checkTicket);
    return () => window.removeEventListener('ticket_status_changed', checkTicket);
  }, []);

  const toggleFavorite = (gameId: string) => {
    setFavorites(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId) 
        : [...prev, gameId]
    );
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
                onToggleFavorite={toggleFavorite} 
              />
            } 
          />
          <ReactRouterDOM.Route path="/auth" element={<AuthPage />} />
          <ReactRouterDOM.Route path="/profile" element={<ProfilePage />} />
          
          {/* SEO Optimized Routes */}
          <ReactRouterDOM.Route 
            path="/game/:gameSlug" 
            element={
              <GamePage 
                favorites={favorites} 
                onToggleFavorite={toggleFavorite} 
              />
            } 
          />
          <ReactRouterDOM.Route 
            path="/game/:gameSlug/:categorySlug" 
            element={
              <GamePage 
                favorites={favorites} 
                onToggleFavorite={toggleFavorite} 
              />
            } 
          />
          <ReactRouterDOM.Route path="/game/:gameSlug/mod/:modId" element={<ModDetailsPage />} />
          
          <ReactRouterDOM.Route path="/privacy" element={<InfoPage type="privacy" />} />
          <ReactRouterDOM.Route path="/rules" element={<InfoPage type="rules" />} />
          <ReactRouterDOM.Route path="/publish-rules" element={<InfoPage type="publish" />} />
          <ReactRouterDOM.Route path="/dmca" element={<InfoPage type="dmca" />} />
          <ReactRouterDOM.Route path="/terms" element={<InfoPage type="terms" />} />
          
          <ReactRouterDOM.Route path="/faq" element={<KnowledgeBasePage />} />
          <ReactRouterDOM.Route path="/create-project" element={<CreateProjectPage />} />
          
          <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to="/" replace />} />
        </ReactRouterDOM.Routes>
      </main>

      <Footer />
      <SuggestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <SupportChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Плавающая кнопка чата поддержки */}
      {hasTicket && (
        <div className="fixed bottom-8 right-8 z-[90] animate-in fade-in slide-in-from-bottom-8 duration-500">
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:scale-110 transition-all border-none cursor-pointer relative ${
              isChatOpen ? 'bg-blue-600 text-white' : 'bg-white text-zinc-950'
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
