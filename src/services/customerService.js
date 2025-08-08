import api from './api';

export const customerService = {
  // Get all customers
  async getAllCustomers(params = {}) {
    try {
      const response = await api.get('/customers', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // Get customer by ID
  async getCustomerById(id) {
    try {
      const response = await api.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  },

  // Create new customer
  async createCustomer(customerData) {
    try {
      const response = await api.post('/customers', customerData);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Update customer
  async updateCustomer(id, customerData) {
    try {
      const response = await api.put(`/customers/${id}`, customerData);
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  // Delete customer
  async deleteCustomer(id) {
    try {
      const response = await api.delete(`/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },

  // Search customers
  async searchCustomers(query) {
    try {
      const response = await api.get('/customers', { 
        params: { search: query } 
      });
      return response.data;
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  },

  // Get customer purchase history
  async getCustomerHistory(id) {
    try {
      const response = await api.get(`/customers/${id}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer history:', error);
      throw error;
    }
  }
}; 