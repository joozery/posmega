import api from './api';

export const salesService = {
  // Get all sales with filters
  async getAllSales(params = {}) {
    try {
      const response = await api.get('/sales', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  },

  // Get sale by ID
  async getSaleById(id) {
    try {
      const response = await api.get(`/sales/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sale:', error);
      throw error;
    }
  },

  // Create new sale
  async createSale(saleData) {
    try {
      const response = await api.post('/sales', saleData);
      return response.data;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  },

  // Process refund
  async processRefund(saleId, refundData) {
    try {
      const response = await api.post(`/sales/${saleId}/refund`, refundData);
      return response.data;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  },

  // Get sales statistics
  async getSalesStats(params = {}) {
    try {
      const response = await api.get('/sales/stats/summary', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales stats:', error);
      throw error;
    }
  }
}; 