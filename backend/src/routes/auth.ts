import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { UserService } from '../services/users';

export default async function authRoutes(server: FastifyInstance) {
    const userService = new UserService(server.pg);

    server.post('/auth/register', async (request, reply) => {
        const { username, email, password } = request.body as any;

        if (!username || !email || !password) {
            return reply.code(400).send({ error: 'Missing fields' });
        }

        try {
            const { user, code } = await userService.create(username, email, password);

            // In a real app, we'd send an email here. 
            // For now, we return the code so the user can complete the flow.
            return {
                message: 'Verification code sent to email',
                email: user.email,
                debugCode: code // Remove in production
            };
        } catch (err: any) {
            if (err.code === '23505') {
                return reply.code(409).send({ error: 'Username or email already exists' });
            }
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    server.post('/auth/verify', async (request, reply) => {
        const { email, code } = request.body as any;
        if (!email || !code) {
            return reply.code(400).send({ error: 'Email and code are required' });
        }

        const user = await userService.verify(email, code);
        if (!user) {
            return reply.code(400).send({ error: 'Invalid or expired verification code' });
        }

        const token = server.jwt.sign({ id: user.id, role: user.role });
        return { user, token };
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

        if (!user.is_verified) {
            return reply.code(403).send({ error: 'Email not verified', needsVerification: true });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return reply.code(401).send({ error: 'Invalid email or password' });
        }

        const token = server.jwt.sign({ id: user.id, role: user.role });
        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            token
        };
    });

    // --- GOOGLE OAUTH ---
    server.get('/auth/google', async (request, reply) => {
        const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const options = {
            redirect_uri: `${process.env.FRONTEND_URL}/api/auth/google/callback`,
            client_id: process.env.GOOGLE_CLIENT_ID || '',
            access_type: 'offline',
            response_type: 'code',
            prompt: 'select_account',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
            ].join(' '),
        };
        const qs = new URLSearchParams(options);
        return reply.redirect(`${rootUrl}?${qs.toString()}`);
    });

    server.get('/auth/google/callback', async (request, reply) => {
        const { code } = request.query as any;
        if (!code) return reply.code(400).send({ error: 'Code not found' });

        try {
            // 1. Exchange code for token
            const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code,
                    client_id: process.env.GOOGLE_CLIENT_ID || '',
                    client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
                    redirect_uri: `${process.env.FRONTEND_URL}/api/auth/google/callback`,
                    grant_type: 'authorization_code',
                }),
            });
            const { access_token } = await tokenRes.json() as any;

            // 2. Get user info
            const userRes = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=${access_token}`);
            const googleUser = await userRes.json() as any;

            // 3. Login or register
            let user = await userService.findBySocialId('google', googleUser.id);
            if (!user) {
                user = await userService.findByEmail(googleUser.email);
                if (user) {
                    await server.pg.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleUser.id, user.id]);
                } else {
                    const result = await userService.create(googleUser.name || googleUser.email.split('@')[0], googleUser.email, undefined, true);
                    user = result.user;
                    await server.pg.query('UPDATE users SET google_id = $1, avatar_url = $2 WHERE id = $3', [googleUser.id, googleUser.picture, user.id]);
                }
            }

            const token = server.jwt.sign({ id: user.id, role: user.role });
            // Redirect back to frontend with token
            return reply.redirect(`${process.env.FRONTEND_URL}/auth?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
        } catch (err: any) {
            server.log.error(err);
            return reply.redirect(`${process.env.FRONTEND_URL}/auth?error=google_auth_failed`);
        }
    });

    // --- YANDEX OAUTH ---
    server.get('/auth/yandex', async (request, reply) => {
        const rootUrl = 'https://oauth.yandex.ru/authorize';
        const options = {
            response_type: 'code',
            client_id: process.env.YANDEX_CLIENT_ID || '',
            redirect_uri: `${process.env.FRONTEND_URL}/api/auth/yandex/callback`,
        };
        const qs = new URLSearchParams(options);
        return reply.redirect(`${rootUrl}?${qs.toString()}`);
    });

    server.get('/auth/yandex/callback', async (request, reply) => {
        const { code } = request.query as any;
        if (!code) return reply.code(400).send({ error: 'Code not found' });

        try {
            // 1. Exchange code for token
            const tokenRes = await fetch('https://oauth.yandex.ru/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code,
                    client_id: process.env.YANDEX_CLIENT_ID || '',
                    client_secret: process.env.YANDEX_CLIENT_SECRET || '',
                    grant_type: 'authorization_code',
                }),
            });
            const { access_token } = await tokenRes.json() as any;

            // 2. Get user info
            const userRes = await fetch('https://login.yandex.ru/info?format=json', {
                headers: { Authorization: `OAuth ${access_token}` }
            });
            const yandexUser = await userRes.json() as any;

            // 3. Login or register
            let user = await userService.findBySocialId('yandex', yandexUser.id);
            if (!user) {
                user = await userService.findByEmail(yandexUser.default_email);
                if (user) {
                    await server.pg.query('UPDATE users SET yandex_id = $1 WHERE id = $2', [yandexUser.id, user.id]);
                } else {
                    const result = await userService.create(yandexUser.display_name || yandexUser.login, yandexUser.default_email, undefined, true);
                    user = result.user;
                    const avatarUrl = yandexUser.default_avatar_id ? `https://avatars.yandex.net/get-yapic/${yandexUser.default_avatar_id}/islands-200` : null;
                    await server.pg.query('UPDATE users SET yandex_id = $1, avatar_url = $2 WHERE id = $3', [yandexUser.id, avatarUrl, user.id]);
                }
            }

            const token = server.jwt.sign({ id: user.id, role: user.role });
            return reply.redirect(`${process.env.FRONTEND_URL}/auth?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
        } catch (err: any) {
            server.log.error(err);
            return reply.redirect(`${process.env.FRONTEND_URL}/auth?error=yandex_auth_failed`);
        }
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
        const decoded = request.user as any;
        // Fetch full user data to ensure we have latest info
        const { rows } = await server.pg.query('SELECT id, username, email, role, avatar_url FROM users WHERE id = $1', [decoded.id]);
        return rows[0];
    });
}
