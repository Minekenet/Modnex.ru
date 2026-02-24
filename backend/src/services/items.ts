import { FastifyInstance } from 'fastify';

export class ItemService {
    private db: FastifyInstance['pg'];
    private publicUrlBase: string;

    constructor(db: FastifyInstance['pg'], publicUrlBase: string = 'http://localhost:9000/modnex-files') {
        this.db = db;
        this.publicUrlBase = publicUrlBase;
    }

    async create(data: { section_id: string; author_id: string; title: string; slug: string; summary: string; description: string; attributes: any; links?: any[]; status?: string }) {
        const status = data.status && ['draft', 'published', 'hidden', 'archived'].includes(data.status) ? data.status : 'draft';
        const query = `
      INSERT INTO items (section_id, author_id, title, slug, summary, description, attributes, links, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
        const { rows } = await this.db.query(query, [
            data.section_id,
            data.author_id,
            data.title,
            data.slug,
            data.summary,
            data.description,
            JSON.stringify(data.attributes || {}),
            JSON.stringify(data.links || []),
            status
        ]);
        return rows[0];
    }

    async updateStatus(itemId: string, authorId: string, status: string) {
        if (!['draft', 'published', 'hidden', 'archived'].includes(status)) return null;
        const query = `
      UPDATE items SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND author_id = $3
      RETURNING *
    `;
        const { rows } = await this.db.query(query, [status, itemId, authorId]);
        return rows[0];
    }

    async update(itemId: string, authorId: string, data: { title?: string; summary?: string; description?: string; attributes?: any; status?: string }) {
        const updates: string[] = ['updated_at = CURRENT_TIMESTAMP'];
        const params: any[] = [];
        let i = 1;
        if (data.title != null) { updates.push(`title = $${i}`); params.push(data.title); i++; }
        if (data.summary != null) { updates.push(`summary = $${i}`); params.push(data.summary); i++; }
        if (data.description != null) { updates.push(`description = $${i}`); params.push(data.description); i++; }
        if (data.attributes != null) { updates.push(`attributes = $${i}`); params.push(JSON.stringify(data.attributes)); i++; }
        if (data.status != null && ['draft', 'published', 'hidden', 'archived'].includes(data.status)) {
            updates.push(`status = $${i}`); params.push(data.status); i++;
        }
        if (params.length === 0) return null;
        params.push(itemId, authorId);
        const query = `
      UPDATE items SET ${updates.join(', ')}
      WHERE id = $${i} AND author_id = $${i + 1}
      RETURNING *
    `;
        const { rows } = await this.db.query(query, params);
        return rows[0];
    }

    async findBySlug(gameSlug: string, sectionSlug: string, itemSlug: string) {
        const query = `
      SELECT i.*, u.username as author_name, u.avatar_url as author_avatar, s.slug as section_slug, g.slug as game_slug,
             (SELECT jsonb_agg($4 || '/' || url) FROM item_gallery WHERE item_id = i.id) as gallery,
             (SELECT $4 || '/' || url FROM item_gallery WHERE item_id = i.id AND is_primary = true LIMIT 1) as banner_url
      FROM items i
      JOIN sections s ON i.section_id = s.id
      JOIN games g ON s.game_id = g.id
      LEFT JOIN users u ON i.author_id = u.id
      WHERE g.slug = $1 AND s.slug = $2 AND i.slug = $3
    `;
        const { rows } = await this.db.query(query, [gameSlug, sectionSlug, itemSlug, this.publicUrlBase]);
        return rows[0];
    }

    async findAll(gameSlug: string, sectionSlug: string, filters: Record<string, string>, page: number = 1, limit: number = 20) {
        const offset = (page - 1) * limit;

        let query = `
      SELECT i.id, i.title, i.slug, i.summary, i.attributes, i.stats, i.created_at, 
             u.username as author_name, u.avatar_url as author_avatar,
             (SELECT $3 || '/' || url FROM item_gallery WHERE item_id = i.id AND is_primary = true LIMIT 1) as cover_url
      FROM items i
      JOIN sections s ON i.section_id = s.id
      JOIN games g ON s.game_id = g.id
      LEFT JOIN users u ON i.author_id = u.id
      WHERE g.slug = $1 AND s.slug = $2 AND i.status = 'published'
    `;

        const params: any[] = [gameSlug, sectionSlug, this.publicUrlBase];
        let paramIndex = 4; // Changed from 3 to 4 because this.publicUrlBase is now the 3rd parameter ($3)

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

    async findAllByUser(username: string, page: number = 1, limit: number = 20) {
        const offset = (page - 1) * limit;
        const query = `
            SELECT i.id, i.title, i.slug, i.summary, i.attributes, i.stats, i.created_at, 
                   u.username as author_name, u.avatar_url as author_avatar,
                   s.slug as section_slug, g.slug as game_slug,
                   (SELECT url FROM item_gallery WHERE item_id = i.id AND is_primary = true LIMIT 1) as cover_url
            FROM items i
            JOIN sections s ON i.section_id = s.id
            JOIN games g ON s.game_id = g.id
            JOIN users u ON i.author_id = u.id
            WHERE u.username = $1
            ORDER BY i.created_at DESC
            LIMIT $2 OFFSET $3
        `;
        const { rows } = await this.db.query(query, [username, limit, offset]);
        return rows;
    }
}
