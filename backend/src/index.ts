import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

import db from './plugins/db';
import storage from './plugins/storage';
import authRoutes from './routes/auth';
import gamesRoutes from './routes/games';
import itemsRoutes from './routes/items';
import filesRoutes from './routes/files';
import fastifyJwt from '@fastify/jwt';
import fastifyMultipart from '@fastify/multipart';

dotenv.config();

const server: FastifyInstance = Fastify({
    logger: true
});

server.register(cors, {
    origin: '*' // Configure this appropriately for production
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

import { runMigrations } from './db/migrate';

server.ready(async (err) => {
    if (err) throw err;
    await runMigrations(server);
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
