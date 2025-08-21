import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import LoginDialog from '@/components/LoginDialog';
import ProtectedRoute from '@/components/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import POS from '@/pages/POS';
import Products from '@/pages/Products';
import Customers from '@/pages/Customers';
import CustomerHistory from '@/pages/CustomerHistory';
import Reports from '@/pages/Reports';
import RefundHistory from '@/pages/RefundHistory';
import Settings from '@/pages/Settings';
import Barcodes from '@/pages/Barcodes';
import Users from '@/pages/Users';
import Storage from '@/pages/Storage';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useAuth, PERMISSIONS } from '@/hooks/useAuth';

const getStripePromise = () => {
  try {
    const settings = JSON.parse(localStorage.getItem('pos_settings') || '{}');
    const publishableKey = settings?.payment?.stripePublishableKey;
    if (publishableKey && publishableKey.startsWith('pk_')) {
      return loadStripe(publishableKey);
    }
  } catch (error) {
    console.error("Error loading Stripe settings:", error);
  }
  return null;
};

function App() {
  const [stripePromise, setStripePromise] = useState(getStripePromise());
  const { isAuthenticated, currentUser, loading } = useAuth();
  
  console.log('🔄 App render:', { 
    isAuthenticated, 
    currentUser: currentUser?.name || null, 
    loading,
    path: window.location.pathname 
  });

  useEffect(() => {
    const handleSettingsChange = () => {
      setStripePromise(getStripePromise());
    };

    window.addEventListener('storage', handleSettingsChange);
    window.addEventListener('settings_updated', handleSettingsChange);
    
    return () => {
      window.removeEventListener('storage', handleSettingsChange);
      window.removeEventListener('settings_updated', handleSettingsChange);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Universal POS</title>
        <meta name="description" content="A versatile Point of Sale system for any business." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      <Router>
        <Elements stripe={stripePromise}>
          {loading ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">กำลังโหลด...</p>
              </div>
            </div>
          ) : !isAuthenticated ? (
            <>
              <Helmet>
                <title>เข้าสู่ระบบ - Universal POS</title>
                <meta name="description" content="เข้าสู่ระบบระบบ Point of Sale" />
              </Helmet>
              <Routes>
                <Route path="/login" element={<LoginDialog />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </>
          ) : (
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Navigate to="/dashboard" replace />} />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute requiredPermissions={[PERMISSIONS.REPORTS_VIEW]}>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/pos" element={
                  <ProtectedRoute requiredPermissions={[PERMISSIONS.POS_VIEW]}>
                    <POS />
                  </ProtectedRoute>
                } />
                
                <Route path="/products" element={
                  <ProtectedRoute requiredPermissions={[PERMISSIONS.PRODUCTS_VIEW]}>
                    <Products />
                  </ProtectedRoute>
                } />
                
                <Route path="/barcodes" element={
                  <ProtectedRoute requiredPermissions={[PERMISSIONS.BARCODES_VIEW]}>
                    <Barcodes />
                  </ProtectedRoute>
                } />
                
                              <Route path="/customers" element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.CUSTOMERS_VIEW]}>
                  <Customers />
                </ProtectedRoute>
              } />
              
              <Route path="/customer-history" element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.CUSTOMERS_VIEW]}>
                  <CustomerHistory />
                </ProtectedRoute>
              } />
                
                              <Route path="/reports" element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.REPORTS_VIEW]}>
                  <Reports />
                </ProtectedRoute>
              } />
              
              <Route path="/refund-history" element={
                <ProtectedRoute requiredPermissions={[PERMISSIONS.REPORTS_VIEW]}>
                  <RefundHistory />
                </ProtectedRoute>
              } />
                
                <Route path="/users" element={
                  <ProtectedRoute requiredPermissions={[PERMISSIONS.USERS_VIEW]}>
                    <Users />
                  </ProtectedRoute>
                } />
                
                <Route path="/settings" element={
                  <ProtectedRoute requiredPermissions={[PERMISSIONS.SETTINGS_VIEW]}>
                    <Settings />
                  </ProtectedRoute>
                } />
                
                <Route path="/storage" element={
                  <ProtectedRoute requiredPermissions={[PERMISSIONS.REPORTS_VIEW]}>
                    <Storage />
                  </ProtectedRoute>
                } />
                
                {/* Catch-all route for unknown paths */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          )}
        </Elements>
        <Toaster />
      </Router>
    </>
  );
}

export default App;