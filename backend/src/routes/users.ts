import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { UserService } from '../services/users';
import { ItemService } from '../services/items';

export default async function usersRoutes(server: FastifyInstance) {
    const userService = new UserService(server.pg);
    const itemService = new ItemService(server.pg);

    // Get Public Profile
    server.get('/users/:username', async (request, reply) => {
        const { username } = request.params as any;
        try {
            const user = await userService.findByUsername(username);
            if (!user) return reply.code(404).send({ error: 'User not found' });
            return user;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Get User Items
    server.get('/users/:username/items', async (request, reply) => {
        const { username } = request.params as any;
        const query = request.query as any;
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 20;

        try {
            const items = await itemService.findAllByUser(username, page, limit);
            return items;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Update Own Profile
    server.put('/users/me', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const user = request.user as any;
        const data = request.body as any;

        if (data.bio && data.bio.length > 150) {
            return reply.code(400).send({ error: 'Bio must be less than 150 characters' });
        }

        try {
            const updatedUser = await userService.update(user.id, data);
            return updatedUser;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Favorites
    server.get('/users/me/favorites', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const user = request.user as any;
        try {
            return await userService.getFavorites(user.id);
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    server.post('/users/me/favorites/:gameId', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const user = request.user as any;
        const { gameId } = request.params as any;
        try {
            return await userService.addFavorite(user.id, gameId);
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    server.delete('/users/me/favorites/:gameId', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const user = request.user as any;
        const { gameId } = request.params as any;
        try {
            return await userService.removeFavorite(user.id, gameId);
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Merge favorites endpoint
    server.post('/users/me/favorites/merge', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const user = request.user as any;
        const { gameIds } = request.body as { gameIds: string[] };
        try {
            const merged = await userService.mergeFavorites(user.id, gameIds || []);
            return merged;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Check username availability (for settings)
    server.get('/users/me/check-username', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const user = request.user as any;
        const { username } = request.query as { username?: string };
        if (!username || typeof username !== 'string' || username.length < 2) {
            return reply.code(400).send({ error: 'Invalid username' });
        }
        try {
            const available = await userService.isUsernameAvailable(username.trim(), user.id);
            return { available };
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Update username
    server.patch('/users/me/username', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const user = request.user as any;
        const { username } = request.body as { username?: string };
        if (!username || typeof username !== 'string') {
            return reply.code(400).send({ error: 'Username is required' });
        }
        const trimmed = username.trim();
        if (trimmed.length < 2) {
            return reply.code(400).send({ error: 'Username too short' });
        }
        try {
            const available = await userService.isUsernameAvailable(trimmed, user.id);
            if (!available) return reply.code(409).send({ error: 'Username already taken' });
            const updated = await userService.updateUsername(user.id, trimmed);
            return updated;
        } catch (err: any) {
            if (err.code === '23505') return reply.code(409).send({ error: 'Username already taken' });
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Update email
    server.patch('/users/me/email', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const user = request.user as any;
        const { email } = request.body as { email?: string };
        if (!email || typeof email !== 'string') {
            return reply.code(400).send({ error: 'Email is required' });
        }
        try {
            const updated = await userService.updateEmail(user.id, email.trim());
            return updated;
        } catch (err: any) {
            if (err.code === '23505') return reply.code(409).send({ error: 'Email already in use' });
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Update password
    server.patch('/users/me/password', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const user = request.user as any;
        const { current_password, new_password } = request.body as { current_password?: string; new_password?: string };
        if (!current_password || !new_password) {
            return reply.code(400).send({ error: 'Current password and new password are required' });
        }
        const existing = await userService.findById(user.id);
        if (!existing?.password_hash) {
            return reply.code(400).send({ error: 'Account uses social login; password cannot be set' });
        }
        const valid = await bcrypt.compare(current_password, existing.password_hash);
        if (!valid) return reply.code(401).send({ error: 'Current password is incorrect' });
        try {
            await userService.updatePassword(user.id, new_password);
            return { success: true };
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Delete account (requires password confirmation)
    server.delete('/users/me', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const user = request.user as any;
        const { password } = request.body as { password?: string };
        if (!password) {
            return reply.code(400).send({ error: 'Password is required to delete account' });
        }
        const existing = await userService.findById(user.id);
        if (!existing?.password_hash) {
            return reply.code(400).send({ error: 'Account uses social login; use provider to delete' });
        }
        const valid = await bcrypt.compare(password, existing.password_hash);
        if (!valid) return reply.code(401).send({ error: 'Invalid password' });
        try {
            await userService.deleteAccount(user.id);
            return { success: true };
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });
    // Upload Avatar / Banner
    server.post('/users/me/images', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const user = request.user as any;
        try {
            const data = await request.file();
            if (!data) return reply.code(400).send({ error: 'No file uploaded' });

            const query = request.query as { type?: string };
            const type = query.type;
            if (type !== 'avatar' && type !== 'banner') {
                return reply.code(400).send({ error: 'Invalid image type, must be avatar or banner' });
            }

            const ext = data.filename.split('.').pop();
            const key = `users/${user.id}/${type}_${Date.now()}.${ext}`;
            const fileBody = data.file || data;

            // Cache for 1 year (31536000 seconds) since URL is unique with Date.now()
            const { url } = await server.storage.uploadFile(key, fileBody, data.mimetype, 'max-age=31536000');

            // Save to Database
            if (type === 'avatar') {
                await userService.update(user.id, { avatar_url: url });
            } else {
                await userService.update(user.id, { banner_url: url });
            }

            return { url };
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });
}
