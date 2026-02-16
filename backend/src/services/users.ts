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
}
