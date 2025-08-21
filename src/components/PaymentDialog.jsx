import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, QrCode, Loader2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useStripe } from '@stripe/react-stripe-js';
import { toDataURL } from 'qrcode';
import promptpayPayload from 'promptpay-qr';
import { settingsService } from '@/services/settingsService';

const PaymentDialog = ({ isOpen, onClose, onConfirm, total, cart, customer, discount }) => {
  const { toast } = useToast();
  const stripe = useStripe();
  const [view, setView] = useState('options'); // 'options', 'promptpay', 'stripe_loading'
  const [promptPayQR, setPromptPayQR] = useState('');
  const [settings, setSettings] = useState({
    payment: {
      cashEnabled: 'true',
      stripeEnabled: 'false',
      promptpayEnabled: 'false',
      defaultPaymentMethod: 'cash',
      promptpayId: '',
      stripePriceId: ''
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // ตรวจสอบ localStorage ก่อน
      const savedSettings = localStorage.getItem('pos_settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed.payment) {
            console.log('📱 PaymentDialog - Found settings in localStorage:', parsed);
            setSettings(parsed);
          }
        } catch (e) {
          console.error('❌ PaymentDialog - Error parsing localStorage settings:', e);
        }
      }
      
      // โหลดจาก API
      loadSettings();
      setView('options');
      setPromptPayQR('');
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      console.log('🔄 PaymentDialog - Loading payment settings from API...');
      
      const response = await settingsService.getAllSettings();
      console.log('📥 PaymentDialog - API response:', response);
      
      if (!response) {
        throw new Error('No response from settings API');
      }
      
      const apiSettings = response.settings || {};
      console.log('🔧 PaymentDialog - Settings from API:', apiSettings);
      console.log('💳 PaymentDialog - Payment settings:', apiSettings.payment);
      
      // ตรวจสอบว่ามีข้อมูล payment หรือไม่
      if (apiSettings.payment && Object.keys(apiSettings.payment).length > 0) {
        console.log('✅ PaymentDialog - Using API settings');
        setSettings(apiSettings);
      } else {
        console.log('⚠️ PaymentDialog - No payment settings from API, using fallback');
        const savedSettings = JSON.parse(localStorage.getItem('pos_settings') || '{}');
        console.log('📱 PaymentDialog - Fallback settings:', savedSettings);
        
        // ถ้า localStorage ไม่มีข้อมูล payment ให้ใช้ default
        if (!savedSettings.payment) {
          savedSettings.payment = {
            cashEnabled: 'true',
            stripeEnabled: 'false',
            promptpayEnabled: 'false',
            defaultPaymentMethod: 'cash',
            promptpayId: '',
            stripePriceId: ''
          };
        }
        
        setSettings(savedSettings);
      }
      
    } catch (error) {
      console.error('❌ PaymentDialog - Error loading payment settings:', error);
      // Fallback to localStorage if API fails
      const savedSettings = JSON.parse(localStorage.getItem('pos_settings') || '{}');
      console.log('📱 PaymentDialog - Using fallback settings due to error:', savedSettings);
      setSettings(savedSettings);
    } finally {
      setLoading(false);
      console.log('✅ PaymentDialog - Settings loading completed');
    }
  };

  const handleGeneratePromptPayQR = useCallback(async () => {
    const promptpayId = settings?.payment?.promptpayId;
    if (!promptpayId || promptpayId.trim() === '') {
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
    if (!priceId || priceId.trim() === '') {
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
    } else {
      // If no error, the user will be redirected to Stripe
      // The actual payment confirmation will be handled in POS.jsx when they return
      handleStripePayment();
    }
  }, [stripe, settings, cart, customer, total, discount, toast]);

  const handleCashPayment = () => {
    onConfirm('cash');
    toast({ title: "รับชำระด้วยเงินสด", description: "บันทึกการขายเรียบร้อยแล้ว" });
  };
  
  const handlePromptPayConfirmation = () => {
    onConfirm('promptpay');
    toast({ title: "ยืนยันการชำระเงินสำเร็จ", description: `บันทึกการขายผ่าน PromptPay QR เรียบร้อยแล้ว` });
  };

  const handleStripePayment = () => {
    onConfirm('card');
    toast({ title: "ยืนยันการชำระเงินสำเร็จ", description: `บันทึกการขายผ่านบัตรเครดิตเรียบร้อยแล้ว` });
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
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">กำลังโหลดช่องทางชำระเงิน...</p>
              </div>
            ) : !settings || !settings.payment ? (
              <div className="text-center py-8 text-red-600">
                <p className="font-medium">⚠️ ไม่สามารถโหลดการตั้งค่าการชำระเงินได้</p>
                <p className="text-sm mt-1">กรุณาลองใหม่อีกครั้ง</p>
                <Button 
                  variant="outline" 
                  className="mt-3" 
                  onClick={loadSettings}
                >
                  ลองใหม่
                </Button>
              </div>
            ) : (
              <>
                {/* เงินสด */}
                {(settings.payment?.cashEnabled === 'true' || settings.payment?.cashEnabled === '1') && (
                  <Button 
                    size="lg" 
                    variant={(settings.payment?.defaultPaymentMethod === 'cash' || settings.payment?.defaultPaymentMethod === '1') ? "default" : "outline"} 
                    className="w-full flex justify-start items-center p-6" 
                    onClick={handleCashPayment}
                  >
                    <DollarSign className="w-6 h-6 mr-4" />
                    <div>
                      <p className="font-semibold text-left">เงินสด</p>
                      <p className="font-normal text-sm text-left">รับชำระด้วยเงินสด</p>
                    </div>
                  </Button>
                )}

                {/* บัตรเครดิต (Stripe) */}
                {(settings.payment?.stripeEnabled === 'true' || settings.payment?.stripeEnabled === '1') && (
                  <Button 
                    size="lg" 
                    variant={(settings.payment?.defaultPaymentMethod === 'stripe' || settings.payment?.defaultPaymentMethod === '2') ? "default" : "outline"} 
                    className="w-full flex justify-start items-center p-6" 
                    onClick={handleStripeCheckout} 
                    disabled={!stripe}
                  >
                    <CreditCard className="w-6 h-6 mr-4" />
                    <div>
                      <p className="font-semibold text-left">บัตรเครดิต (Stripe)</p>
                      <p className="font-normal text-sm text-left">รับชำระผ่านบัตรเครดิตและเดบิต</p>
                    </div>
                  </Button>
                )}

                {/* แสดงข้อความเมื่อ Stripe เปิดใช้งานแต่ไม่ได้ตั้งค่า Price ID */}
                {(settings.payment?.stripeEnabled === 'true' || settings.payment?.stripeEnabled === '1') && (!settings.payment?.stripePriceId || settings.payment?.stripePriceId.trim() === '') && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-700">
                      ⚠️ Stripe เปิดใช้งานแล้ว แต่ยังไม่ได้ตั้งค่า Price ID
                    </p>
                  </div>
                )}

                {/* PromptPay */}
                {(settings.payment?.promptpayEnabled === 'true' || settings.payment?.promptpayEnabled === '1') && (
                  <Button 
                    size="lg" 
                    variant={(settings.payment?.defaultPaymentMethod === 'promptpay' || settings.payment?.defaultPaymentMethod === '3') ? "default" : "outline"} 
                    className="w-full flex justify-start items-center p-6" 
                    onClick={handleGeneratePromptPayQR}
                  >
                    <QrCode className="w-6 h-6 mr-4" />
                    <div>
                      <p className="font-semibold text-left">พร้อมเพย์ QR Code</p>
                      <p className="font-normal text-sm text-left">สร้าง QR Code สำหรับให้ลูกค้าสแกนจ่าย</p>
                    </div>
                  </Button>
                )}

                {/* แสดงข้อความเมื่อ PromptPay เปิดใช้งานแต่ไม่ได้ตั้งค่า ID */}
                {(settings.payment?.promptpayEnabled === 'true' || settings.payment?.promptpayEnabled === '1') && (!settings.payment?.promptpayId || settings.payment?.promptpayId.trim() === '') && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-700">
                      ⚠️ PromptPay เปิดใช้งานแล้ว แต่ยังไม่ได้ตั้งค่าเบอร์ PromptPay
                    </p>
                  </div>
                )}

                {/* แสดงข้อความเมื่อไม่มีช่องทางชำระเงิน */}
                {(!settings.payment?.cashEnabled || (settings.payment?.cashEnabled !== 'true' && settings.payment?.cashEnabled !== '1')) &&
                 (!settings.payment?.stripeEnabled || (settings.payment?.stripeEnabled !== 'true' && settings.payment?.stripeEnabled !== '1')) &&
                 (!settings.payment?.promptpayEnabled || (settings.payment?.promptpayEnabled !== 'true' && settings.payment?.promptpayEnabled !== '1')) && (
                  <div className="text-center py-8 text-orange-600">
                    <p className="font-medium">⚠️ ไม่มีช่องทางชำระเงินที่เปิดใช้งาน</p>
                    <p className="text-sm mt-1">กรุณาตั้งค่าช่องทางชำระเงินในหน้าตั้งค่า</p>
                  </div>
                )}


              </>
            )}
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