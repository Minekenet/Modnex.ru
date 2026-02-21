import { FastifyInstance } from 'fastify';
import { ItemService } from '../services/items';
import { GameService } from '../services/games';
import { createItemSchema } from '../schemas/items';


export default async function itemsRoutes(server: FastifyInstance) {
    const itemService = new ItemService(server.pg);
    const gameService = new GameService(server.pg);

    // List Items (Catalog)
    // GET /games/minecraft/mods?page=1&loader=fabric
    server.get('/games/:game_slug/:section_slug', async (request, reply) => {
        const { game_slug, section_slug } = request.params as any;
        const query = request.query as any;
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 20;

        try {
            const items = await itemService.findAll(game_slug, section_slug, query, page, limit);
            return items;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Get Item Details
    // GET /games/minecraft/mods/sodium
    server.get('/games/:game_slug/:section_slug/:item_slug', async (request, reply) => {
        const { game_slug, section_slug, item_slug } = request.params as any;

        try {
            const item = await itemService.findBySlug(game_slug, section_slug, item_slug);
            if (!item) return reply.code(404).send({ error: 'Item not found' });
            return item;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Create Item (Auth Required)
    // POST /games/minecraft/mods
    server.post('/games/:game_slug/:section_slug', {
        onRequest: [async (request) => await request.jwtVerify()],
        schema: createItemSchema
    }, async (request, reply) => {
        const { game_slug, section_slug } = request.params as any;
        const user = request.user;
        const data = request.body as any;

        try {
            // 1. Find the section ID first
            const game = await gameService.findBySlug(game_slug);
            if (!game) return reply.code(404).send({ error: 'Game not found' });

            const sections = game.sections as any[];
            const section = sections.find(s => s.slug === section_slug);

            if (!section) return reply.code(404).send({ error: 'Section not found' });

            // 2. Create the item
            const item = await itemService.create({
                ...data,
                section_id: section.id,
                author_id: user.id
            });

            return item;
        } catch (err: any) {
            if (err.code === '23505') return reply.code(409).send({ error: 'Item slug already exists in this section' });
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Update item (Auth, author only)
    server.patch('/games/:game_slug/:section_slug/:item_slug', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const { game_slug, section_slug, item_slug } = request.params as any;
        const user = request.user as any;
        const body = request.body as any;

        try {
            const item = await itemService.findBySlug(game_slug, section_slug, item_slug);
            if (!item) return reply.code(404).send({ error: 'Item not found' });
            if (item.author_id !== user.id) return reply.code(403).send({ error: 'Forbidden' });
            const updated = await itemService.update(item.id, user.id, {
                title: body.title,
                summary: body.summary,
                description: body.description,
                attributes: body.attributes,
                status: body.status
            });
            if (!updated) return reply.code(400).send({ error: 'Nothing to update' });
            return updated;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Update item status (Auth, author only)
    server.patch('/games/:game_slug/:section_slug/:item_slug/status', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const { game_slug, section_slug, item_slug } = request.params as any;
        const user = request.user as any;
        const { status } = request.body as { status: string };

        try {
            const item = await itemService.findBySlug(game_slug, section_slug, item_slug);
            if (!item) return reply.code(404).send({ error: 'Item not found' });
            if (item.author_id !== user.id) return reply.code(403).send({ error: 'Forbidden' });
            const updated = await itemService.updateStatus(item.id, user.id, status);
            if (!updated) return reply.code(400).send({ error: 'Invalid status' });
            return updated;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });
}
