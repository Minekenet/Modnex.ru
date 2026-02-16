import client from './client';

export const usersService = {
    getProfile: async (username: string) => {
        const { data } = await client.get(`/users/${username}`);
        return data;
    },

    getUserItems: async (username: string, page: number = 1, limit: number = 20) => {
        const { data } = await client.get(`/users/${username}/items`, {
            params: { page, limit }
        });
        return data;
    },

    updateProfile: async (data: { display_name?: string; bio?: string; avatar_url?: string; banner_url?: string }) => {
        const token = localStorage.getItem('token');
        const { data: updatedUser } = await client.put('/users/me', data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        // Update local storage user data if needed
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...updatedUser }));
        return updatedUser;
    },

    getMe: async () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const { data } = await client.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return data;
    },

    getFavorites: async () => {
        const { data } = await client.get('/users/me/favorites');
        return data;
    },

    addFavorite: async (gameId: string) => {
        const { data } = await client.post(`/users/me/favorites/${gameId}`);
        return data;
    },

    removeFavorite: async (gameId: string) => {
        const { data } = await client.delete(`/users/me/favorites/${gameId}`);
        return data;
    }
};
