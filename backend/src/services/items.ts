import { FastifyInstance } from 'fastify';

export class ItemService {
    private db: FastifyInstance['pg'];

    constructor(db: FastifyInstance['pg']) {
        this.db = db;
    }

    async create(data: { section_id: string; author_id: string; title: string; slug: string; summary: string; description: string; attributes: any }) {
        const query = `
      INSERT INTO items (section_id, author_id, title, slug, summary, description, attributes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
        const { rows } = await this.db.query(query, [
            data.section_id,
            data.author_id,
            data.title,
            data.slug,
            data.summary,
            data.description,
            JSON.stringify(data.attributes || {})
        ]);
        return rows[0];
    }

    async findBySlug(gameSlug: string, sectionSlug: string, itemSlug: string) {
        const query = `
      SELECT i.*, u.username as author_name, s.slug as section_slug, g.slug as game_slug
      FROM items i
      JOIN sections s ON i.section_id = s.id
      JOIN games g ON s.game_id = g.id
      LEFT JOIN users u ON i.author_id = u.id
      WHERE g.slug = $1 AND s.slug = $2 AND i.slug = $3
    `;
        const { rows } = await this.db.query(query, [gameSlug, sectionSlug, itemSlug]);
        return rows[0];
    }

    async findAll(gameSlug: string, sectionSlug: string, filters: Record<string, string>, page: number = 1, limit: number = 20) {
        const offset = (page - 1) * limit;

        let query = `
      SELECT i.id, i.title, i.slug, i.summary, i.attributes, i.stats, i.created_at, 
             u.username as author_name,
             (SELECT url FROM item_gallery WHERE item_id = i.id AND is_primary = true LIMIT 1) as cover_url
      FROM items i
      JOIN sections s ON i.section_id = s.id
      JOIN games g ON s.game_id = g.id
      LEFT JOIN users u ON i.author_id = u.id
      WHERE g.slug = $1 AND s.slug = $2
    `;

        const params: any[] = [gameSlug, sectionSlug];
        let paramIndex = 3;

        // Dynamic JSONB filtering
        // Example: ?loader=fabric -> attributes->>'loader' = 'fabric'
        for (const [key, value] of Object.entries(filters)) {
            if (['page', 'limit', 'sort', 'q'].includes(key)) continue; // Skip pagination/sort params

            query += ` AND i.attributes ->> $${paramIndex} = $${paramIndex + 1}`;
            params.push(key, value);
            paramIndex += 2;
        }

        // Text search
        if (filters.q) {
            query += ` AND (i.title ILIKE $${paramIndex} OR i.summary ILIKE $${paramIndex})`;
            params.push(`%${filters.q}%`);
            paramIndex++;
        }

        query += ` ORDER BY i.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const { rows } = await this.db.query(query, params);
        return rows;
    }
}
