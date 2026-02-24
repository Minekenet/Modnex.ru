import { FastifyInstance } from 'fastify';

export default async function reportsRoutes(server: FastifyInstance) {
    server.post('/reports', async (request, reply) => {
        const body = request.body as { item_id: string; reason: string; comment?: string };
        const user = (request as any).user;
        try {
            const query = `
                INSERT INTO reports (item_id, reason, comment, reporter_id)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            const { rows } = await server.pg.query(query, [
                body.item_id,
                body.reason?.trim() || '',
                body.comment?.trim() || null,
                user?.id || null
            ]);
            return rows[0];
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });
}
