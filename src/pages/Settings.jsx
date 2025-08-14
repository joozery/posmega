import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, CreditCard, ListPlus, Barcode, Star, MessageSquare, Store, Upload, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import BarcodeSettingsTab from '@/components/settings/BarcodeSettingsTab';
import LoyaltySettingsTab from '@/components/settings/LoyaltySettingsTab';
import NotificationSettingsTab from '@/components/settings/NotificationSettingsTab';
import { settingsService } from '@/services/settingsService';

const Settings = () => {
  const { toast } = useToast();
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
    payment: { promptpayId: '', stripePublishableKey: '', stripePriceId: '' },
    categories: ['เสื้อผ้า', 'รองเท้า', 'กระเป๋า', 'เครื่องประดับ'],
    loyalty: { purchaseAmountForOnePoint: 100, onePointValueInBaht: 1 },
    notifications: { lineChannelAccessToken: '', lineUserId: '', notifyOnSale: false }
  });
  const [newCategory, setNewCategory] = useState('');
  
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
        
        // Handle categories - ensure it's always an array
        let categories = ['เสื้อผ้า', 'รองเท้า', 'กระเป๋า', 'เครื่องประดับ']; // Default categories
        if (apiSettings.categories) {
          if (Array.isArray(apiSettings.categories)) {
            categories = apiSettings.categories;
          } else if (typeof apiSettings.categories === 'string') {
            // If it's a string, try to parse it as JSON
            try {
              const parsed = JSON.parse(apiSettings.categories);
              if (Array.isArray(parsed)) {
                categories = parsed;
              }
            } catch (e) {
              console.warn('Failed to parse categories as JSON:', apiSettings.categories);
            }
          }
        }
        
        setSettings(prev => ({
          ...prev,
          system: { ...prev.system, ...apiSettings.system },
          payment: { ...prev.payment, ...apiSettings.payment },
          loyalty: { ...prev.loyalty, ...apiSettings.loyalty },
          notifications: { ...prev.notifications, ...apiSettings.notifications },
          categories: categories
        }));
      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดการตั้งค่าได้ กรุณาลองใหม่อีกครั้ง",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ 
          title: "ไฟล์ใหญ่เกินไป", 
          description: "กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB",
          variant: "destructive"
        });
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
        toast({ title: "อัปโหลดโลโก้สำเร็จ", description: "โลโก้ของคุณถูกบันทึกแล้ว" });
      } catch (error) {
        console.error('Error uploading logo:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถอัปโหลดโลโก้ได้ กรุณาลองใหม่อีกครั้ง",
          variant: "destructive"
        });
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await settingsService.deleteLogo();
      handleSystemChange('logo', '');
      toast({ title: "ลบโลโก้สำเร็จ", description: "โลโก้ถูกลบออกแล้ว" });
    } catch (error) {
      console.error('Error removing logo:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบโลโก้ได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare settings data for API
      const settingsForAPI = {
        ...settings,
        system: {
          ...settings.system,
          // Map logo to logo_url for API compatibility
          logo_url: settings.system.logo,
          // Remove the logo field to avoid confusion
          logo: undefined
        },
        categories: Array.isArray(settings.categories) ? settings.categories : ['เสื้อผ้า', 'รองเท้า', 'กระเป๋า', 'เครื่องประดับ']
      };
      
      await settingsService.updateSettings(settingsForAPI);
      window.dispatchEvent(new Event('settings_updated'));
      toast({ title: "บันทึกการตั้งค่าสำเร็จ", description: "การตั้งค่าของคุณถูกบันทึกแล้ว" });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
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

  const handleAddCategory = () => {
    if (newCategory && !settings.categories.includes(newCategory)) {
      setSettings(prev => ({ ...prev, categories: [...prev.categories, newCategory] }));
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (categoryToRemove) => {
    setSettings(prev => ({ ...prev, categories: prev.categories.filter(c => c !== categoryToRemove) }));
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
            <h3 className="text-xl font-semibold mb-4">ตั้งค่าการชำระเงิน</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PromptPay ID (เบอร์โทรศัพท์/เลขบัตรประชาชน)</label>
                <input type="text" value={settings.payment.promptpayId} onChange={e => handlePaymentChange('promptpayId', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Publishable Key</label>
                <input type="text" value={settings.payment.stripePublishableKey} onChange={e => handlePaymentChange('stripePublishableKey', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Price ID</label>
                <input type="text" value={settings.payment.stripePriceId} onChange={e => handlePaymentChange('stripePriceId', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
          </motion.div>
        </TabsContent>
        <TabsContent value="categories" className="mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-xl font-semibold mb-4">จัดการหมวดหมู่สินค้า</h3>
            <div className="flex gap-2 mb-4">
              <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="เพิ่มหมวดหมู่ใหม่" className="flex-grow px-4 py-2 border rounded-lg" />
              <Button onClick={handleAddCategory}>เพิ่ม</Button>
            </div>
            <div className="space-y-2">
              {Array.isArray(settings.categories) ? settings.categories.map(cat => (
                <div key={cat} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span>{cat}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveCategory(cat)}>ลบ</Button>
                </div>
              )) : (
                <p className="text-gray-500">ไม่มีหมวดหมู่สินค้า</p>
              )}
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