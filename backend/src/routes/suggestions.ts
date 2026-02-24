import { FastifyInstance } from 'fastify';

export default async function suggestionsRoutes(server: FastifyInstance) {
    server.post('/suggestions/game', async (request, reply) => {
        const body = request.body as { title: string; link?: string; comment?: string };
        const user = (request as any).user;
        try {
            const query = `
                INSERT INTO game_suggestions (title, link, comment, user_id)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            const { rows } = await server.pg.query(query, [
                body.title?.trim() || '',
                body.link?.trim() || null,
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
