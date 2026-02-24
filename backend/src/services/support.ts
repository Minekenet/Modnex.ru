import { FastifyInstance } from 'fastify';

export class SupportService {
    private db: FastifyInstance['pg'];

    constructor(db: FastifyInstance['pg']) {
        this.db = db;
    }

    async createTicket(userId: string, subject: string) {
        const { rows } = await this.db.query(
            `INSERT INTO support_tickets (user_id, subject) VALUES ($1, $2) RETURNING *`,
            [userId, subject]
        );
        return rows[0];
    }

    async getTicketsByUser(userId: string) {
        const { rows } = await this.db.query(
            `SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY updated_at DESC`,
            [userId]
        );
        return rows;
    }

    async getAllTickets() {
        const { rows } = await this.db.query(`
            SELECT t.*, u.username
            FROM support_tickets t
            LEFT JOIN users u ON u.id = t.user_id
            ORDER BY t.updated_at DESC
        `);
        return rows;
    }

    async getTicketById(ticketId: string) {
        const { rows } = await this.db.query(
            `SELECT * FROM support_tickets WHERE id = $1`,
            [ticketId]
        );
        return rows[0];
    }

    async getMessages(ticketId: string) {
        const { rows } = await this.db.query(`
            SELECT m.*, u.username as author_name
            FROM support_messages m
            LEFT JOIN users u ON u.id = m.author_id
            WHERE m.ticket_id = $1
            ORDER BY m.created_at ASC
        `, [ticketId]);
        return rows;
    }

    async addMessage(ticketId: string, authorId: string, body: string, isStaff: boolean) {
        const { rows } = await this.db.query(
            `INSERT INTO support_messages (ticket_id, author_id, body, is_staff) VALUES ($1, $2, $3, $4) RETURNING *`,
            [ticketId, authorId, body, isStaff]
        );
        await this.db.query(
            `UPDATE support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [ticketId]
        );
        return rows[0];
    }
}
