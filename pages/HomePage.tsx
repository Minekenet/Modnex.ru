
import React from 'react';
import Hero from '../components/Hero';
import GamesSection from '../components/GamesSection';
import CommunitySection from '../components/CommunitySection';

interface HomePageProps {
  onSuggestClick: () => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSuggestClick, favorites, onToggleFavorite }) => {
  return (
    <>
      <Hero />
      <GamesSection 
        onSuggestClick={onSuggestClick} 
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
      />
      <CommunitySection />
    </>
  );
};

export default HomePage;
