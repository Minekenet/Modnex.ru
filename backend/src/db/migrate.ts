import { FastifyInstance } from 'fastify';
import fs from 'fs';
import path from 'path';

export async function runMigrations(server: FastifyInstance) {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        server.log.info('Running database migrations...');

        await server.pg.transact(async (client) => {
            await client.query(schemaSql);
        });

        server.log.info('Database migrations completed successfully.');
    } catch (error) {
        server.log.error(error, 'Failed to run database migrations');
        throw error;
    }
}
