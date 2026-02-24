import api from './client';

export interface GlobalStats {
    modsCount: number;
    downloadsCount: number;
    heroBackgroundUrl?: string | null;
}

export const statsService = {
    async getGlobalStats(): Promise<GlobalStats> {
        const response = await api.get<GlobalStats>('/stats');
        return response.data;
    }
};
