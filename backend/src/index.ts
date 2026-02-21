import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';

import db from './plugins/db';
import storage from './plugins/storage';
import authRoutes from './routes/auth';
import gamesRoutes from './routes/games';
import itemsRoutes from './routes/items';
import filesRoutes from './routes/files';
import usersRoutes from './routes/users';
import statsRoutes from './routes/stats';
import suggestionsRoutes from './routes/suggestions';
import reportsRoutes from './routes/reports';
import supportRoutes from './routes/support';
import notificationsRoutes from './routes/notifications';
import adminRoutes from './routes/admin';
import fastifyJwt from '@fastify/jwt';
import fastifyMultipart from '@fastify/multipart';

dotenv.config();

const server: FastifyInstance = Fastify({
    logger: true
});

server.register(helmet);
server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
});

server.register(cors, {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://modnex.ru'] // Update with real domain
        : true // Allow all in dev
});

server.register(fastifyMultipart, {
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

server.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'supersecret' // Change in production!
});

server.register(db);
server.register(storage);
server.register(authRoutes);
server.register(gamesRoutes);
server.register(itemsRoutes);
server.register(filesRoutes);
server.register(usersRoutes);
server.register(statsRoutes);
server.register(suggestionsRoutes);
server.register(reportsRoutes);
server.register(supportRoutes);
server.register(notificationsRoutes);
server.register(adminRoutes);

import { runMigrations } from './db/migrate';
import { seedDatabase } from './db/seed';

server.ready(async (err) => {
    if (err) throw err;
    try {
        await runMigrations(server);
        await seedDatabase(server);
    } catch (dbErr) {
        server.log.error(dbErr, 'DB initialization failed');
    }
});

server.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '3000');
        const host = '0.0.0.0'; // Important for Docker
        await server.listen({ port, host });
        console.log(`Server listening on ${host}:${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
