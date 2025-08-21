import api from './api';

export const settingsService = {
  // Get all settings
  async getAllSettings() {
    try {
      console.log('🔧 settingsService.getAllSettings - calling API...');
      const response = await api.get('/settings');
      console.log('✅ settingsService.getAllSettings - response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update settings
  async updateSettings(settingsData, retryCount = 0) {
    const maxRetries = 2;
    
    try {
      // Wrap settings data in the format expected by backend API
      const payload = {
        settings: settingsData
      };
      
      console.log('🔧 settingsService.updateSettings - payload:', JSON.stringify(payload, null, 2));
      console.log(`🔄 Attempt ${retryCount + 1}/${maxRetries + 1}`);
      
      const response = await api.put('/settings', payload);
      console.log('✅ settingsService.updateSettings - response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating settings (attempt ${retryCount + 1}):`, error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);
      
      // Retry logic for timeout errors
      if ((error.code === 'ECONNABORTED' || error.message.includes('timeout')) && retryCount < maxRetries) {
        console.log(`🔄 Retrying... (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return this.updateSettings(settingsData, retryCount + 1);
      }
      
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