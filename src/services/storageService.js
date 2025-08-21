import api from './api';

export const storageService = {
  // Get storage usage information
  async getStorageUsage() {
    try {
      const response = await api.get('/storage/usage');
      return response.data;
    } catch (error) {
      console.error('Error fetching storage usage:', error);
      throw error;
    }
  },

  // Get detailed resources information
  async getResources(params = {}) {
    try {
      const response = await api.get('/storage/resources', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching storage resources:', error);
      throw error;
    }
  },

  // Clean up unused images
  async cleanupUnusedImages(dryRun = true) {
    try {
      const response = await api.delete('/storage/cleanup', {
        data: { dryRun }
      });
      return response.data;
    } catch (error) {
      console.error('Error cleaning up storage:', error);
      throw error;
    }
  }
};
