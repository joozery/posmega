import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, QrCode, Loader2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useStripe } from '@stripe/react-stripe-js';
import { toDataURL } from 'qrcode';
import promptpayPayload from 'promptpay-qr';

const PaymentDialog = ({ isOpen, onClose, onConfirm, total, cart, customer, discount }) => {
  const { toast } = useToast();
  const stripe = useStripe();
  const [view, setView] = useState('options'); // 'options', 'promptpay', 'stripe_loading'
  const [promptPayQR, setPromptPayQR] = useState('');
  const [settings, setSettings] = useState({});

  useEffect(() => {
    if (isOpen) {
      const savedSettings = JSON.parse(localStorage.getItem('pos_settings') || '{}');
      setSettings(savedSettings);
      setView('options');
      setPromptPayQR('');
    }
  }, [isOpen]);

  const handleGeneratePromptPayQR = useCallback(async () => {
    const promptpayId = settings?.payment?.promptpayId;
    if (!promptpayId) {
      toast({ title: 'ไม่ได้ตั้งค่า PromptPay', description: 'กรุณาตั้งค่าเบอร์ PromptPay ในหน้าตั้งค่าก่อน', variant: 'destructive' });
      return;
    }
    const payload = promptpayPayload(promptpayId, { amount: total });
    try {
      const qrDataUrl = await toDataURL(payload);
      setPromptPayQR(qrDataUrl);
      setView('promptpay');
    } catch (err) {
      console.error(err);
      toast({ title: 'สร้าง QR Code ไม่สำเร็จ', description: 'เกิดข้อผิดพลาดในการสร้าง PromptPay QR Code', variant: 'destructive' });
    }
  }, [settings, total, toast]);

  const handleStripeCheckout = useCallback(async () => {
    if (!stripe) {
      toast({ title: "Stripe ยังไม่พร้อม", description: "กรุณาตั้งค่า Stripe key ในหน้าตั้งค่าก่อน", variant: "destructive" });
      return;
    }
    const priceId = settings?.payment?.stripePriceId;
    if (!priceId) {
      toast({ title: "Stripe Price ID หายไป", description: "กรุณาตั้งค่า Price ID ในหน้าตั้งค่าก่อน", variant: "destructive" });
      return;
    }

    setView('stripe_loading');

    localStorage.setItem('pending_checkout_cart', JSON.stringify(cart));
    localStorage.setItem('pending_checkout_customer', JSON.stringify(customer));
    localStorage.setItem('pending_checkout_discount', JSON.stringify(discount || 0));


    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: Math.round(total) }], // Stripe expects integer cents
      mode: 'payment',
      successUrl: `${window.location.origin}/pos?stripe_session=success`,
      cancelUrl: `${window.location.origin}/pos?stripe_session=cancel`,
    });

    if (error) {
      console.error("Stripe Error:", error);
      toast({ title: "เกิดข้อผิดพลาดกับ Stripe", description: error.message, variant: "destructive" });
      localStorage.removeItem('pending_checkout_cart');
      localStorage.removeItem('pending_checkout_customer');
      localStorage.removeItem('pending_checkout_discount');
      setView('options');
    }
  }, [stripe, settings, cart, customer, total, discount, toast]);

  const handleCashPayment = () => {
    onConfirm('เงินสด');
    toast({ title: "รับชำระด้วยเงินสด", description: "บันทึกการขายเรียบร้อยแล้ว" });
  };
  
  const handlePromptPayConfirmation = () => {
    onConfirm('PromptPay QR');
    toast({ title: "ยืนยันการชำระเงินสำเร็จ", description: `บันทึกการขายผ่าน PromptPay QR เรียบร้อยแล้ว` });
  };

  const renderContent = () => {
    switch (view) {
      case 'promptpay':
        return (
          <div className="text-center p-6 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4">สแกนเพื่อชำระเงิน</h3>
            {promptPayQR ? <img src={promptPayQR} alt="PromptPay QR Code" className="w-56 h-56 mx-auto rounded-lg border p-2" /> : <Loader2 className="w-16 h-16 animate-spin text-blue-500" />}
            <p className="font-bold text-2xl text-blue-600 mt-4">ยอดชำระ: ฿{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-sm text-gray-500 mt-2">โปรดตรวจสอบว่าได้รับยอดเงินแล้วก่อนกดยืนยัน</p>
            <div className="w-full space-y-2 mt-6">
                <Button onClick={handlePromptPayConfirmation} className="w-full" size="lg">ยืนยันการชำระเงิน</Button>
                <Button variant="outline" onClick={() => setView('options')} className="w-full">กลับ</Button>
            </div>
          </div>
        );
       case 'stripe_loading':
        return (
            <div className="text-center p-12 flex flex-col items-center justify-center">
                <Loader2 className="w-16 h-16 animate-spin text-blue-500" />
                <p className="mt-4 text-lg font-medium text-gray-700">กำลังนำคุณไปยังหน้าชำระเงิน...</p>
            </div>
        );
      case 'options':
      default:
        return (
          <div className="p-6 space-y-4">
             <Button size="lg" variant="outline" className="w-full flex justify-start items-center p-6" onClick={handleCashPayment}>
              <DollarSign className="w-6 h-6 mr-4" />
               <div>
                <p className="font-semibold text-left">เงินสด</p>
                <p className="font-normal text-sm text-left">รับชำระด้วยเงินสด</p>
              </div>
            </Button>
            <Button size="lg" className="w-full flex justify-start items-center p-6" onClick={handleStripeCheckout} disabled={!stripe}>
              <CreditCard className="w-6 h-6 mr-4" />
              <div>
                <p className="font-semibold text-left">บัตรเครดิต (Stripe)</p>
                <p className="font-normal text-sm text-left">รับชำระผ่านบัตรเครดิตและเดบิต</p>
              </div>
            </Button>
            <Button size="lg" variant="outline" className="w-full flex justify-start items-center p-6" onClick={handleGeneratePromptPayQR}>
              <QrCode className="w-6 h-6 mr-4" />
               <div>
                <p className="font-semibold text-left">พร้อมเพย์ QR Code</p>
                <p className="font-normal text-sm text-left">สร้าง QR Code สำหรับให้ลูกค้าสแกนจ่าย</p>
              </div>
            </Button>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-60"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                เลือกช่องทางชำระเงิน
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            {renderContent()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentDialog;