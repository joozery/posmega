import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, CreditCard, ListPlus, Barcode, Star, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import BarcodeSettingsTab from '@/components/settings/BarcodeSettingsTab';
import LoyaltySettingsTab from '@/components/settings/LoyaltySettingsTab';
import NotificationSettingsTab from '@/components/settings/NotificationSettingsTab';

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('pos_settings');
    const defaults = {
      system: { storeName: 'Universal POS', taxRate: 7 },
      payment: { promptpayId: '', stripePublishableKey: '', stripePriceId: '' },
      categories: ['เสื้อผ้า', 'รองเท้า', 'กระเป๋า', 'เครื่องประดับ'],
      loyalty: { purchaseAmountForOnePoint: 100, onePointValueInBaht: 1 },
      notifications: { lineChannelAccessToken: '', lineUserId: '', notifyOnSale: false }
    };
    if (saved) {
        const parsed = JSON.parse(saved);
        return { 
            ...defaults, 
            ...parsed, 
            loyalty: { ...defaults.loyalty, ...parsed.loyalty },
            notifications: { ...defaults.notifications, ...parsed.notifications }
        };
    }
    return defaults;
  });
  const [newCategory, setNewCategory] = useState('');

  const handleSave = () => {
    localStorage.setItem('pos_settings', JSON.stringify(settings));
    window.dispatchEvent(new Event('settings_updated'));
    toast({ title: "บันทึกการตั้งค่าสำเร็จ", description: "การตั้งค่าของคุณถูกบันทึกแล้ว" });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ตั้งค่า</h1>
          <p className="text-gray-600 mt-1">จัดการการตั้งค่าต่างๆ ของระบบ POS</p>
        </div>
        <Button onClick={handleSave}>บันทึกการเปลี่ยนแปลง</Button>
      </div>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
          <TabsTrigger value="system"><SettingsIcon className="w-4 h-4 mr-2" />ระบบ</TabsTrigger>
          <TabsTrigger value="payment"><CreditCard className="w-4 h-4 mr-2" />การชำระเงิน</TabsTrigger>
          <TabsTrigger value="categories"><ListPlus className="w-4 h-4 mr-2" />หมวดหมู่</TabsTrigger>
          <TabsTrigger value="barcode"><Barcode className="w-4 h-4 mr-2" />บาร์โค้ด</TabsTrigger>
          <TabsTrigger value="loyalty"><Star className="w-4 h-4 mr-2" />สมาชิก</TabsTrigger>
          <TabsTrigger value="notifications"><MessageSquare className="w-4 h-4 mr-2" />แจ้งเตือน</TabsTrigger>
        </TabsList>
        <TabsContent value="system" className="mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-xl font-semibold mb-4">ตั้งค่าทั่วไป</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อร้านค้า</label>
                <input type="text" value={settings.system.storeName} onChange={e => handleSystemChange('storeName', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อัตราภาษี (%)</label>
                <input type="number" value={settings.system.taxRate} onChange={e => handleSystemChange('taxRate', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
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
              {settings.categories.map(cat => (
                <div key={cat} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span>{cat}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveCategory(cat)}>ลบ</Button>
                </div>
              ))}
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