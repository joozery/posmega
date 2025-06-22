import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import sendLineMessage from '@/utils/lineNotify';
import { useToast } from '@/components/ui/use-toast';

const NotificationSettingsTab = ({ settings, onChange }) => {
  const { toast } = useToast();

  const handleTestNotification = () => {
    if (!settings.lineChannelAccessToken || !settings.lineUserId) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอก Channel Access Token และ User ID ของคุณก่อน",
        variant: "destructive",
      });
      return;
    }
    sendLineMessage("ทดสอบการแจ้งเตือนจากระบบ Universal POS");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 shadow-sm border">
      <h3 className="text-xl font-semibold mb-4">ตั้งค่าการแจ้งเตือนผ่าน LINE Messaging API</h3>
      <div className="space-y-6">
        <div>
          <Label htmlFor="lineChannelAccessToken">LINE Channel Access Token</Label>
          <Input
            id="lineChannelAccessToken"
            type="password"
            value={settings.lineChannelAccessToken || ''}
            onChange={(e) => onChange('lineChannelAccessToken', e.target.value)}
            placeholder="วาง Channel Access Token ของคุณที่นี่"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="lineUserId">LINE User ID (ผู้รับ)</Label>
          <Input
            id="lineUserId"
            type="text"
            value={settings.lineUserId || ''}
            onChange={(e) => onChange('lineUserId', e.target.value)}
            placeholder="วาง User ID ที่จะรับการแจ้งเตือน"
            className="mt-2"
          />
           <p className="text-sm text-gray-500 mt-1">
            คุณสามารถรับข้อมูลนี้ได้จาก <a href="https://developers.line.biz/console/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LINE Developers Console</a>
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="notifyOnSale" className="flex-grow">เปิดใช้งานการแจ้งเตือนเมื่อขายสำเร็จ</Label>
          <Switch
            id="notifyOnSale"
            checked={settings.notifyOnSale || false}
            onCheckedChange={(checked) => onChange('notifyOnSale', checked)}
          />
        </div>
        <Button variant="outline" onClick={handleTestNotification}>
          ทดสอบการแจ้งเตือน
        </Button>
      </div>
    </motion.div>
  );
};

export default NotificationSettingsTab;