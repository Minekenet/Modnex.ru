import api from './client';
import { Game } from '../types';

export const gamesService = {
    async getAll(params: { q?: string } = {}) {
        const response = await api.get<Game[]>('/games', { params });
        return response.data;
    },

    async getBySlug(slug: string) {
        const response = await api.get<Game & { sections: any[] }>(`/games/${slug}`);
        return response.data;
    }
};
