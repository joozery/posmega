import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import POS from '@/pages/POS';
import Products from '@/pages/Products';
import Customers from '@/pages/Customers';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import Barcodes from '@/pages/Barcodes';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

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
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/products" element={<Products />} />
              <Route path="/barcodes" element={<Barcodes />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </Elements>
        <Toaster />
      </Router>
    </>
  );
}

export default App;