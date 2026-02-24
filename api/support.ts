import api from './client';

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  author_id: string | null;
  author_name: string | null;
  body: string;
  is_staff: boolean;
  created_at: string;
}

export const supportService = {
  async getTickets(): Promise<SupportTicket[]> {
    const { data } = await api.get<SupportTicket[]>('/support/tickets');
    return data;
  },

  async createTicket(subject: string): Promise<SupportTicket> {
    const { data } = await api.post<SupportTicket>('/support/tickets', { subject });
    return data;
  },

  async getMessages(ticketId: string): Promise<SupportMessage[]> {
    const { data } = await api.get<SupportMessage[]>(`/support/tickets/${ticketId}/messages`);
    return data;
  },

  async sendMessage(ticketId: string, body: string): Promise<SupportMessage> {
    const { data } = await api.post<SupportMessage>(`/support/tickets/${ticketId}/messages`, { body });
    return data;
  }
};
