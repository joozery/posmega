import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import { X, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JsBarcode from 'jsbarcode';

const Receipt = React.forwardRef(({ sale, settings }, ref) => {
    const barcodeRef = useRef(null);

    useEffect(() => {
        if (barcodeRef.current && sale?.id) {
            try {
                JsBarcode(barcodeRef.current, sale.id, {
                    format: "CODE128",
                    displayValue: false,
                    width: 1.5,
                    height: 40,
                    margin: 0
                });
            } catch (error) {
                console.error('Error generating barcode:', error);
            }
        }
    }, [sale]);

    if (!sale) {
        console.log('No sale data provided to Receipt component');
        return null;
    }

    console.log('Rendering receipt with sale data:', sale);
    console.log('Sale items:', sale.items);
    console.log('Sale items type:', typeof sale.items);
    console.log('Sale items length:', sale.items?.length);
    console.log('Sale object keys:', Object.keys(sale));
    console.log('Sale subtotal:', sale.subtotal);
    console.log('Sale total:', sale.total);
    console.log('Sale tax:', sale.tax);
    console.log('Sale discount:', sale.discount);
    console.log('Sale payment method:', sale.payment_method || sale.paymentMethod);
    console.log('Settings:', settings);

    try {
        // Ensure all required fields have default values
        const safeSale = {
            id: sale.id || 'N/A',
            created_at: sale.created_at || sale.timestamp || new Date(),
            customer_name: sale.customer_name || sale.customer || 'ลูกค้าทั่วไป',
            items: sale.items || [],
            subtotal: parseFloat(sale.subtotal || 0),
            discount: parseFloat(sale.discount || 0),
            tax: parseFloat(sale.tax || 0),
            total: parseFloat(sale.total || 0),
            paymentMethod: sale.payment_method || sale.paymentMethod || 'ไม่ระบุ',
            pointsUsed: parseInt(sale.pointsUsed || 0),
            pointsEarned: parseInt(sale.pointsEarned || 0),
            finalLoyaltyPoints: parseInt(sale.finalLoyaltyPoints || 0)
        };

        console.log('Safe sale items:', safeSale.items);
        console.log('Safe sale items length:', safeSale.items?.length);

        // Convert payment method to Thai text
        const getPaymentMethodThai = (method) => {
            const paymentMethods = {
                'cash': 'เงินสด',
                'card': 'บัตรเครดิต',
                'transfer': 'โอนเงิน',
                'promptpay': 'พร้อมเพย์',
                'stripe': 'บัตรเครดิต (Stripe)'
            };
            return paymentMethods[method] || method;
        };

        // Ensure items have the correct structure
        const processedItems = (safeSale.items || []).map((item, index) => {
            console.log('Processing item:', item);
            return {
                id: item.id || index,
                product_name: item.product_name || item.name || `สินค้า ${index + 1}`,
                name: item.name || item.product_name || `สินค้า ${index + 1}`,
                quantity: item.quantity || 0,
                price: item.price || 0,
                total: item.total || ((item.price || 0) * (item.quantity || 0))
            };
        });

        console.log('Processed items:', processedItems);

        return (
            <div ref={ref} className="bg-white text-black p-4 font-sans text-xs w-[300px] mx-auto">
                <div className="text-center">
                    {settings?.system?.logo && (
                        <div className="mb-2">
                            <img 
                                src={settings.system.logo} 
                                alt="Store Logo" 
                                className="w-16 h-16 object-contain mx-auto"
                            />
                        </div>
                    )}
                    <h1 className="text-base font-bold">{settings?.system?.storeName || 'Wooyou'}</h1>
                    {settings?.system?.address && (
                        <p className="text-xs mt-1">{settings.system.address}</p>
                    )}
                    {(settings?.system?.phone || settings?.system?.email) && (
                        <div className="text-xs mt-1">
                            {settings?.system?.phone && <p>โทร: {settings.system.phone}</p>}
                            {settings?.system?.email && <p>อีเมล: {settings.system.email}</p>}
                        </div>
                    )}
                    {settings?.system?.taxId && (
                        <p className="text-xs mt-1">เลขประจำตัวผู้เสียภาษี: {settings.system.taxId}</p>
                    )}
                    <p className="mt-2">ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ</p>
                    <p>----------------------------------------</p>
                </div>
                <div className="my-2">
                    <p>เลขที่: {safeSale.id}</p>
                    <p>วันที่: {new Date(safeSale.created_at).toLocaleString('th-TH')}</p>
                    <p>ลูกค้า: {safeSale.customer_name}</p>
                </div>
                <p>----------------------------------------</p>
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-left w-2/4 pb-1">รายการ</th>
                            <th className="text-center w-1/4 pb-1">จำนวน</th>
                            <th className="text-right w-1/4 pb-1">ราคา</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processedItems.map((item, index) => {
                            console.log('Rendering processed item:', item);
                            return (
                                <tr key={item.id || index}>
                                    <td className="text-left align-top">
                                        {item.product_name || item.name || `สินค้า ${index + 1}`}
                                    </td>
                                    <td className="text-center align-top">{item.quantity || 0}</td>
                                    <td className="text-right align-top">
                                        {((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <p>----------------------------------------</p>
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span>ยอดรวม</span>
                        <span>{safeSale.subtotal.toFixed(2)}</span>
                    </div>
                    {safeSale.discount > 0 && (
                        <div className="flex justify-between">
                            <span>ส่วนลด</span>
                            <span>- {safeSale.discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>ภาษี ({parseFloat(settings?.system?.taxRate || 7)}%)</span>
                        <span>{safeSale.tax.toFixed(2)}</span>
                    </div>
                    <p>----------------------------------------</p>
                    <div className="flex justify-between font-bold text-base">
                        <span>รวมทั้งสิ้น</span>
                        <span>{safeSale.total.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>ชำระโดย</span>
                        <span>{getPaymentMethodThai(safeSale.paymentMethod)}</span>
                    </div>
                </div>
                {(safeSale.pointsUsed > 0 || safeSale.pointsEarned > 0) && (
                    <>
                        <p>----------------------------------------</p>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span>แต้มที่ใช้</span>
                                <span>{safeSale.pointsUsed}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>แต้มที่ได้รับ</span>
                                <span>{safeSale.pointsEarned}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                                <span>แต้มคงเหลือ</span>
                                <span>{safeSale.finalLoyaltyPoints}</span>
                            </div>
                        </div>
                    </>
                )}
                <p>----------------------------------------</p>
                <div className="text-center my-2">
                    <p>ขอบคุณที่ใช้บริการ</p>
                    <svg ref={barcodeRef} className="mx-auto mt-2"></svg>
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error rendering receipt:', error);
        return (
            <div ref={ref} className="bg-white text-black p-4 font-sans text-xs w-[300px] mx-auto">
                <div className="text-center">
                    <h1 className="text-base font-bold">ใบเสร็จรับเงิน</h1>
                    <p>เกิดข้อผิดพลาดในการแสดงใบเสร็จ</p>
                    <p>Error: {error.message}</p>
                    <p>Sale data: {JSON.stringify(sale, null, 2)}</p>
                </div>
            </div>
        );
    }
});

const ReceiptDialog = ({ isOpen, onClose, sale }) => {
    const componentRef = useRef();
    const [settings, setSettings] = useState({});

    useEffect(() => {
        if(isOpen) {
            const savedSettings = localStorage.getItem('pos_settings');
            console.log('Loading settings from localStorage:', savedSettings);
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                console.log('Parsed settings:', parsedSettings);
                setSettings(parsedSettings);
            } else {
                // If no settings in localStorage, try to load from API
                console.log('No settings in localStorage, loading from API...');
                fetch('https://posmega-backend-786f2703830d.herokuapp.com/api/settings')
                    .then(response => response.json())
                    .then(data => {
                        console.log('Settings from API:', data);
                        if (data.settings) {
                            setSettings(data.settings);
                            localStorage.setItem('pos_settings', JSON.stringify(data.settings));
                        }
                    })
                    .catch(error => {
                        console.error('Error loading settings from API:', error);
                    });
            }
        }
    }, [isOpen]);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Receipt-${sale?.id}`,
    });

    console.log('ReceiptDialog render:', { isOpen, sale });
    console.log('Sale validation:', {
        hasSale: !!sale,
        saleType: typeof sale,
        saleKeys: sale ? Object.keys(sale) : 'null',
        hasItems: sale?.items?.length > 0,
        hasTotal: !!sale?.total,
        hasSubtotal: !!sale?.subtotal,
        itemsCount: sale?.items?.length || 0
    });
    console.log('Sale object details:', {
        id: sale?.id,
        total: sale?.total,
        subtotal: sale?.subtotal,
        tax: sale?.tax,
        discount: sale?.discount,
        paymentMethod: sale?.payment_method || sale?.paymentMethod,
        customerName: sale?.customer_name || sale?.customer,
        items: sale?.items
    });

    if (!sale && isOpen) {
        console.error('ReceiptDialog is open but no sale data provided');
        return null;
    }

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
                        className="relative bg-gray-100 rounded-xl shadow-xl w-auto mx-4"
                    >
                        <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-xl">
                            <h2 className="text-xl font-semibold text-gray-900">ใบเสร็จ</h2>
                            <div className="flex items-center space-x-2">
                                <Button onClick={handlePrint} size="sm">
                                    <Printer className="w-4 h-4 mr-2" />
                                    พิมพ์
                                </Button>
                                <Button variant="ghost" size="icon" onClick={onClose}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                        <div className="p-4 overflow-y-auto">
                            <Receipt ref={componentRef} sale={sale} settings={settings} />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ReceiptDialog;