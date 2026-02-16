import api from './client';

export const authService = {
    async login(email: string, password: string) {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },
    async register(username: string, email: string, password: string) {
        const response = await api.post('/auth/register', { username, email, password });
        // After registration, we need a verification step, so don't auto-login here
        return response.data;
    },
    async verify(email: string, code: string) {
        const response = await api.post('/auth/verify', { email, code });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },
    async socialAuth(provider: 'google' | 'yandex', data: any) {
        const response = await api.post('/auth/social', { provider, ...data });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};
