
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const CustomerDialog = ({ isOpen, onClose, onSave, customer }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', address: '', loyaltyPoints: 0
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        loyaltyPoints: customer.loyaltyPoints || 0
      });
    } else {
      setFormData({ name: '', phone: '', email: '', address: '', loyaltyPoints: 0 });
    }
  }, [customer, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกชื่อและเบอร์โทรศัพท์",
        variant: "destructive"
      });
      return;
    }
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSimulateReadCard = () => {
    setFormData({
      name: 'คุณสมาร์ท การ์ดเดอร์',
      phone: '098-765-4321',
      email: 'smart.carder@example.com',
      address: '999/9 หมู่ 9 ต.ไฮเทค อ.เมือง จ.ดิจิทัล 99999',
      loyaltyPoints: 0
    });
    toast({ title: "อ่านข้อมูลสำเร็จ", description: "ข้อมูลตัวอย่างถูกกรอกเรียบร้อย" });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg"><User className="w-5 h-5 text-blue-600" /></div>
                <h2 className="text-xl font-semibold text-gray-900">{customer ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Button type="button" variant="outline" className="w-full" onClick={handleSimulateReadCard}>
                จำลองการอ่านบัตรประชาชน
              </Button>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ-นามสกุล *</label>
                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" required value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg" placeholder="ระบุชื่อ-นามสกุล" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์ *</label>
                <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="tel" required value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg" placeholder="ระบุเบอร์โทรศัพท์" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg" placeholder="ระบุอีเมล (ไม่บังคับ)" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ที่อยู่</label>
                <div className="relative"><MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" /><textarea value={formData.address} onChange={(e) => handleChange('address', e.target.value)} rows={3} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg" placeholder="ระบุที่อยู่ (ไม่บังคับ)" /></div>
              </div>
              {customer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">แต้มสะสม</label>
                  <div className="relative"><Star className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" readOnly value={formData.loyaltyPoints} className="w-full pl-10 pr-4 py-3 border bg-gray-100 rounded-lg" /></div>
                </div>
              )}
              <div className="flex space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">ยกเลิก</Button>
                <Button type="submit" className="flex-1">{customer ? 'บันทึกการแก้ไข' : 'เพิ่มลูกค้า'}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CustomerDialog;
