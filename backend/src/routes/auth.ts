import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { UserService } from '../services/users';

export default async function authRoutes(server: FastifyInstance) {
    const userService = new UserService(server.pg);

    server.post('/auth/register', async (request, reply) => {
        const { username, email, password } = request.body as any;

        // Basic validation
        if (!username || !email || !password) {
            return reply.code(400).send({ error: 'Missing fields' });
        }

        try {
            const user = await userService.create(username, email, password);
            const token = server.jwt.sign({ id: user.id, role: user.role });

            return { user, token };
        } catch (err: any) {
            if (err.code === '23505') { // Unique violation
                return reply.code(409).send({ error: 'Username or email already exists' });
            }
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    server.post('/auth/login', async (request, reply) => {
        const { email, password } = request.body as any;

        if (!email || !password) {
            return reply.code(400).send({ error: 'Missing email or password' });
        }

        const user = await userService.findByEmail(email);
        if (!user) {
            return reply.code(401).send({ error: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return reply.code(401).send({ error: 'Invalid email or password' });
        }

        const token = server.jwt.sign({ id: user.id, role: user.role });
        return { user: { id: user.id, username: user.username, email: user.email, role: user.role }, token };
    });

    server.get('/auth/me', {
        onRequest: [async (request, reply) => {
            try {
                await request.jwtVerify();
            } catch (err) {
                reply.send(err);
            }
        }]
    }, async (request, reply) => {
        return request.user;
    });
}
