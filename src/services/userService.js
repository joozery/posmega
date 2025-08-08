import api from './api';

export const userService = {
  // Get all users
  async getUsers() {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  // Create new user
  async createUser(userData) {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  // Update user
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },

  // Change user password
  async changeUserPassword(id, newPassword) {
    try {
      const response = await api.put(`/users/${id}/password`, { newPassword });
      return response.data;
    } catch (error) {
      console.error('Change user password error:', error);
      throw error;
    }
  },

  // Toggle user active status
  async toggleUserStatus(id, isActive) {
    try {
      const response = await api.put(`/users/${id}`, { isActive });
      return response.data;
    } catch (error) {
      console.error('Toggle user status error:', error);
      throw error;
    }
  }
}; 