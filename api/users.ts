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

    updateProfile: async (data: { display_name?: string; bio?: string; avatar_url?: string; banner_url?: string; links?: any[] }) => {
        const token = localStorage.getItem('token');
        const { data: updatedUser } = await client.put('/users/me', data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        // Update local storage user data if needed
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...updatedUser }));
        window.dispatchEvent(new Event('auth_state_changed'));
        return updatedUser;
    },

    uploadImage: async (type: 'avatar' | 'banner', fileBlob: Blob, filename: string) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', fileBlob, filename);

        const { data } = await client.post(`/users/me/images?type=${type}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        // Update local storage user data
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser };
        if (type === 'avatar') updatedUser.avatar_url = data.url;
        else updatedUser.banner_url = data.url;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('auth_state_changed'));

        return data as { url: string };
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
    },

    mergeFavorites: async (gameIds: string[]) => {
        const { data } = await client.post('/users/me/favorites/merge', { gameIds });
        return data;
    },

    checkUsername: async (username: string) => {
        const token = localStorage.getItem('token');
        const { data } = await client.get('/users/me/check-username', {
            params: { username },
            headers: { Authorization: `Bearer ${token}` }
        });
        return data as { available: boolean };
    },

    updateUsername: async (username: string) => {
        const token = localStorage.getItem('token');
        const { data: updatedUser } = await client.patch('/users/me/username', { username }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...updatedUser }));
        window.dispatchEvent(new Event('auth_state_changed'));
        return updatedUser;
    },

    updateEmail: async (email: string) => {
        const token = localStorage.getItem('token');
        const { data: updatedUser } = await client.patch('/users/me/email', { email }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...updatedUser }));
        window.dispatchEvent(new Event('auth_state_changed'));
        return updatedUser;
    },

    updatePassword: async (currentPassword: string, newPassword: string) => {
        const token = localStorage.getItem('token');
        const { data } = await client.patch('/users/me/password', { current_password: currentPassword, new_password: newPassword }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return data;
    },

    deleteAccount: async (password: string) => {
        const token = localStorage.getItem('token');
        const { data } = await client.request({
            method: 'DELETE',
            url: '/users/me',
            data: { password },
            headers: { Authorization: `Bearer ${token}` }
        });
        return data;
    }
};
