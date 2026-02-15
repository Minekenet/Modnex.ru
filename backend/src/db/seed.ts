import { FastifyInstance } from 'fastify';

export async function seedDatabase(server: FastifyInstance) {
    const games = [
        {
            slug: 'minecraft',
            title: 'Minecraft',
            description: 'The legendary sandbox game about breaking and placing blocks.',
            cover_url: 'https://hot.game/uploads/media/game/0002/50/thumb_149421_game_poster2.jpeg'
        },
        {
            slug: 'path-of-exile-2',
            title: 'Path of Exile 2',
            description: 'A next-generation Action RPG from Grinding Gear Games.',
            cover_url: 'https://picsum.photos/seed/poe2_poster/400/600'
        },
        {
            slug: 'cyberpunk-2077',
            title: 'Cyberpunk 2077',
            description: 'An open-world, action-adventure story set in Night City.',
            cover_url: 'https://picsum.photos/seed/cp2077/400/600'
        }
    ];

    server.log.info('Seeding database...');

    for (const game of games) {
        // Idempotent insert: only insert if slug doesn't exist
        await server.pg.query(
            `INSERT INTO games (slug, title, description, cover_url) 
             VALUES ($1, $2, $3, $4) 
             ON CONFLICT (slug) DO NOTHING`,
            [game.slug, game.title, game.description, game.cover_url]
        );
    }

    server.log.info('Seeding completed.');
}
