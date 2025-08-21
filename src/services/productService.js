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
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all text fields
      Object.keys(productData).forEach(key => {
        if (key === 'newImage' && productData[key] instanceof File) {
          formData.append('image', productData[key]);
        } else if (key === 'sizes' || key === 'colors') {
          // Convert arrays to JSON strings for form-data
          if (Array.isArray(productData[key])) {
            formData.append(key, JSON.stringify(productData[key]));
          }
        } else if (key === 'sku') {
          // Map SKU to barcode field
          formData.append('barcode', productData[key]);
        } else if (productData[key] !== null && productData[key] !== undefined && key !== 'newImage') {
          formData.append(key, productData[key]);
        }
      });

      const response = await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product
  async updateProduct(id, productData) {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all text fields
      Object.keys(productData).forEach(key => {
        if (key === 'newImage' && productData[key] instanceof File) {
          formData.append('image', productData[key]);
        } else if (key === 'sizes' || key === 'colors') {
          // Convert arrays to JSON strings for form-data
          if (Array.isArray(productData[key])) {
            formData.append(key, JSON.stringify(productData[key]));
          }
        } else if (key === 'sku') {
          // Map SKU to barcode field
          formData.append('barcode', productData[key]);
        } else if (productData[key] !== null && productData[key] !== undefined && key !== 'newImage') {
          formData.append(key, productData[key]);
        }
      });

      const response = await api.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
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
      console.log('📂 productService.getProductCategories - calling API...');
      const response = await api.get('/products/categories/list');
      console.log('✅ productService.getProductCategories - response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching product categories:', error);
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