import { FastifyInstance } from 'fastify';
import { ItemService } from '../services/items';
import { GameService } from '../services/games';
import { createItemSchema } from '../schemas/items';

const viewCache = new Set<string>();

export default async function itemsRoutes(server: FastifyInstance) {
    const publicUrlBase = `${process.env.S3_PUBLIC_ENDPOINT || 'http://localhost:9000'}/${process.env.S3_BUCKET || 'modnex-files'}`;
    const itemService = new ItemService(server.pg, publicUrlBase);
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

            const ip = request.ip || 'unknown';
            const cacheKey = `view_${item.id}_${ip}`;
            if (!viewCache.has(cacheKey)) {
                viewCache.add(cacheKey);
                setTimeout(() => viewCache.delete(cacheKey), 10 * 60 * 1000);
                server.pg.query("UPDATE items SET stats = jsonb_set(stats, '{views}', (COALESCE((stats->>'views')::int, 0) + 1)::text::jsonb) WHERE id = $1", [item.id]).catch(err => server.log.error(err));
            }

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

    server.get('/items/:item_id/like', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const { item_id } = request.params as any;
        const user = request.user as any;
        try {
            const { rows } = await server.pg.query("SELECT 1 FROM item_likes WHERE item_id = $1 AND user_id = $2", [item_id, user.id]);
            return { is_liked: rows.length > 0 };
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    server.post('/items/:item_id/like', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const { item_id } = request.params as any;
        const user = request.user as any;
        try {
            await server.pg.query("INSERT INTO item_likes (item_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [item_id, user.id]);
            await server.pg.query("UPDATE items SET stats = jsonb_set(stats, '{likes}', (SELECT COUNT(*) FROM item_likes WHERE item_id = $1)::text::jsonb) WHERE id = $1", [item_id]);
            return { success: true };
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    server.delete('/items/:item_id/like', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const { item_id } = request.params as any;
        const user = request.user as any;
        try {
            await server.pg.query("DELETE FROM item_likes WHERE item_id = $1 AND user_id = $2", [item_id, user.id]);
            await server.pg.query("UPDATE items SET stats = jsonb_set(stats, '{likes}', (SELECT COUNT(*) FROM item_likes WHERE item_id = $1)::text::jsonb) WHERE id = $1", [item_id]);
            return { success: true };
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });
}
