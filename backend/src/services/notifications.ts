import { FastifyInstance } from 'fastify';

export class NotificationService {
    private db: FastifyInstance['pg'];

    constructor(db: FastifyInstance['pg']) {
        this.db = db;
    }

    async create(userId: string, message: string, type: string = 'info') {
        const { rows } = await this.db.query(
            `INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3) RETURNING *`,
            [userId, message, type]
        );
        return rows[0];
    }

    async getByUser(userId: string, limit: number = 50) {
        const { rows } = await this.db.query(
            `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
            [userId, limit]
        );
        return rows;
    }

    async getUnreadCount(userId: string) {
        const { rows } = await this.db.query(
            `SELECT COUNT(*)::int as count FROM notifications WHERE user_id = $1 AND is_read = false`,
            [userId]
        );
        return rows[0]?.count ?? 0;
    }

    async markRead(notificationId: string, userId: string) {
        const { rows } = await this.db.query(
            `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *`,
            [notificationId, userId]
        );
        return rows[0];
    }

    async markAllRead(userId: string) {
        await this.db.query(
            `UPDATE notifications SET is_read = true WHERE user_id = $1`,
            [userId]
        );
    }
}
