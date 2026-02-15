import { FastifyInstance } from 'fastify';
import { GameService } from '../services/games';

export default async function gamesRoutes(server: FastifyInstance) {
    const gameService = new GameService(server.pg);

    server.get('/games', async (request, reply) => {
        try {
            const games = await gameService.findAll();
            return games;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    server.get('/games/:slug', async (request, reply) => {
        const { slug } = request.params as { slug: string };
        try {
            const game = await gameService.findBySlug(slug);
            if (!game) {
                return reply.code(404).send({ error: 'Game not found' });
            }
            return game;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Admin only - Create Game
    server.post('/games', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        // In strict mode, check for admin role here
        const data = request.body as any;
        try {
            const game = await gameService.createGame(data);
            return game;
        } catch (err: any) {
            if (err.code === '23505') return reply.code(409).send({ error: 'Game slug already exists' });
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Admin only - Create Section
    server.post('/games/:slug/sections', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const { slug } = request.params as { slug: string };
        const data = request.body as any;

        try {
            const game = await gameService.findBySlug(slug);
            if (!game) return reply.code(404).send({ error: 'Game not found' });

            const section = await gameService.createSection({ ...data, game_id: game.id });
            return section;
        } catch (err: any) {
            if (err.code === '23505') return reply.code(409).send({ error: 'Section slug already exists for this game' });
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });
}
