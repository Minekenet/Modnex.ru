import { FastifyInstance } from 'fastify';
import { UserService } from '../services/users';
import { ItemService } from '../services/items';

export default async function usersRoutes(server: FastifyInstance) {
    const userService = new UserService(server.pg);
    const itemService = new ItemService(server.pg);

    // Get Public Profile
    server.get('/users/:username', async (request, reply) => {
        const { username } = request.params as any;
        try {
            const user = await userService.findByUsername(username);
            if (!user) return reply.code(404).send({ error: 'User not found' });
            return user;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Get User Items
    server.get('/users/:username/items', async (request, reply) => {
        const { username } = request.params as any;
        const query = request.query as any;
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 20;

        try {
            const items = await itemService.findAllByUser(username, page, limit);
            return items;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Update Own Profile
    server.put('/users/me', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const user = request.user as any;
        const data = request.body as any;

        try {
            const updatedUser = await userService.update(user.id, data);
            return updatedUser;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Favorites
    server.get('/users/me/favorites', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const user = request.user as any;
        try {
            return await userService.getFavorites(user.id);
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    server.post('/users/me/favorites/:gameId', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const user = request.user as any;
        const { gameId } = request.params as any;
        try {
            return await userService.addFavorite(user.id, gameId);
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    server.delete('/users/me/favorites/:gameId', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const user = request.user as any;
        const { gameId } = request.params as any;
        try {
            return await userService.removeFavorite(user.id, gameId);
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });
}
