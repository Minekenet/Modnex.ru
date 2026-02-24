import { FastifyInstance } from 'fastify';
import { SupportService } from '../services/support';
import { NotificationService } from '../services/notifications';

export default async function supportRoutes(server: FastifyInstance) {
    const supportService = new SupportService(server.pg);
    const notificationService = new NotificationService(server.pg);

    const requireAuth = async (request: any, reply: any) => {
        try {
            await request.jwtVerify();
        } catch {
            return reply.code(401).send({ error: 'Unauthorized' });
        }
    };

    server.get('/support/tickets', {
        onRequest: [requireAuth]
    }, async (request, reply) => {
        const user = request.user as { id: string; role: string };
        try {
            const tickets = await supportService.getTicketsByUser(user.id);
            return tickets;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    server.post('/support/tickets', {
        onRequest: [requireAuth]
    }, async (request, reply) => {
        const user = request.user as { id: string };
        const body = request.body as { subject: string };
        if (!body.subject || body.subject.trim().length < 20) {
            return reply.code(400).send({ error: 'Тема обращения должна содержать не менее 20 символов' });
        }
        try {
            const { rows } = await server.pg.query(
                "SELECT created_at FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
                [user.id]
            );
            if (rows.length > 0) {
                const lastTicketTime = new Date(rows[0].created_at).getTime();
                const now = Date.now();
                if (now - lastTicketTime < 5 * 60 * 1000) {
                    return reply.code(429).send({ error: 'Пожалуйста, подождите 5 минут перед созданием нового обращения' });
                }
            }
            const ticket = await supportService.createTicket(user.id, body.subject.trim());
            return ticket;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    server.get('/support/tickets/:ticketId/messages', {
        onRequest: [requireAuth]
    }, async (request, reply) => {
        const user = request.user as { id: string; role: string };
        const { ticketId } = request.params as { ticketId: string };
        try {
            const ticket = await supportService.getTicketById(ticketId);
            if (!ticket) return reply.code(404).send({ error: 'Ticket not found' });
            if (ticket.user_id !== user.id && user.role !== 'admin') {
                return reply.code(403).send({ error: 'Forbidden' });
            }
            const messages = await supportService.getMessages(ticketId);
            return messages;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    server.post('/support/tickets/:ticketId/messages', {
        onRequest: [requireAuth]
    }, async (request, reply) => {
        const user = request.user as { id: string; role: string };
        const { ticketId } = request.params as { ticketId: string };
        const body = request.body as { body: string };
        if (!body.body || !body.body.trim()) {
            return reply.code(400).send({ error: 'Message body is required' });
        }
        try {
            const ticket = await supportService.getTicketById(ticketId);
            if (!ticket) return reply.code(404).send({ error: 'Ticket not found' });
            if (ticket.user_id !== user.id && user.role !== 'admin') {
                return reply.code(403).send({ error: 'Forbidden' });
            }
            const isStaff = user.role === 'admin';
            const message = await supportService.addMessage(ticketId, user.id, body.body.trim(), isStaff);
            if (isStaff && ticket.user_id !== user.id) {
                await notificationService.create(ticket.user_id, 'В вашем обращении в поддержку новый ответ.', 'support');
            }
            return message;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });
}
