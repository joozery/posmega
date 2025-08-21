import api from './api';

export const authService = {
  // Login
  async login(username, password) {
    try {
      console.log('🔐 authService.login called with:', { username });
      const response = await api.post('/auth/login', { username, password });
      const { token, user } = response.data;
      
      console.log('✅ authService.login response:', { token: token ? 'exists' : 'missing', user });
      
      // Store token and user data
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('💾 authService.login - stored in localStorage:', {
        token: localStorage.getItem('auth_token') ? 'exists' : 'missing',
        user: localStorage.getItem('user') ? 'exists' : 'missing'
      });
      
      return { token, user };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout
  async logout() {
    try {
      console.log('🚪 authService.logout - calling API...');
      await api.post('/auth/logout');
      console.log('✅ authService.logout - API call successful');
    } catch (error) {
      console.error('❌ authService.logout error:', error);
    } finally {
      console.log('🧹 authService.logout - removing localStorage data...');
      // Remove stored data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      console.log('✅ authService.logout - localStorage cleared');
    }
  },

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    console.log('👤 authService.getCurrentUser:', user);
    return user;
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('auth_token');
    const isAuth = !!token;
    console.log('🔑 authService.isAuthenticated:', { token: token ? 'exists' : 'missing', isAuth });
    return isAuth;
  },

  // Get token
  getToken() {
    const token = localStorage.getItem('auth_token');
    console.log('🎫 authService.getToken:', token ? 'exists' : 'missing');
    return token;
  },

  // Refresh token
  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh');
      const { token } = response.data;
      localStorage.setItem('auth_token', token);
      return token;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }
}; 