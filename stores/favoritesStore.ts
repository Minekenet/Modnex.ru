import { create } from 'zustand';
import { usersService } from '../api/users';

interface FavoritesState {
    favorites: string[];
    isLoading: boolean;
    loadFavorites: (isLoggedIn: boolean) => Promise<void>;
    toggleFavorite: (gameId: string, isLoggedIn: boolean) => Promise<void>;
    syncFavorites: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
    favorites: [],
    isLoading: false,

    loadFavorites: async (isLoggedIn) => {
        set({ isLoading: true });
        try {
            if (isLoggedIn) {
                const favs = await usersService.getFavorites();
                set({ favorites: favs.map((f: any) => f.id) });
            } else {
                const localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
                set({ favorites: localFavs });
            }
        } catch (err) {
            console.error('Failed to load favorites', err);
            const localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
            set({ favorites: localFavs });
        } finally {
            set({ isLoading: false });
        }
    },

    toggleFavorite: async (gameId, isLoggedIn) => {
        const { favorites } = get();
        const isAdding = !favorites.includes(gameId);

        // Optimistic update
        set({
            favorites: isAdding
                ? [...favorites, gameId]
                : favorites.filter(id => id !== gameId)
        });

        if (isLoggedIn) {
            try {
                if (isAdding) {
                    await usersService.addFavorite(gameId);
                } else {
                    await usersService.removeFavorite(gameId);
                }
            } catch (err) {
                console.error('Failed to sync favorite with DB', err);
                // Rollback on error if needed
            }
        } else {
            const localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
            const nextFavs = isAdding
                ? [...localFavs, gameId]
                : localFavs.filter((id: string) => id !== gameId);
            localStorage.setItem('favorites', JSON.stringify(nextFavs));
        }
    },

    syncFavorites: async () => {
        const localFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (localFavs.length > 0) {
            try {
                // Use merge endpoint to combine local and DB favorites (Union, removes duplicates)
                const merged = await usersService.mergeFavorites(localFavs);
                set({ favorites: merged.map((f: any) => f.id) });
                // Clear local storage after successful merge
                localStorage.removeItem('favorites');
            } catch (err) {
                console.error('Failed to merge favorites', err);
                // Fallback: try to load from DB
                try {
                    const favs = await usersService.getFavorites();
                    set({ favorites: favs.map((f: any) => f.id) });
                } catch (loadErr) {
                    console.error('Failed to load favorites from DB', loadErr);
                }
            }
        } else {
            // No local favorites, just load from DB
            try {
                const favs = await usersService.getFavorites();
                set({ favorites: favs.map((f: any) => f.id) });
            } catch (err) {
                console.error('Failed to load favorites', err);
            }
        }
    }
}));
