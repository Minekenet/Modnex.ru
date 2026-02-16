
import api from './client';

export const filesService = {
    /**
     * Uploads a new file version for an item.
     * Expects metadata (version, changelog) in the Query Params for streaming simplicity on backend.
     */
    async uploadVersion(itemId: string, version: string, file: File, changelog: string = '') {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post(`/items/${itemId}/files`, formData, {
            params: { version, changelog },
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
    }
};
