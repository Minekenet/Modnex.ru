import { FastifyInstance } from 'fastify';
import fs from 'fs';
import path from 'path';

export async function runMigrations(server: FastifyInstance) {
    const maxRetries = 5;
    const delay = 5000; // 5 seconds

    for (let i = 1; i <= maxRetries; i++) {
        try {
            const schemaPath = path.join(__dirname, 'schema.sql');
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');

            server.log.info(`Running database migrations (attempt ${i}/${maxRetries})...`);

            await server.pg.transact(async (client) => {
                await client.query(schemaSql);
            });

            server.log.info('Database migrations completed successfully.');
            return; // Success, exit the loop
        } catch (error: any) {
            server.log.warn(`Database migration attempt ${i} failed: ${error.message}`);
            if (i === maxRetries) {
                server.log.error(error, 'Failed to run database migrations after max retries');
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}
