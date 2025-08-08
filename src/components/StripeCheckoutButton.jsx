import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, Loader2 } from 'lucide-react';

const stripePromise = loadStripe('YOUR_STRIPE_PUBLISHABLE_KEY');

const StripeCheckoutButton = ({ cart, customer, taxRate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    if (cart.length === 0) {
      toast({ title: "ตะกร้าว่าง", description: "กรุณาเพิ่มสินค้าก่อนชำระเงิน", variant: "destructive" });
      setLoading(false);
      return;
    }

    const stripeKey = 'YOUR_STRIPE_PUBLISHABLE_KEY';
    if (stripeKey.startsWith('YOUR_')) {
        toast({
            title: "ตั้งค่า Stripe ก่อน",
            description: "กรุณาใส่ Stripe Publishable Key ของคุณในโค้ดก่อนใช้งาน",
            variant: "destructive",
            duration: 9000,
        });
        setLoading(false);
        return;
    }
    
    const stripe = await stripePromise;
    if (!stripe) {
        toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถเชื่อมต่อกับ Stripe ได้", variant: "destructive" });
        setLoading(false);
        return;
    }

    const line_items = cart.map(item => ({
      price_data: {
        currency: 'thb',
        product_data: {
          name: item.name,
          images: item.image_url ? [item.image_url] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = subtotal * taxRate;

    if (taxAmount > 0) {
        line_items.push({
            price_data: {
                currency: 'thb',
                product_data: {
                    name: `ภาษี (${(taxRate * 100).toFixed(0)}%)`,
                },
                unit_amount: Math.round(taxAmount * 100),
            },
            quantity: 1,
        });
    }

    const checkoutData = { cart, customer };
    localStorage.setItem('stripe_checkout_session', JSON.stringify(checkoutData));

    const { error } = await stripe.redirectToCheckout({
      line_items,
      mode: 'payment',
      successUrl: `${window.location.origin}/pos?checkout=success`,
      cancelUrl: `${window.location.origin}/pos?checkout=cancel`,
      customer_email: customer?.email || undefined,
    });

    if (error) {
      toast({ title: "เกิดข้อผิดพลาด", description: error.message, variant: "destructive" });
      setLoading(false);
      localStorage.removeItem('stripe_checkout_session');
    }
  };

  return (
    <Button variant="outline" className="w-full" size="lg" onClick={handleCheckout} disabled={loading}>
      {loading ? (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      ) : (
        <CreditCard className="w-5 h-5 mr-2" />
      )}
      ชำระบัตรเครดิต/QR
    </Button>
  );
};

export default StripeCheckoutButton;