import { toast } from '@/components/ui/use-toast';

const sendLineMessage = async (messageText) => {
  const settings = JSON.parse(localStorage.getItem('pos_settings') || '{}');
  const channelAccessToken = settings?.notifications?.lineChannelAccessToken;
  const userId = settings?.notifications?.lineUserId;

  if (!channelAccessToken || !userId) {
    console.error("LINE Messaging API settings are not configured.");
    return;
  }

  const message = {
    to: userId,
    messages: [
      {
        type: 'text',
        text: messageText,
      },
    ],
  };

  toast({
    title: "🚧 การแจ้งเตือน LINE Messaging API",
    description: "ฟังก์ชันนี้ต้องการเซิร์ฟเวอร์ตัวกลาง (Proxy) เพื่อส่งข้อความอย่างปลอดภัยและหลีกเลี่ยงปัญหา CORS ในเบราว์เซอร์โดยตรง",
    variant: "default",
  });

  console.log("Attempting to send LINE push message (requires backend proxy):", JSON.stringify(message));
  
};

export default sendLineMessage;