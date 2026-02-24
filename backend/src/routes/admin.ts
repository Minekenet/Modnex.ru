import { FastifyInstance } from 'fastify';

export default async function adminRoutes(server: FastifyInstance) {
    const requireAdmin = async (request: any, reply: any) => {
        try {
            await request.jwtVerify();
        } catch {
            return reply.code(401).send({ error: 'Unauthorized' });
        }
        const user = request.user as { id: string; role: string };
        if (user.role !== 'admin') {
            return reply.code(403).send({ error: 'Forbidden' });
        }
    };

    server.get('/admin/game-suggestions', {
        onRequest: [requireAdmin]
    }, async (request, reply) => {
        const query = request.query as { page?: string, limit?: string };
        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '20', 10);
        const offset = (page - 1) * limit;
        try {
            const { rows } = await server.pg.query(
                'SELECT id, title, link, comment, user_id, created_at FROM game_suggestions ORDER BY created_at DESC LIMIT $1 OFFSET $2',
                [limit, offset]
            );
            const { rows: countRows } = await server.pg.query('SELECT COUNT(*) FROM game_suggestions');
            return { items: rows, total: parseInt(countRows[0].count, 10), page, limit };
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    server.get('/admin/reports', {
        onRequest: [requireAdmin]
    }, async (request, reply) => {
        const query = request.query as { page?: string, limit?: string };
        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '20', 10);
        const offset = (page - 1) * limit;
        try {
            const { rows } = await server.pg.query(`
                SELECT r.id, r.item_id, r.reason, r.comment, r.reporter_id, r.created_at,
                       i.title as item_title
                FROM reports r
                LEFT JOIN items i ON i.id = r.item_id
                ORDER BY r.created_at DESC
                LIMIT $1 OFFSET $2
            `, [limit, offset]);
            const { rows: countRows } = await server.pg.query('SELECT COUNT(*) FROM reports');
            return { items: rows, total: parseInt(countRows[0].count, 10), page, limit };
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    server.get('/admin/support-tickets', {
        onRequest: [requireAdmin]
    }, async (request, reply) => {
        const query = request.query as { page?: string, limit?: string };
        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '20', 10);
        const offset = (page - 1) * limit;
        try {
            const { rows } = await server.pg.query(`
                SELECT t.*, u.username
                FROM support_tickets t
                LEFT JOIN users u ON u.id = t.user_id
                ORDER BY t.updated_at DESC
                LIMIT $1 OFFSET $2
            `, [limit, offset]);
            const { rows: countRows } = await server.pg.query('SELECT COUNT(*) FROM support_tickets');
            return { items: rows, total: parseInt(countRows[0].count, 10), page, limit };
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    server.patch('/admin/support-tickets/:ticketId/status', {
        onRequest: [requireAdmin]
    }, async (request, reply) => {
        const { ticketId } = request.params as { ticketId: string };
        const { status } = request.body as { status: string };
        try {
            await server.pg.query('UPDATE support_tickets SET status = $1, updated_at = NOW() WHERE id = $2', [status, ticketId]);
            return { success: true };
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });
}
