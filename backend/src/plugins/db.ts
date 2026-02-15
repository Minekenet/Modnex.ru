import fp from 'fastify-plugin';
import fastifyPostgres from '@fastify/postgres';
import { FastifyInstance } from 'fastify';

declare module 'fastify' {
    interface FastifyInstance {
        pg: import('@fastify/postgres').PostgresDb & Record<string, import('@fastify/postgres').PostgresDb>;
    }
}

export default fp(async (server: FastifyInstance) => {
    server.register(fastifyPostgres, {
        connectionString: process.env.DATABASE_URL
    });
});
