import { FastifyInstance } from 'fastify';

export class StatsService {
    private db: FastifyInstance['pg'];

    constructor(db: FastifyInstance['pg']) {
        this.db = db;
    }

    async getGlobalStats() {
        // Get total mods count (published items)
        const modsQuery = `
            SELECT COUNT(*) as count 
            FROM items 
            WHERE status = 'published'
        `;
        const modsResult = await this.db.query(modsQuery);
        const modsCount = parseInt(modsResult.rows[0].count) || 0;

        // Get total downloads count (sum of all file downloads)
        const downloadsQuery = `
            SELECT COALESCE(SUM(download_count), 0) as total 
            FROM files
        `;
        const downloadsResult = await this.db.query(downloadsQuery);
        const downloadsCount = parseInt(downloadsResult.rows[0].total) || 0;

        // Get hero background URL from site settings
        const settingsQuery = `
            SELECT value 
            FROM site_settings 
            WHERE key = 'hero_background_url'
        `;
        const settingsResult = await this.db.query(settingsQuery);
        const heroBackgroundUrl = settingsResult.rows[0]?.value || null;

        return {
            modsCount,
            downloadsCount,
            heroBackgroundUrl
        };
    }
}
