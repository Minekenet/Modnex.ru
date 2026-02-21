import api from './client';

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const notificationsService = {
  async getList(): Promise<Notification[]> {
    const { data } = await api.get<Notification[]>('/notifications');
    return data;
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await api.get<{ count: number }>('/notifications/unread-count');
    return data.count;
  },

  async markRead(id: string): Promise<Notification> {
    const { data } = await api.patch<Notification>(`/notifications/${id}/read`);
    return data;
  },

  async markAllRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  }
};
