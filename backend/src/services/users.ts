import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';

export class UserService {
    private db: FastifyInstance['pg'];

    constructor(db: FastifyInstance['pg']) {
        this.db = db;
    }

    async create(username: string, email: string, password: string) {
        const passwordHash = await bcrypt.hash(password, 10);

        const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, role, created_at
    `;

        const { rows } = await this.db.query(query, [username, email, passwordHash]);
        return rows[0];
    }

    async findByEmail(email: string) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await this.db.query(query, [email]);
        return rows[0];
    }
}
