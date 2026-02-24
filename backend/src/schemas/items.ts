export const createItemSchema = {
    body: {
        type: 'object',
        required: ['title', 'description'],
        properties: {
            title: { type: 'string', minLength: 3, maxLength: 100 },
            slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
            summary: { type: 'string', maxLength: 255 },
            description: { type: 'string', minLength: 10 },
            attributes: { type: 'object' },
            links: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['label', 'url'],
                    properties: {
                        label: { type: 'string' },
                        url: { type: 'string', format: 'uri' }
                    }
                }
            },
            status: { type: 'string', enum: ['draft', 'published', 'hidden'] }
        }
    }
};
