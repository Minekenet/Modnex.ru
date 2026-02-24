import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';

export async function seedDatabase(server: FastifyInstance) {
    server.log.info('Seeding database...');

    // 1. Admin user: логин admin@modnex.ru, пароль admin123
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const { rows: userRows } = await server.pg.query(
        `INSERT INTO users (username, email, password_hash, role, is_verified, bio, links) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         ON CONFLICT (username) DO NOTHING
         RETURNING id`,
        [
            'eldeston',
            'admin@modnex.ru',
            adminPasswordHash,
            'admin',
            true,
            'Разработчик Modnex.ru - главной платформы для модинга.',
            JSON.stringify([
                { label: 'GitHub', url: 'https://github.com/modnex' },
                { label: 'Discord', url: 'https://discord.gg/modnex' }
            ])
        ]
    );

    let authorId;
    if (userRows.length > 0) {
        authorId = userRows[0].id;
    } else {
        const { rows } = await server.pg.query('SELECT id FROM users WHERE username = $1', ['eldeston']);
        authorId = rows[0].id;
    }

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
            const isMinecraftMods = game.slug === 'minecraft' && section.slug === 'mods';

            const filterConfig = isMinecraftMods
                ? [
                    {
                        label: 'Game versions',
                        options: ['1.21.11', '1.21.10', '1.21.9', '1.21.8', '1.21.7', '1.21.6', '1.21.5', '1.21.4', '1.21.3', '1.21.2', '1.21.1', '1.21', '1.20.6', '1.20.5', '1.20.4', '1.20.3', '1.20.2', '1.20.1', '1.20', '1.19.4', '1.19.3', '1.19.2', '1.19.1', '1.19', '1.18.2', '1.18.1', '1.18', '1.17.1', '1.17', '1.16.5', '1.16.4', '1.16.3', '1.16.2', '1.16.1', '1.16', '1.15.2', '1.15.1', '1.15', '1.14.4', '1.14.3', '1.14.2', '1.14.1', '1.14', '1.13.2', '1.13.1', '1.13', '1.12.2', '1.12.1', '1.12', '1.11.2', '1.11.1', '1.11', '1.10.2', '1.10.1', '1.10', '1.9.4', '1.9.3', '1.9.2', '1.9.1', '1.9', '1.8.9', '1.8.8', '1.8.7', '1.8.6', '1.8.5', '1.8.4', '1.8.3', '1.8.2', '1.8.1', '1.8', '1.7.10', '1.7.9', '1.7.8', '1.7.7', '1.7.6', '1.7.5', '1.7.4', '1.7.3', '1.7.2', '1.6.4', '1.6.2', '1.6.1', '1.5.2', '1.5.1', '1.4.7', '1.4.6', '1.4.5', '1.4.4', '1.4.2', '1.3.2', '1.3.1', '1.2.5', '1.2.4', '1.2.3', '1.2.2', '1.2.1', '1.1', '1.0'],
                        is_preview: true,
                        preview_limit: 2
                    },
                    {
                        label: 'Loader',
                        options: ['Fabric', 'Forge', 'NeoForge'],
                        is_preview: true,
                        preview_limit: 1
                    },
                    {
                        label: 'Category',
                        options: ['Adventure', 'Cursed', 'Decoration', 'Economy', 'Equipment', 'Food', 'Game Mechanics', 'Library', 'Magic', 'Management', 'Minigame', 'Mobs', 'Optimization', 'Social', 'Storage', 'Technology', 'Transportation', 'Utility', 'World Generation'],
                        is_preview: true,
                        preview_limit: 1
                    },
                    {
                        label: 'Environment',
                        options: ['Client', 'Server'],
                        is_preview: false,
                        preview_limit: 0
                    }
                ]
                : [];

            const uiConfig = isMinecraftMods
                ? {
                    viewType: 'grid',
                    allowed_layouts: ['grid', 'compact', 'list'],
                    badgeFields: ['loader', 'environment', 'game_versions', 'category', 'mod_version', 'tags'],
                    badgeMax: 6,
                    file_schema: [
                        { key: 'version_number', label: 'Версия', type: 'text', required: true },
                        { key: 'loader', label: 'Загрузчик', type: 'select', options: ['Fabric', 'Forge', 'NeoForge'] },
                        { key: 'game_version', label: 'Версия игры', type: 'text' }
                    ]
                }
                : game.slug === 'minecraft' && section.slug === 'skins'
                    ? {
                        viewType: 'skin',
                        allowed_layouts: ['skin', 'grid'],
                        file_schema: [
                            { key: 'version_number', label: 'Версия', type: 'text', required: true },
                            { key: 'resolution', label: 'Разрешение', type: 'text' }
                        ]
                    }
                    : { viewType: 'grid', allowed_layouts: ['grid', 'list'], file_schema: [{ key: 'version_number', label: 'Версия', type: 'text', required: true }] };

            const { rows: sectionRows } = await server.pg.query(
                `INSERT INTO sections (game_id, slug, name, ui_config, filter_config) 
                 VALUES ($1, $2, $3, $4, $5) 
                 ON CONFLICT (game_id, slug) DO UPDATE SET 
                    name = EXCLUDED.name, 
                    ui_config = EXCLUDED.ui_config,
                    filter_config = EXCLUDED.filter_config
                 RETURNING id`,
                [gameId, section.slug, section.name, JSON.stringify(uiConfig), JSON.stringify(filterConfig)]
            );
            const sectionId = sectionRows[0].id;

            // Seed items for Minecraft Mods
            if (game.slug === 'minecraft' && section.slug === 'mods') {
                const items = [
                    {
                        title: 'Sodium',
                        slug: 'sodium',
                        summary: 'A modern rendering engine for Minecraft.',
                        attributes: {
                            loader: 'Fabric',
                            environment: 'Client & Server',
                            game_versions: ['1.20.1', '1.20.4'],
                            category: 'Optimization',
                            mod_version: '1.0.0',
                            tags: ['performance', 'client', 'server']
                        }
                    },
                    {
                        title: 'Iris Shaders',
                        slug: 'iris',
                        summary: 'A modern shaders mod for Minecraft.',
                        attributes: {
                            loader: 'Fabric',
                            environment: 'Client',
                            game_versions: ['1.20.1'],
                            category: 'Optimization',
                            mod_version: '1.1.0',
                            tags: ['shaders', 'graphics']
                        }
                    },
                    {
                        title: 'Lithium',
                        slug: 'lithium',
                        summary: 'A general-purpose optimization mod.',
                        attributes: {
                            loader: 'Fabric',
                            environment: 'Server',
                            game_versions: ['1.20.1'],
                            category: 'Optimization',
                            mod_version: '1.0.5',
                            tags: ['server', 'performance']
                        }
                    }
                ];
                for (const item of items) {
                    await server.pg.query(
                        `INSERT INTO items (section_id, author_id, title, slug, summary, attributes, status, links) 
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                         ON CONFLICT (section_id, slug) DO UPDATE SET 
                            attributes = EXCLUDED.attributes,
                            summary = EXCLUDED.summary,
                            links = EXCLUDED.links`,
                        [
                            sectionId,
                            authorId,
                            item.title,
                            item.slug,
                            item.summary,
                            JSON.stringify(item.attributes),
                            'published',
                            JSON.stringify([
                                { label: 'Official Wiki', url: 'https://minecraft.fandom.com/wiki/Minecraft_Wiki' },
                                { label: 'Discord', url: 'https://discord.gg/modnex' }
                            ])
                        ]
                    );
                }
            }
        }
    }

    server.log.info('Seeding completed.');
}
