import { create } from 'zustand';

interface AuthState {
    isLoggedIn: boolean;
    user: any | null;
    login: (token: string, user: any) => void;
    logout: () => void;
    checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isLoggedIn: !!localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),

    login: (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ isLoggedIn: true, user });
        window.dispatchEvent(new Event('auth_state_changed'));
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ isLoggedIn: false, user: null });
        window.dispatchEvent(new Event('auth_state_changed'));
    },

    checkAuth: () => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        set({ isLoggedIn: !!token, user });
    }
}));
