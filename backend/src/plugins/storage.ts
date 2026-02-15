import fp from 'fastify-plugin';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FastifyInstance } from 'fastify';

export interface StoragePlugin {
    client: S3Client;
    uploadFile: (key: string, body: Buffer | Uint8Array | Blob | string | ReadableStream, contentType: string) => Promise<string>;
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

        async uploadFile(key: string, body: any, contentType: string) {
            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: body,
                ContentType: contentType,
            });
            await s3Client.send(command);
            // Return public URL or internal path
            // Note: In a real scenario, you might want to return a full URL if it's public
            return `${process.env.S3_ENDPOINT}/${bucket}/${key}`;
        },

        async getFileUrl(key: string) {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key,
            });
            // Generate presigned URL valid for 1 hour
            return getSignedUrl(s3Client, command, { expiresIn: 3600 });
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
