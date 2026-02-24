import api from './client';

export const reportsService = {
    async create(data: { item_id: string; reason: string; comment?: string }) {
        const response = await api.post('/reports', data);
        return response.data;
    }
};
