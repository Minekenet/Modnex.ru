import { FastifyInstance } from 'fastify';
import { StoragePlugin } from '../plugins/storage';

export class FileService {
    private db: FastifyInstance['pg'];
    private storage: StoragePlugin;

    constructor(db: FastifyInstance['pg'], storage: StoragePlugin) {
        this.db = db;
        this.storage = storage;
    }

    async uploadVersion(itemId: string, versionNumber: string, file: any, changelog?: string, extraData?: Record<string, string>) {
        const key = `items/${itemId}/${versionNumber}/${file.filename}`;
        const fileBody = file.file || file;
        await this.storage.uploadFile(key, fileBody, file.mimetype);

        const fileData: Record<string, any> = {
            filename: file.filename,
            mimetype: file.mimetype,
            encoding: file.encoding,
            ...(extraData || {})
        };

        const query = `
      INSERT INTO files (item_id, version_number, file_url, changelog, data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const { rows } = await this.db.query(query, [
            itemId,
            versionNumber,
            key,
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

    async uploadGalleryImage(itemId: string, file: any, isPrimary: boolean = false) {
        // 1. Upload to S3
        const key = `gallery/${itemId}/${Date.now()}_${file.filename}`;
        const fileBody = file.file || file;
        await this.storage.uploadFile(key, fileBody, file.mimetype);

        // 2. Save to Database
        const query = `
            INSERT INTO item_gallery (item_id, url, is_primary)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const { rows } = await this.db.query(query, [itemId, key, isPrimary]);
        return rows[0];
    }
}
