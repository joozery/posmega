import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, CreditCard, ListPlus, Barcode, Star, MessageSquare, Store, Upload, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import BarcodeSettingsTab from '@/components/settings/BarcodeSettingsTab';
import LoyaltySettingsTab from '@/components/settings/LoyaltySettingsTab';
import NotificationSettingsTab from '@/components/settings/NotificationSettingsTab';
import { settingsService } from '@/services/settingsService';
import { categoriesService } from '@/services/categoriesService';
import { showSuccess, showError, showLoading, closeLoading } from '@/utils/sweetalert';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [settings, setSettings] = useState({
    system: { 
      storeName: 'Universal POS', 
      taxRate: 7,
      logo: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      taxId: ''
    },
    payment: { 
      promptpayId: '', 
      promptpayEnabled: false,
      stripePublishableKey: '', 
      stripePriceId: '',
      stripeEnabled: false,
      cashEnabled: true,
      defaultPaymentMethod: 'cash',
      allowMultiplePaymentMethods: false
    },
    categories: ['เสื้อผ้า', 'รองเท้า', 'กระเป๋า', 'เครื่องประดับ'],
    loyalty: { purchaseAmountForOnePoint: 100, onePointValueInBaht: 1 },
    notifications: { lineChannelAccessToken: '', lineUserId: '', notifyOnSale: false }
  });
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  // Load settings from API on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const response = await settingsService.getAllSettings();
        
        // Merge API data with defaults
        const apiSettings = response.settings || {};
        
        // Map logo_url to logo field for frontend compatibility
        if (apiSettings.system && apiSettings.system.logo_url) {
          apiSettings.system.logo = apiSettings.system.logo_url;
        }
        
        // Also check for logo field directly
        if (apiSettings.system && apiSettings.system.logo && !apiSettings.system.logo_url) {
          apiSettings.system.logo_url = apiSettings.system.logo;
        }
        
        // Load categories from categories API
        try {
          setCategoriesLoading(true);
          const categoriesResponse = await categoriesService.getAllCategories(true); // active only
          const categoriesData = categoriesResponse.categories || [];
          setCategories(categoriesData);
          
          // Also set in settings for backward compatibility
          setSettings(prev => ({
            ...prev,
            system: { ...prev.system, ...apiSettings.system },
            payment: { ...prev.payment, ...apiSettings.payment },
            loyalty: { ...prev.loyalty, ...apiSettings.loyalty },
            notifications: { ...prev.notifications, ...apiSettings.notifications },
            categories: categoriesData.map(cat => cat.name)
          }));
        } catch (error) {
          console.warn('Failed to load categories from API, using defaults:', error);
          const fallbackCategories = ['เสื้อผ้า', 'รองเท้า', 'กระเป๋า', 'เครื่องประดับ'];
          setCategories(fallbackCategories.map(name => ({ id: null, name, description: '', color: '#3B82F6', icon: 'folder' })));
          
          setSettings(prev => ({
            ...prev,
            system: { ...prev.system, ...apiSettings.system },
            payment: { ...prev.payment, ...apiSettings.payment },
            loyalty: { ...prev.loyalty, ...apiSettings.loyalty },
            notifications: { ...prev.notifications, ...apiSettings.notifications },
            categories: fallbackCategories
          }));
        } finally {
          setCategoriesLoading(false);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        showError(
          "เกิดข้อผิดพลาด",
          "ไม่สามารถโหลดการตั้งค่าได้ กรุณาลองใหม่อีกครั้ง"
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showError(
          "ไฟล์ใหญ่เกินไป",
          "กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB"
        );
        return;
      }
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        handleSystemChange('logo', e.target.result);
      };
      reader.readAsDataURL(file);
      
      try {
        setUploadingLogo(true);
        const result = await settingsService.uploadLogo(file);
        handleSystemChange('logo', result.logo_url);
        showSuccess("อัปโหลดโลโก้สำเร็จ", "โลโก้ของคุณถูกบันทึกแล้ว");
      } catch (error) {
        console.error('Error uploading logo:', error);
        showError(
          "เกิดข้อผิดพลาด",
          "ไม่สามารถอัปโหลดโลโก้ได้ กรุณาลองใหม่อีกครั้ง"
        );
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await settingsService.deleteLogo();
      handleSystemChange('logo', '');
      showSuccess("ลบโลโก้สำเร็จ", "โลโก้ถูกลบออกแล้ว");
    } catch (error) {
      console.error('Error removing logo:', error);
      showError(
        "เกิดข้อผิดพลาด",
        "ไม่สามารถลบโลโก้ได้ กรุณาลองใหม่อีกครั้ง"
      );
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      showLoading("กำลังบันทึกการตั้งค่า...", "กรุณารอสักครู่ (อาจใช้เวลานานเนื่องจาก Heroku)");
      
      // Prepare settings data for API
      const settingsForAPI = {
        system: {
          ...settings.system,
          // Map logo to logo_url for API compatibility
          logo_url: settings.system?.logo || '',
          // Remove the logo field to avoid confusion
          logo: undefined
        },
        payment: {
          ...settings.payment,
          // Ensure all payment settings are strings
          promptpayEnabled: String(settings.payment?.promptpayEnabled || false),
          stripeEnabled: String(settings.payment?.stripeEnabled || false),
          cashEnabled: String(settings.payment?.cashEnabled || true),
          allowMultiplePaymentMethods: String(settings.payment?.allowMultiplePaymentMethods || false)
        },
        loyalty: {
          ...settings.loyalty
        },
        notifications: {
          ...settings.notifications,
          // Ensure notifyOnSale is string
          notifyOnSale: String(settings.notifications?.notifyOnSale || false)
        }
        // Categories are now managed separately via categories API
        // No need to include categories in settings payload
      };
      
      console.log('🔧 Settings data being sent to API:', JSON.stringify(settingsForAPI, null, 2));
      
      // Add timeout warning
      const timeoutWarning = setTimeout(() => {
        showLoading('กำลังบันทึกการตั้งค่า...', 'ใช้เวลานานกว่าปกติ กรุณารอสักครู่ (Heroku อาจกำลัง startup)');
      }, 10000); // Show warning after 10 seconds
      
      await settingsService.updateSettings(settingsForAPI);
      
      clearTimeout(timeoutWarning);
      window.dispatchEvent(new Event('settings_updated'));
      
      closeLoading();
      showSuccess(
        "บันทึกการตั้งค่าสำเร็จ",
        "การตั้งค่าของคุณถูกบันทึกแล้ว"
      );
    } catch (error) {
      console.error('Error saving settings:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      closeLoading();
      
      // Show more specific error message for timeout
      let errorMessage = "ไม่สามารถบันทึกการตั้งค่าได้ กรุณาลองใหม่อีกครั้ง";
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง (Heroku อาจกำลัง startup)';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError(
        "เกิดข้อผิดพลาด",
        errorMessage
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSystemChange = (field, value) => {
    setSettings(prev => ({ ...prev, system: { ...prev.system, [field]: value } }));
  };

  const handlePaymentChange = (field, value) => {
    setSettings(prev => ({ ...prev, payment: { ...prev.payment, [field]: value } }));
  };

  const handleLoyaltyChange = (field, value) => {
    setSettings(prev => ({ ...prev, loyalty: { ...prev.loyalty, [field]: parseFloat(value) || 0 } }));
  };

  const handleNotificationChange = (field, value) => {
    setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, [field]: value } }));
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      setCategoriesLoading(true);
      
      // Create new category via API
      const categoryData = {
        name: newCategory.trim(),
        description: `หมวดหมู่ ${newCategory.trim()}`,
        color: '#3B82F6',
        icon: 'folder',
        sort_order: categories.length + 1
      };
      
      const result = await categoriesService.createCategory(categoryData);
      
      // Add to local state
      setCategories(prev => [...prev, result.category]);
      setSettings(prev => ({ 
        ...prev, 
        categories: [...prev.categories, result.category.name] 
      }));
      
      setNewCategory('');
      showSuccess('เพิ่มหมวดหมู่สำเร็จ', 'หมวดหมู่ใหม่ถูกเพิ่มแล้ว');
    } catch (error) {
      console.error('Error adding category:', error);
      const errorMessage = error.response?.data?.error || 'ไม่สามารถเพิ่มหมวดหมู่ได้';
      showError('เกิดข้อผิดพลาด', errorMessage);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleRemoveCategory = async (categoryToRemove) => {
    try {
      // Find category object
      const categoryObj = categories.find(cat => cat.name === categoryToRemove);
      
      if (categoryObj && categoryObj.id) {
        // Delete via API if it has an ID
        await categoriesService.deleteCategory(categoryObj.id, true); // force delete
        showSuccess('ลบหมวดหมู่สำเร็จ', 'หมวดหมู่ถูกลบแล้ว');
      }
      
      // Remove from local state
      setCategories(prev => prev.filter(cat => cat.name !== categoryToRemove));
      setSettings(prev => ({ 
        ...prev, 
        categories: prev.categories.filter(c => c !== categoryToRemove) 
      }));
    } catch (error) {
      console.error('Error removing category:', error);
      const errorMessage = error.response?.data?.error || 'ไม่สามารถลบหมวดหมู่ได้';
      showError('เกิดข้อผิดพลาด', errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดการตั้งค่า...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ตั้งค่า</h1>
          <p className="text-gray-600 mt-1">จัดการการตั้งค่าต่างๆ ของระบบ POS</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</Button>
      </div>

      <Tabs defaultValue="store" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-7">
          <TabsTrigger value="store"><Store className="w-4 h-4 mr-2" />ร้านค้า</TabsTrigger>
          <TabsTrigger value="system"><SettingsIcon className="w-4 h-4 mr-2" />ระบบ</TabsTrigger>
          <TabsTrigger value="payment"><CreditCard className="w-4 h-4 mr-2" />การชำระเงิน</TabsTrigger>
          <TabsTrigger value="categories"><ListPlus className="w-4 h-4 mr-2" />หมวดหมู่</TabsTrigger>
          <TabsTrigger value="barcode"><Barcode className="w-4 h-4 mr-2" />บาร์โค้ด</TabsTrigger>
          <TabsTrigger value="loyalty"><Star className="w-4 h-4 mr-2" />สมาชิก</TabsTrigger>
          <TabsTrigger value="notifications"><MessageSquare className="w-4 h-4 mr-2" />แจ้งเตือน</TabsTrigger>
        </TabsList>
        
        <TabsContent value="store" className="mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-xl font-semibold mb-6">ข้อมูลร้านค้า</h3>
            
            {/* Logo Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">โลโก้ร้านค้า</label>
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  {settings.system.logo ? (
                    <div className="relative">
                      <img 
                        src={settings.system.logo} 
                        alt="Store Logo" 
                        className="w-32 h-32 object-contain border-2 border-gray-200 rounded-lg bg-gray-50 shadow-sm"
                      />
                      <button
                        onClick={handleRemoveLogo}
                        disabled={uploadingLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {uploadingLogo && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      {uploadingLogo ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      ) : (
                        <Upload className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="mb-2">
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto"
                      onClick={() => document.getElementById('logo-upload').click()}
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          กำลังอัปโหลด...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          {settings.system.logo ? 'เปลี่ยนโลโก้' : 'อัปโหลดโลโก้'}
                        </>
                      )}
                    </Button>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={uploadingLogo}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    รองรับไฟล์: JPG, PNG, GIF (ขนาดไม่เกิน 5MB)<br/>
                    ขนาดที่แนะนำ: 200x200 พิกเซล<br/>
                    {uploadingLogo && <span className="text-blue-600">กำลังอัปโหลด... กรุณารอสักครู่</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Store Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อร้านค้า *</label>
                <input 
                  type="text" 
                  value={settings.system.storeName} 
                  onChange={e => handleSystemChange('storeName', e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="ชื่อร้านค้าของคุณ"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เลขประจำตัวผู้เสียภาษี</label>
                <input 
                  type="text" 
                  value={settings.system.taxId} 
                  onChange={e => handleSystemChange('taxId', e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="0-0000-00000-00-0"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่ร้านค้า</label>
                <textarea 
                  value={settings.system.address} 
                  onChange={e => handleSystemChange('address', e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  rows="3"
                  placeholder="ที่อยู่ของร้านค้า"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                <input 
                  type="tel" 
                  value={settings.system.phone} 
                  onChange={e => handleSystemChange('phone', e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="0xx-xxx-xxxx"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                <input 
                  type="email" 
                  value={settings.system.email} 
                  onChange={e => handleSystemChange('email', e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="contact@yourstore.com"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">เว็บไซต์</label>
                <input 
                  type="url" 
                  value={settings.system.website} 
                  onChange={e => handleSystemChange('website', e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="https://www.yourstore.com"
                />
              </div>
            </div>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="system" className="mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-xl font-semibold mb-4">ตั้งค่าระบบ</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อัตราภาษี (%)</label>
                <input 
                  type="number" 
                  value={settings.system.taxRate} 
                  onChange={e => handleSystemChange('taxRate', e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="7"
                />
                <p className="text-xs text-gray-500 mt-1">อัตราภาษีมูลค่าเพิ่ม (VAT) ที่จะคิดในใบเสร็จและใบกำกับภาษี</p>
              </div>
            </div>
          </motion.div>
        </TabsContent>
        <TabsContent value="payment" className="mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-xl font-semibold mb-6">ตั้งค่าการชำระเงิน</h3>
            
            {/* Cash Payment */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-medium mb-3 text-gray-800">💰 เงินสด</h4>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="cashEnabled" 
                  checked={settings.payment.cashEnabled} 
                  onChange={e => handlePaymentChange('cashEnabled', e.target.checked)} 
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="cashEnabled" className="ml-2 text-sm font-medium text-gray-700">เปิดใช้งานการชำระด้วยเงินสด</label>
              </div>
            </div>

            {/* PromptPay Payment */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-lg font-medium mb-3 text-blue-800">📱 PromptPay</h4>
              <div className="space-y-3">
                <div className="flex items-center mb-3">
                  <input 
                    type="checkbox" 
                    id="promptpayEnabled" 
                    checked={settings.payment.promptpayEnabled} 
                    onChange={e => handlePaymentChange('promptpayEnabled', e.target.checked)} 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="promptpayEnabled" className="ml-2 text-sm font-medium text-gray-700">เปิดใช้งาน PromptPay</label>
                </div>
                
                {settings.payment.promptpayEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PromptPay ID (เบอร์โทรศัพท์/เลขบัตรประชาชน)</label>
                    <input 
                      type="text" 
                      value={settings.payment.promptpayId} 
                      onChange={e => handlePaymentChange('promptpayId', e.target.value)} 
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0812345678 หรือ 1234567890123"
                    />
                    <p className="text-xs text-gray-500 mt-1">หมายเลขโทรศัพท์หรือเลขบัตรประชาชนที่ลงทะเบียน PromptPay</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stripe Payment */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
              <h4 className="text-lg font-medium mb-3 text-purple-800">💳 Stripe</h4>
              <div className="space-y-3">
                <div className="flex items-center mb-3">
                  <input 
                    type="checkbox" 
                    id="stripeEnabled" 
                    checked={settings.payment.stripeEnabled} 
                    onChange={e => handlePaymentChange('stripeEnabled', e.target.checked)} 
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="stripeEnabled" className="ml-2 text-sm font-medium text-gray-700">เปิดใช้งาน Stripe</label>
                </div>
                
                {settings.payment.stripeEnabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Publishable Key</label>
                      <input 
                        type="text" 
                        value={settings.payment.stripePublishableKey} 
                        onChange={e => handlePaymentChange('stripePublishableKey', e.target.value)} 
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="pk_test_..."
                      />
                      <p className="text-xs text-gray-500 mt-1">Publishable key จาก Stripe Dashboard</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Price ID</label>
                      <input 
                        type="text" 
                        value={settings.payment.stripePriceId} 
                        onChange={e => handlePaymentChange('stripePriceId', e.target.value)} 
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="price_..."
                      />
                      <p className="text-xs text-gray-500 mt-1">Price ID สำหรับสินค้าหรือบริการ</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Additional Settings */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h4 className="text-lg font-medium mb-3 text-green-800">⚙️ การตั้งค่าเพิ่มเติม</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วิธีการชำระเงินเริ่มต้น</label>
                  <select 
                    value={settings.payment.defaultPaymentMethod} 
                    onChange={e => handlePaymentChange('defaultPaymentMethod', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="cash">เงินสด</option>
                    <option value="promptpay">PromptPay</option>
                    <option value="card">บัตรเครดิต/เดบิต</option>
                    <option value="transfer">โอนเงิน</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="allowMultiplePaymentMethods" 
                    checked={settings.payment.allowMultiplePaymentMethods} 
                    onChange={e => handlePaymentChange('allowMultiplePaymentMethods', e.target.checked)} 
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="allowMultiplePaymentMethods" className="ml-2 text-sm font-medium text-gray-700">อนุญาตให้ชำระเงินหลายวิธี</label>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>
        <TabsContent value="categories" className="mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-xl font-semibold mb-4">จัดการหมวดหมู่สินค้า</h3>
            
            {/* Add Category Form */}
            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                value={newCategory} 
                onChange={e => setNewCategory(e.target.value)} 
                placeholder="เพิ่มหมวดหมู่ใหม่" 
                className="flex-grow px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <Button 
                onClick={handleAddCategory} 
                disabled={categoriesLoading || !newCategory.trim()}
                className="px-6"
              >
                {categoriesLoading ? 'กำลังเพิ่ม...' : 'เพิ่ม'}
              </Button>
            </div>
            
            {/* Categories List */}
            {categoriesLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.length > 0 ? categories.map(category => (
                  <div key={category.id || category.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: category.color || '#3B82F6' }}
                      >
                        <span className="text-white text-xs">📁</span>
                      </div>
                      <div>
                        <span className="font-medium">{category.name}</span>
                        {category.description && (
                          <p className="text-sm text-gray-500">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        สินค้า: {category.product_count || 0}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveCategory(category.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        ลบ
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>ไม่มีหมวดหมู่สินค้า</p>
                    <p className="text-sm">เริ่มต้นด้วยการเพิ่มหมวดหมู่แรก</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>หมายเหตุ:</strong> หมวดหมู่ที่สร้างจะถูกใช้ในระบบสินค้าและรายงาน
              </p>
            </div>
          </motion.div>
        </TabsContent>
        <TabsContent value="barcode" className="mt-6">
            <BarcodeSettingsTab />
        </TabsContent>
        <TabsContent value="loyalty" className="mt-6">
            <LoyaltySettingsTab settings={settings.loyalty} onChange={handleLoyaltyChange} />
        </TabsContent>
        <TabsContent value="notifications" className="mt-6">
            <NotificationSettingsTab settings={settings.notifications} onChange={handleNotificationChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;