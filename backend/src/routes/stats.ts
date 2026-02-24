import { FastifyInstance } from 'fastify';
import { StatsService } from '../services/stats';

export default async function statsRoutes(server: FastifyInstance) {
    const statsService = new StatsService(server.pg);

    server.get('/stats', async (request, reply) => {
        try {
            const stats = await statsService.getGlobalStats();
            return stats;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });
}
