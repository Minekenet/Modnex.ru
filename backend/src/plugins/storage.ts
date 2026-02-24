import fp from 'fastify-plugin';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FastifyInstance } from 'fastify';
import { PassThrough, Readable } from 'stream';

export interface StoragePlugin {
    client: S3Client;
    uploadFile: (key: string, body: Buffer | Uint8Array | Readable | string, contentType: string, cacheControl?: string) => Promise<{ url: string; size: number }>;
    getFileUrl: (key: string) => Promise<string>;
    deleteFile: (key: string) => Promise<void>;
}

declare module 'fastify' {
    interface FastifyInstance {
        storage: StoragePlugin;
    }
}

export default fp(async (server: FastifyInstance) => {
    const s3Client = new S3Client({
        region: process.env.S3_REGION || 'us-east-1',
        endpoint: process.env.S3_ENDPOINT || 'http://minio:9000',
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
            secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
        },
        forcePathStyle: true, // Needed for MinIO
    });

    const bucket = process.env.S3_BUCKET || 'modnex-files';

    server.decorate('storage', {
        client: s3Client,

        async uploadFile(key: string, body: any, contentType: string, cacheControl?: string) {
            const { Upload } = await import('@aws-sdk/lib-storage');

            let size = 0;
            let uploadBody: any = body;

            if (Buffer.isBuffer(body)) {
                size = body.length;
            } else if (body instanceof Uint8Array) {
                size = body.byteLength;
            } else if (typeof body === 'string') {
                size = Buffer.byteLength(body);
            } else if (body instanceof Readable) {
                const passThrough = new PassThrough();
                body.pipe(passThrough);
                passThrough.on('data', (chunk) => {
                    size += chunk.length;
                });
                uploadBody = passThrough;
            }

            const parallelUploads3 = new Upload({
                client: s3Client,
                params: {
                    Bucket: bucket,
                    Key: key,
                    Body: uploadBody,
                    ContentType: contentType,
                    ...(cacheControl ? { CacheControl: cacheControl } : {})
                },
            });

            await parallelUploads3.done();

            const publicEndpoint = process.env.S3_PUBLIC_ENDPOINT || 'http://localhost:9000';
            return {
                url: `${publicEndpoint}/${bucket}/${key}`,
                size
            };
        },

        async getFileUrl(key: string) {
            const filename = key.split('/').pop();
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key,
                ResponseContentDisposition: filename ? `attachment; filename="${filename}"` : 'attachment'
            });
            // Generate presigned URL valid for 1 hour
            const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            return url;
        },

        async deleteFile(key: string) {
            const command = new DeleteObjectCommand({
                Bucket: bucket,
                Key: key,
            });
            await s3Client.send(command);
        }
    });
});
