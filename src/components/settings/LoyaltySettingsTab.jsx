
import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LoyaltySettingsTab = ({ settings, onChange }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 shadow-sm border">
      <h3 className="text-xl font-semibold mb-4">ตั้งค่าระบบสมาชิกและแต้มสะสม</h3>
      <div className="space-y-6">
        <div>
          <Label htmlFor="purchaseAmountForOnePoint">ยอดซื้อ (บาท) เพื่อรับ 1 แต้ม</Label>
          <Input
            id="purchaseAmountForOnePoint"
            type="number"
            value={settings.purchaseAmountForOnePoint || ''}
            onChange={(e) => onChange('purchaseAmountForOnePoint', e.target.value)}
            placeholder="เช่น 100"
            className="mt-2"
          />
          <p className="text-sm text-gray-500 mt-1">ลูกค้าจะได้รับ 1 แต้มทุกๆ ยอดซื้อตามจำนวนที่กำหนด</p>
        </div>
        <div>
          <Label htmlFor="onePointValueInBaht">มูลค่า 1 แต้ม (บาท) สำหรับใช้เป็นส่วนลด</Label>
          <Input
            id="onePointValueInBaht"
            type="number"
            value={settings.onePointValueInBaht || ''}
            onChange={(e) => onChange('onePointValueInBaht', e.target.value)}
            placeholder="เช่น 1"
            className="mt-2"
          />
          <p className="text-sm text-gray-500 mt-1">มูลค่าของแต้มเมื่อลูกค้าต้องการใช้เป็นส่วนลด</p>
        </div>
      </div>
    </motion.div>
  );
};

export default LoyaltySettingsTab;
