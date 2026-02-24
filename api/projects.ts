
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
    },

    async update(gameSlug: string, sectionSlug: string, projectSlug: string, data: { title?: string; summary?: string; description?: string; attributes?: Record<string, any>; status?: string }) {
        const response = await api.patch(`/games/${gameSlug}/${sectionSlug}/${projectSlug}`, data);
        return response.data;
    },

    async updateStatus(gameSlug: string, sectionSlug: string, projectSlug: string, status: 'draft' | 'published' | 'hidden') {
        const response = await api.patch(`/games/${gameSlug}/${sectionSlug}/${projectSlug}/status`, { status });
        return response.data;
    },

    async checkLike(itemId: string) {
        try {
            const response = await api.get(`/items/${itemId}/like`);
            return response.data.is_liked;
        } catch {
            return false;
        }
    },

    async toggleLike(itemId: string, currentlyLiked: boolean) {
        if (currentlyLiked) {
            await api.delete(`/items/${itemId}/like`);
            return false;
        } else {
            await api.post(`/items/${itemId}/like`);
            return true;
        }
    }
};
