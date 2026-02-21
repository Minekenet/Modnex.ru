import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';

export class UserService {
    private db: FastifyInstance['pg'];

    constructor(db: FastifyInstance['pg']) {
        this.db = db;
    }

    async create(username: string, email: string, password?: string, isVerified = false) {
        // Clean up any expired unverified users with this email/username first
        await this.cleanExpiredUnverified(username, email);

        const passwordHash = password ? await bcrypt.hash(password, 10) : null;
        const verificationCode = isVerified ? null : Math.floor(100000 + Math.random() * 900000).toString();
        const verificationExpires = isVerified ? null : new Date(Date.now() + 30 * 60 * 1000); // 30 mins

        const query = `
      INSERT INTO users (username, email, password_hash, is_verified, verification_code, verification_expires)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, email, role, is_verified, created_at
    `;

        const { rows } = await this.db.query(query, [username, email, passwordHash, isVerified, verificationCode, verificationExpires]);
        return { user: rows[0], code: verificationCode };
    }

    async verify(email: string, code: string) {
        const query = `
            UPDATE users 
            SET is_verified = true, verification_code = NULL, verification_expires = NULL
            WHERE email = $1 AND verification_code = $2 AND verification_expires > CURRENT_TIMESTAMP
            RETURNING id, username, email, role, is_verified
        `;
        const { rows } = await this.db.query(query, [email, code]);
        return rows[0];
    }

    async cleanExpiredUnverified(username?: string, email?: string) {
        // Delete users who haven't verified and whose code has expired
        // Also delete if we're trying to re-register with same email/username that is unverified
        let query = 'DELETE FROM users WHERE is_verified = false AND (verification_expires < CURRENT_TIMESTAMP';
        const params: any[] = [];

        if (username || email) {
            query += ' OR ';
            if (username && email) {
                query += 'username = $1 OR email = $2';
                params.push(username, email);
            } else if (username) {
                query += 'username = $1';
                params.push(username);
            } else {
                query += 'email = $1';
                params.push(email);
            }
        }
        query += ')';

        await this.db.query(query, params);
    }

    async findByUsername(username: string) {
        const query = 'SELECT id, username, display_name, email, role, avatar_url, banner_url, bio, links, created_at FROM users WHERE username = $1';
        const { rows } = await this.db.query(query, [username]);
        return rows[0];
    }

    async update(userId: string, data: { display_name?: string; bio?: string; avatar_url?: string; banner_url?: string }) {
        const fields: string[] = [];
        const params: any[] = [userId];
        let paramIndex = 2;

        for (const [key, value] of Object.entries(data)) {
            if (['display_name', 'bio', 'avatar_url', 'banner_url', 'links'].includes(key)) {
                fields.push(`${key} = $${paramIndex}`);
                params.push(key === 'links' ? JSON.stringify(value) : value);
                paramIndex++;
            }
        }

        if (fields.length === 0) return null;

        const query = `
            UPDATE users 
            SET ${fields.join(', ')} 
            WHERE id = $1 
            RETURNING id, username, display_name, email, role, avatar_url, banner_url, bio, links
        `;
        const { rows } = await this.db.query(query, params);
        return rows[0];
    }

    async findByEmail(email: string) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await this.db.query(query, [email]);
        return rows[0];
    }

    async findBySocialId(provider: 'google' | 'yandex', id: string) {
        const column = provider === 'google' ? 'google_id' : 'yandex_id';
        const query = `SELECT * FROM users WHERE ${column} = $1`;
        const { rows } = await this.db.query(query, [id]);
        return rows[0];
    }

    async getFavorites(userId: string) {
        const query = `
            SELECT g.* 
            FROM games g
            JOIN user_favorite_games ufg ON g.id = ufg.game_id 
            WHERE ufg.user_id = $1
        `;
        const { rows } = await this.db.query(query, [userId]);
        return rows;
    }

    async mergeFavorites(userId: string, localGameIds: string[]) {
        // Get current favorites from DB
        const dbFavsQuery = `
            SELECT game_id 
            FROM user_favorite_games 
            WHERE user_id = $1
        `;
        const dbFavsResult = await this.db.query(dbFavsQuery, [userId]);
        const dbGameIds = dbFavsResult.rows.map((r: any) => r.game_id);

        // Union: combine DB and local favorites, remove duplicates
        const allGameIds = [...new Set([...dbGameIds, ...localGameIds])];

        // Insert missing favorites (ON CONFLICT handles duplicates)
        if (allGameIds.length > dbGameIds.length) {
            const newGameIds = allGameIds.filter(id => !dbGameIds.includes(id));
            if (newGameIds.length > 0) {
                const values = newGameIds.map((_, idx) => `($1, $${idx + 2})`).join(', ');
                const params = [userId, ...newGameIds];
                const insertQuery = `
                    INSERT INTO user_favorite_games (user_id, game_id)
                    VALUES ${values}
                    ON CONFLICT DO NOTHING
                `;
                await this.db.query(insertQuery, params);
            }
        }

        // Return merged list
        const mergedQuery = `
            SELECT g.* 
            FROM games g
            JOIN user_favorite_games ufg ON g.id = ufg.game_id 
            WHERE ufg.user_id = $1
        `;
        const mergedResult = await this.db.query(mergedQuery, [userId]);
        return mergedResult.rows;
    }

    async addFavorite(userId: string, gameId: string) {
        const query = `
            INSERT INTO user_favorite_games (user_id, game_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            RETURNING *
        `;
        const { rows } = await this.db.query(query, [userId, gameId]);
        return rows[0];
    }

    async removeFavorite(userId: string, gameId: string) {
        const query = `
            DELETE FROM user_favorite_games 
            WHERE user_id = $1 AND game_id = $2
        `;
        await this.db.query(query, [userId, gameId]);
        return { success: true };
    }
}
