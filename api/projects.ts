
import api from './client';
import { Project } from '../types';

export const projectsService = {
    async getAll(gameSlug: string, sectionSlug?: string, filters: Record<string, any> = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });

        // Backend route: GET /games/:game_slug/:section_slug
        const url = sectionSlug
            ? `/games/${gameSlug}/${sectionSlug}`
            : `/games/${gameSlug}/items`; // Note: backend items list is actually handled by the service

        const response = await api.get(url, { params });
        return response.data;
    },

    async getBySlug(gameSlug: string, sectionSlug: string, projectSlug: string) {
        // Backend route: GET /games/:game_slug/:section_slug/:item_slug
        const response = await api.get(`/games/${gameSlug}/${sectionSlug}/${projectSlug}`);
        return response.data;
    },

    async create(gameSlug: string, sectionSlug: string, data: any) {
        // Backend route: POST /games/:game_slug/:section_slug
        const response = await api.post(`/games/${gameSlug}/${sectionSlug}`, data);
        return response.data;
    }
};
