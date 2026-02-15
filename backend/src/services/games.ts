import { FastifyInstance } from 'fastify';

export class GameService {
    private db: FastifyInstance['pg'];

    constructor(db: FastifyInstance['pg']) {
        this.db = db;
    }

    async findAll() {
        const query = 'SELECT * FROM games ORDER BY title ASC';
        const { rows } = await this.db.query(query);
        return rows;
    }

    async findBySlug(slug: string) {
        // Fetch game details
        const gameQuery = 'SELECT * FROM games WHERE slug = $1';
        const gameResult = await this.db.query(gameQuery, [slug]);
        const game = gameResult.rows[0];

        if (!game) return null;

        // Fetch sections for this game
        const sectionsQuery = 'SELECT * FROM sections WHERE game_id = $1 ORDER BY name ASC';
        const sectionsResult = await this.db.query(sectionsQuery, [game.id]);

        return { ...game, sections: sectionsResult.rows };
    }

    async createGame(data: { slug: string; title: string; description?: string; cover_url?: string }) {
        const query = `
      INSERT INTO games (slug, title, description, cover_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
        const { rows } = await this.db.query(query, [data.slug, data.title, data.description, data.cover_url]);
        return rows[0];
    }

    async createSection(data: { game_id: string; slug: string; name: string; ui_config?: any; filter_config?: any }) {
        const query = `
      INSERT INTO sections (game_id, slug, name, ui_config, filter_config)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const { rows } = await this.db.query(query, [
            data.game_id,
            data.slug,
            data.name,
            JSON.stringify(data.ui_config || {}),
            JSON.stringify(data.filter_config || [])
        ]);
        return rows[0];
    }
}
