import fp from 'fastify-plugin';
import fastifyPostgres from '@fastify/postgres';
import { FastifyInstance } from 'fastify';

export default fp(async (server: FastifyInstance) => {
    server.register(fastifyPostgres, {
        connectionString: process.env.DATABASE_URL
    });
});
