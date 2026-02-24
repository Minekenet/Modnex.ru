import api from './client';

export const adminService = {
    async getGameSuggestions(page = 1, limit = 20) {
        const { data } = await api.get(`/admin/game-suggestions?page=${page}&limit=${limit}`);
        return data;
    },
    async getReports(page = 1, limit = 20) {
        const { data } = await api.get(`/admin/reports?page=${page}&limit=${limit}`);
        return data;
    },
    async getSupportTickets(page = 1, limit = 20) {
        const { data } = await api.get(`/admin/support-tickets?page=${page}&limit=${limit}`);
        return data;
    },
    async changeTicketStatus(ticketId: string, status: string) {
        const { data } = await api.patch(`/admin/support-tickets/${ticketId}/status`, { status });
        return data;
    }
};
