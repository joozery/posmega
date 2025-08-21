import api from './api';

export const categoriesService = {
  // Get all categories
  async getAllCategories(activeOnly = false) {
    try {
      const params = activeOnly ? '?active_only=true' : '';
      const response = await api.get(`/categories${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get category by ID
  async getCategoryById(id) {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  // Create new category
  async createCategory(categoryData) {
    try {
      const response = await api.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update category
  async updateCategory(id, categoryData) {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category
  async deleteCategory(id, force = false) {
    try {
      const params = force ? '?force=true' : '';
      const response = await api.delete(`/categories/${id}${params}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Reorder categories
  async reorderCategories(categories) {
    try {
      const response = await api.put('/categories/reorder', { categories });
      return response.data;
    } catch (error) {
      console.error('Error reordering categories:', error);
      throw error;
    }
  },

  // Get category statistics
  async getCategoryStats() {
    try {
      const response = await api.get('/categories/stats/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching category stats:', error);
      throw error;
    }
  }
};



