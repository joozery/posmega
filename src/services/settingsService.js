import api from './api';

export const settingsService = {
  // Get all settings
  async getAllSettings() {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  // Update settings
  async updateSettings(settingsData) {
    try {
      const response = await api.put('/settings', settingsData);
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  // Upload logo
  async uploadLogo(file) {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await api.post('/settings/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  },

  // Delete logo
  async deleteLogo() {
    try {
      const response = await api.delete('/settings/logo');
      return response.data;
    } catch (error) {
      console.error('Error deleting logo:', error);
      throw error;
    }
  }
}; 