import { FastifyInstance } from 'fastify';
import { StoragePlugin } from '../plugins/storage';

export class FileService {
    private db: FastifyInstance['pg'];
    private storage: StoragePlugin;

    constructor(db: FastifyInstance['pg'], storage: StoragePlugin) {
        this.db = db;
        this.storage = storage;
    }

    async uploadVersion(itemId: string, versionNumber: string, file: any, changelog?: string) {
        // 1. Upload to S3
        // Key format: items/{itemId}/{version}/{filename}
        const key = `items/${itemId}/${versionNumber}/${file.filename}`;
        // Support both file stream and buffer (multipart file object has .file stream)
        const fileBody = file.file || file;

        await this.storage.uploadFile(key, fileBody, file.mimetype);

        // 2. Save to Database
        const query = `
      INSERT INTO files (item_id, version_number, file_url, changelog, data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

        const fileData = {
            filename: file.filename,
            mimetype: file.mimetype,
            encoding: file.encoding
        };

        const { rows } = await this.db.query(query, [
            itemId,
            versionNumber,
            key, // Storing key as url for S3 retrieval
            changelog || '',
            JSON.stringify(fileData)
        ]);

        return rows[0];
    }

    async getDownloadUrl(fileId: string) {
        // 1. Get file record
        const query = 'SELECT * FROM files WHERE id = $1';
        const { rows } = await this.db.query(query, [fileId]);
        const file = rows[0];

        if (!file) return null;

        // 2. Generate Presigned URL
        const url = await this.storage.getFileUrl(file.file_url);

        // 3. Increment download count (async, fire and forget)
        this.db.query('UPDATE files SET download_count = download_count + 1 WHERE id = $1', [fileId]);
        this.db.query('UPDATE items SET stats = jsonb_set(stats, \'{downloads}\', (COALESCE(stats->>\'downloads\',\'0\')::int + 1)::text::jsonb) WHERE id = $1', [file.item_id]);

        return url;
    }

    async listVersions(itemId: string) {
        const query = 'SELECT * FROM files WHERE item_id = $1 ORDER BY created_at DESC';
        const { rows } = await this.db.query(query, [itemId]);
        return rows;
    }
}
