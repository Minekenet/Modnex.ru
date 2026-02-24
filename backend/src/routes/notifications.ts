import { FastifyInstance } from 'fastify';
import { NotificationService } from '../services/notifications';

export default async function notificationsRoutes(server: FastifyInstance) {
    const notificationService = new NotificationService(server.pg);

    const requireAuth = async (request: any, reply: any) => {
        try {
            await request.jwtVerify();
        } catch {
            return reply.code(401).send({ error: 'Unauthorized' });
        }
    };

    server.get('/notifications', {
        onRequest: [requireAuth]
    }, async (request, reply) => {
        const user = request.user as { id: string };
        try {
            const list = await notificationService.getByUser(user.id);
            return list;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    server.get('/notifications/unread-count', {
        onRequest: [requireAuth]
    }, async (request, reply) => {
        const user = request.user as { id: string };
        try {
            const count = await notificationService.getUnreadCount(user.id);
            return { count };
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    server.patch('/notifications/:id/read', {
        onRequest: [requireAuth]
    }, async (request, reply) => {
        const user = request.user as { id: string };
        const { id } = request.params as { id: string };
        try {
            const updated = await notificationService.markRead(id, user.id);
            if (!updated) return reply.code(404).send({ error: 'Not found' });
            return updated;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    server.patch('/notifications/read-all', {
        onRequest: [requireAuth]
    }, async (request, reply) => {
        const user = request.user as { id: string };
        try {
            await notificationService.markAllRead(user.id);
            return { ok: true };
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });
}
