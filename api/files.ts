
import api from './client';

export const filesService = {
    /**
     * Uploads a new file version for an item.
     * Expects metadata (version, changelog) in the Query Params for streaming simplicity on backend.
     */
    async uploadVersion(itemId: string, version: string, file: File, changelog: string = '', extraData?: Record<string, string>) {
        const formData = new FormData();
        formData.append('file', file);

        const params: Record<string, string> = { version, changelog };
        if (extraData) Object.assign(params, extraData);

        const response = await api.post(`/items/${itemId}/files`, formData, {
            params,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            // Track upload progress if needed
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                console.log('Upload progress:', percentCompleted);
            }
        });
        return response.data;
    },

    async listVersions(itemId: string) {
        const response = await api.get(`/items/${itemId}/files`);
        return response.data;
    },

    async getDownloadUrl(fileId: string) {
        const response = await api.get(`/files/${fileId}/download`);
        return response.data; // { url: '...' }
    },

    async uploadGalleryImage(itemId: string, file: File, isPrimary: boolean = false) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/items/${itemId}/gallery`, formData, {
            params: { primary: isPrimary },
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};
