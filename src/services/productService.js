import api from './api';

export const productService = {
  // Get all products
  async getAllProducts(params = {}) {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get product by ID
  async getProductById(id) {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Create new product
  async createProduct(productData) {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product
  async updateProduct(id, productData) {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product
  async deleteProduct(id) {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Search products (using search parameter)
  async searchProducts(query) {
    try {
      const response = await api.get('/products', { 
        params: { search: query } 
      });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Get products by category (using category parameter)
  async getProductsByCategory(category) {
    try {
      const response = await api.get('/products', { 
        params: { category: category } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },

  // Get product categories
  async getProductCategories() {
    try {
      const response = await api.get('/products/categories/list');
      return response.data;
    } catch (error) {
      console.error('Error fetching product categories:', error);
      throw error;
    }
  },

  // Update stock
  async updateStock(id, quantity, reason = null) {
    try {
      const response = await api.patch(`/products/${id}/stock`, { 
        quantity: quantity,
        reason: reason 
      });
      return response.data;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  }
}; 