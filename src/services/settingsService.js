import api from './api';

export const settingsService = {
  // Get all settings
  async getSettings() {
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
      const response = await api.put('/settings', { settings: settingsData });
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  // Update specific setting
  async updateSetting(category, key, value) {
    try {
      const response = await api.put('/settings', {
        category,
        key,
        value
      });
      return response.data;
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  },

  // Upload logo
  async uploadLogo(file) {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await api.post('/settings/logo', formData);
      return response.data;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  },

  // Remove logo
  async removeLogo() {
    try {
      const response = await api.delete('/settings/logo');
      return response.data;
    } catch (error) {
      console.error('Error removing logo:', error);
      throw error;
    }
  }
}; 