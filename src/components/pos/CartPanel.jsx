import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { X, Trash2, UserPlus, UserCheck, Star, Ticket, Tag } from 'lucide-react';
import PaymentDialog from '@/components/PaymentDialog';

const CartPanel = ({ cart, customers, selectedCustomer, onSelectCustomer, onRemoveCustomer, onUpdateQuantity, onRemoveFromCart, onOpenCustomerDialog, onProcessSale, onClose }) => {
    const { toast } = useToast();
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [loyaltySettings, setLoyaltySettings] = useState({ purchaseAmountForOnePoint: 100, onePointValueInBaht: 1 });
    const [pointsToUse, setPointsToUse] = useState('');
    const [discount, setDiscount] = useState(0);

    useEffect(() => {
        const savedSettings = localStorage.getItem('pos_settings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            if (parsed.loyalty) {
                setLoyaltySettings(parsed.loyalty);
            }
        }
    }, []);

    useEffect(() => {
        setPointsToUse('');
        setDiscount(0);
    }, [selectedCustomer, cart]);

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRateData = JSON.parse(localStorage.getItem('pos_settings') || '{}')?.system?.taxRate;
    const taxRate = parseFloat(taxRateData || 7) / 100;
    const totalAfterDiscount = subtotal - discount;
    const tax = totalAfterDiscount * taxRate;
    const total = totalAfterDiscount + tax;

    const handleApplyPoints = () => {
        const points = parseInt(pointsToUse);
        if (!selectedCustomer || !loyaltySettings || !points || points <= 0) {
            toast({ title: "ข้อมูลไม่ถูกต้อง", description: "กรุณาใส่จำนวนแต้มที่ต้องการใช้", variant: "destructive" });
            return;
        }
        if (points > selectedCustomer.loyaltyPoints) {
            toast({ title: "แต้มไม่เพียงพอ", description: `คุณมีแต้มสะสม ${selectedCustomer.loyaltyPoints} แต้ม`, variant: "destructive" });
            return;
        }
        const calculatedDiscount = points * loyaltySettings.onePointValueInBaht;
        if (calculatedDiscount > subtotal) {
            toast({ title: "ใช้แต้มเกินยอดซื้อ", description: "ไม่สามารถใช้ส่วนลดเกินยอดรวมสินค้าได้", variant: "destructive" });
            return;
        }
        setDiscount(calculatedDiscount);
        toast({ title: "ใช้แต้มสำเร็จ", description: `รับส่วนลด ${calculatedDiscount.toLocaleString()} บาท` });
    };

    const handleRemoveDiscount = () => {
        setDiscount(0);
        setPointsToUse('');
        toast({ title: "ยกเลิกส่วนลด", description: "ยกเลิกการใช้แต้มสะสมแล้ว" });
    };

    const handleConfirmPayment = (paymentMethod) => {
        const discountInfo = {
            pointsUsed: discount > 0 ? parseInt(pointsToUse) : 0,
            discountAmount: discount
        };
        const saleData = onProcessSale(paymentMethod, discountInfo);
        if (saleData) {
            setIsPaymentDialogOpen(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold text-gray-900">ตะกร้าสินค้า</h2>
                {onClose && <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>}
            </div>

            <div className="p-4 border-b">
                {selectedCustomer ? (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <UserCheck className="w-6 h-6 text-blue-600" />
                            <div>
                                <p className="font-semibold text-blue-800">{selectedCustomer.name}</p>
                                <p className="text-xs text-blue-600">{selectedCustomer.phone}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={onRemoveCustomer}><X className="w-4 h-4" /></Button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <select onChange={(e) => onSelectCustomer(customers.find(c => c.id === parseInt(e.target.value)))} className="w-full px-4 py-2 border rounded-lg" defaultValue="">
                            <option value="" disabled>เลือกลูกค้า</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <Button variant="outline" onClick={onOpenCustomerDialog}><UserPlus className="w-4 h-4" /></Button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">ยังไม่มีสินค้าในตะกร้า</div>
                ) : (
                    cart.map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover bg-gray-100" />
                            <div className="flex-1">
                                <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                                <p className="text-xs text-gray-500">฿{item.price.toLocaleString()}</p>
                                <div className="flex items-center mt-1">
                                    <Input type="number" value={item.quantity} onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value))} className="w-16 h-8 text-center" />
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">฿{(item.price * item.quantity).toLocaleString()}</p>
                                <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-500 hover:text-red-600" onClick={() => onRemoveFromCart(item.id)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedCustomer && (selectedCustomer.loyaltyPoints || 0) > 0 && (
                <div className="p-4 border-t bg-yellow-50">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-yellow-800">
                            <Star className="w-5 h-5 text-yellow-500" />
                            <span className="font-semibold">แต้มสะสม: {selectedCustomer.loyaltyPoints || 0}</span>
                        </div>
                        {discount > 0 && <Button variant="link" size="sm" className="text-red-600" onClick={handleRemoveDiscount}>ยกเลิกส่วนลด</Button>}
                    </div>
                    {discount === 0 ? (
                        <div className="flex gap-2">
                            <Input type="number" placeholder="ใช้แต้ม" value={pointsToUse} onChange={e => setPointsToUse(e.target.value)} max={selectedCustomer.loyaltyPoints} />
                            <Button onClick={handleApplyPoints}>ใช้</Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-2 bg-green-100 rounded-lg">
                            <div className="flex items-center gap-2 text-green-800">
                                <Ticket className="w-5 h-5" />
                                <span className="font-semibold">ใช้ {pointsToUse} แต้มเป็นส่วนลด</span>
                            </div>
                            <span className="font-bold text-green-800">-฿{discount.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            )}

            <div className="p-4 mt-auto border-t space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-600">ยอดรวม</span><span className="font-medium">฿{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                {discount > 0 && <div className="flex justify-between text-sm text-green-600"><span className="text-gray-600">ส่วนลด</span><span className="font-medium">-฿{discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-gray-600">ภาษี ({taxRate * 100}%)</span><span className="font-medium">฿{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between text-xl font-bold"><span className="text-gray-900">ยอดสุทธิ</span><span className="text-blue-600">฿{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                <Button size="lg" className="w-full mt-2" onClick={() => setIsPaymentDialogOpen(true)} disabled={cart.length === 0}>
                    <Tag className="w-5 h-5 mr-2" />ชำระเงิน
                </Button>
            </div>
            <PaymentDialog 
                isOpen={isPaymentDialogOpen} 
                onClose={() => setIsPaymentDialogOpen(false)} 
                onConfirm={handleConfirmPayment}
                total={total}
                cart={cart}
                customer={selectedCustomer}
                discount={discount}
            />
        </div>
    );
};

export default CartPanel;