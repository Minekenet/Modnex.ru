import api from './client';
import { Game } from '../types';

export const gamesService = {
    async getAll() {
        const response = await api.get<Game[]>('/games');
        return response.data;
    },

    async getBySlug(slug: string) {
        const response = await api.get<Game & { sections: any[] }>(`/games/${slug}`);
        return response.data;
    }
};
