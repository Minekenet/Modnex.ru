import { FastifyInstance } from 'fastify';

export async function seedDatabase(server: FastifyInstance) {
    server.log.info('Seeding database...');

    // 1. Create Test User
    const { rows: userRows } = await server.pg.query(
        `INSERT INTO users (username, email, password_hash, role, is_verified) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username
         RETURNING id`,
        ['eldeston', 'admin@modnex.ru', 'hashed_pass', 'admin', true]
    );
    const authorId = userRows[0].id;

    const games = [
        {
            slug: 'minecraft',
            title: 'Minecraft',
            description: 'The legendary sandbox game about breaking and placing blocks.',
            cover_url: 'https://hot.game/uploads/media/game/0002/50/thumb_149421_game_poster2.jpeg',
            sections: [
                { slug: 'mods', name: 'Mods' },
                { slug: 'skins', name: 'Skins' }
            ]
        },
        {
            slug: 'path-of-exile-2',
            title: 'Path of Exile 2',
            description: 'A next-generation Action RPG from Grinding Gear Games.',
            cover_url: 'https://picsum.photos/seed/poe2_poster/400/600',
            sections: [
                { slug: 'mods', name: 'Mods' },
                { slug: 'configs', name: 'Configs' }
            ]
        }
    ];

    for (const game of games) {
        const { rows: gameRows } = await server.pg.query(
            `INSERT INTO games (slug, title, description, cover_url) 
             VALUES ($1, $2, $3, $4) 
             ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
             RETURNING id`,
            [game.slug, game.title, game.description, game.cover_url]
        );
        const gameId = gameRows[0].id;

        for (const section of game.sections) {
            const { rows: sectionRows } = await server.pg.query(
                `INSERT INTO sections (game_id, slug, name) 
                 VALUES ($1, $2, $3) 
                 ON CONFLICT (game_id, slug) DO UPDATE SET name = EXCLUDED.name
                 RETURNING id`,
                [gameId, section.slug, section.name]
            );
            const sectionId = sectionRows[0].id;

            // Seed items for Minecraft Mods
            if (game.slug === 'minecraft' && section.slug === 'mods') {
                const items = [
                    { title: 'Sodium', slug: 'sodium', summary: 'A modern rendering engine for Minecraft.' },
                    { title: 'Iris Shaders', slug: 'iris', summary: 'A modern shaders mod for Minecraft.' },
                    { title: 'Lithium', slug: 'lithium', summary: 'A general-purpose optimization mod.' }
                ];
                for (const item of items) {
                    await server.pg.query(
                        `INSERT INTO items (section_id, author_id, title, slug, summary, status) 
                         VALUES ($1, $2, $3, $4, $5, $6) 
                         ON CONFLICT (section_id, slug) DO NOTHING`,
                        [sectionId, authorId, item.title, item.slug, item.summary, 'published']
                    );
                }
            }
        }
    }

    server.log.info('Seeding completed.');
}
