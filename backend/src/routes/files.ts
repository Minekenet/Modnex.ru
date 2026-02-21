import { FastifyInstance } from 'fastify';
import { FileService } from '../services/files';
import { ItemService } from '../services/items';

export default async function filesRoutes(server: FastifyInstance) {
    const fileService = new FileService(server.pg, server.storage);
    const itemService = new ItemService(server.pg);

    // Upload Version (Auth Required)
    // POST /items/:itemId/files
    // Multipart form-data: file, version, changelog
    server.post('/items/:itemId/files', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const { itemId } = request.params as any;
        const user = request.user;

        // Check item ownership (TODO: Middleware for permissions)
        // For now assuming the user is valid, in production check if user.id === item.author_id

        try {
            const data = await request.file();
            if (!data) return reply.code(400).send({ error: 'No file uploaded' });

            // Extract fields from multipart fields (they come as separate parts or attached to file)
            // Fastify multipart usage: fields are available on data.fields if strict or iterating
            // For simplicity, we expect the client to send fields. 
            // Note: @fastify/multipart with addToBody: true simplifies this but streaming is better for large files.
            // We are using streaming 'request.file()'. The fields come alongside.
            // Wait, 'request.file()' gets the *first* file. 
            // We need to parse fields 'version' and 'changelog'.

            // Let's assume the client sends headers or we use a different approach for fields + stream
            // A common pattern with fastify-multipart stream is to append fields to the query or use busboy events.
            // EASIER SCOLUTION: Use `attachFieldsToBody: true` in multipart config for small fields 
            // OR parse form fields manually from the stream.

            // For this MVP, let's look at fields on the file object object if using `attachFieldsToBody: 'keyValues'`? 
            // Actually, standard practice is:
            // const parts = request.parts()
            // for await (const part of parts) { ... }

            // But let's simplify: pass metadata in Headers or Query for specific upload endpoint?
            // No, let's use the field properties.
            // Since `data.fields` contains other fields.

            // Actually, to keep it VERY simple and robust:
            // Client sends: version, changelog, file.
            // We'll read the fields from `data.fields` (but that requires buffering or specific order).

            // Alternative: Use `request.body` if `addToBody: true` is set (but limits file size to RAM).
            // We want Scalability. So we want Streams.
            // Let's assume metadata is passed in Query Params for the Upload URL to keep streaming simple?
            // POST /items/:id/files?version=1.0.0&changelog=Initial

            const query = request.query as any;
            if (!query.version) return reply.code(400).send({ error: 'Missing version in query params' });
            const extraData: Record<string, string> = {};
            Object.keys(query).forEach(k => {
                if (!['version', 'changelog'].includes(k) && query[k] != null) extraData[k] = String(query[k]);
            });
            const fileRecord = await fileService.uploadVersion(itemId, query.version, data, query.changelog, Object.keys(extraData).length ? extraData : undefined);
            return fileRecord;

        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Download File
    // GET /files/:fileId/download
    server.get('/files/:fileId/download', async (request, reply) => {
        const { fileId } = request.params as any;
        try {
            const url = await fileService.getDownloadUrl(fileId);
            if (!url) return reply.code(404).send({ error: 'File not found' });
            return { url };
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // List Versions
    // GET /items/:itemId/files
    server.get('/items/:itemId/files', async (request, reply) => {
        const { itemId } = request.params as any;
        try {
            const files = await fileService.listVersions(itemId);
            return files;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });

    // Upload Gallery Image (Auth Required)
    server.post('/items/:itemId/gallery', {
        onRequest: [async (request) => await request.jwtVerify()]
    }, async (request, reply) => {
        const { itemId } = request.params as any;
        const query = request.query as any;
        try {
            const file = await request.file();
            if (!file) return reply.code(400).send({ error: 'No file uploaded' });

            const isPrimary = query.primary === 'true';
            const record = await fileService.uploadGalleryImage(itemId, file, isPrimary);
            return record;
        } catch (err) {
            server.log.error(err);
            return reply.code(500).send({ error: 'Internal Server Error' });
        }
    });
}
