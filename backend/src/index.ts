import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

import db from './plugins/db';
import storage from './plugins/storage';

dotenv.config();

const server: FastifyInstance = Fastify({
    logger: true
});

server.register(cors, {
    origin: '*' // Configure this appropriately for production
});

server.register(db);
server.register(storage);

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
