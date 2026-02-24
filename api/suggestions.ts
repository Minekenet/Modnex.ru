import api from './client';

export const suggestionsService = {
    async suggestGame(data: { title: string; link?: string; comment?: string }) {
        const response = await api.post('/suggestions/game', data);
        return response.data;
    }
};
