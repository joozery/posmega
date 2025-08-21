import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import { X, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JsBarcode from 'jsbarcode';
import { settingsService } from '@/services/settingsService';
import { useAuth } from '@/hooks/useAuth';

const Receipt = React.forwardRef(({ sale, settings, type = 'receipt' }, ref) => {
    const barcodeRef = useRef(null);
    const { user } = useAuth();

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

    // Don't render if no sale data
    if (!sale) {
        console.log('Receipt not rendering - no sale data');
        return null;
    }

    // Create safeSale only when we have sale data
    const safeSale = {
        id: sale.id || 'N/A',
        created_at: sale.created_at || sale.timestamp || new Date(),
        customer_name: sale.customer_name || sale.customer || 'ลูกค้าทั่วไป',
        created_by_name: sale.created_by_name || 'ไม่ระบุ',
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

    console.log('Safe sale created_by_name:', safeSale.created_by_name);

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
        console.log('Item sizes:', item.sizes, 'Type:', typeof item.sizes);
        console.log('Item colors:', item.colors, 'Type:', typeof item.colors);
        
        // ข้อมูล sizes และ colors เป็น object/array อยู่แล้ว ไม่ต้อง parse
        let sizes = item.sizes || [];
        let colors = item.colors || [];
        
        // แปลงเป็น array ถ้าเป็น object
        if (typeof sizes === 'object' && !Array.isArray(sizes)) {
            sizes = Object.values(sizes);
        }
        if (typeof colors === 'object' && !Array.isArray(colors)) {
            colors = Object.values(colors);
        }
        
        console.log('Receipt - Original sizes:', item.sizes, 'Processed sizes:', sizes);
        console.log('Receipt - Original colors:', item.colors, 'Processed colors:', colors);
        
        return {
            id: item.id || index,
            product_name: item.product_name || item.name || `สินค้า ${index + 1}`,
            name: item.name || item.product_name || `สินค้า ${index + 1}`,
            quantity: item.quantity || 0,
            price: item.price || 0,
            total: item.total || ((item.price || 0) * (item.quantity || 0)),
            // เพิ่มข้อมูลรายละเอียดสินค้า
            sizes: sizes,
            colors: colors,
            sku: item.sku || item.barcode || '',
            category: item.category || ''
        };
    });

    console.log('Processed items:', processedItems);

    return (
        <div ref={ref} className="bg-white text-black p-4 font-sans text-xs w-[300px] mx-auto">
            <div className="text-center">
                {console.log('Rendering receipt with settings:', settings)}
                {console.log('Store name:', settings?.system?.storeName)}
                {console.log('Store address:', settings?.system?.address)}
                {(settings?.system?.logo_url || settings?.logo_url) && (
                    <div className="mb-2">
                        <img 
                            src={settings?.system?.logo_url || settings?.logo_url} 
                            alt="Store Logo" 
                            className="w-16 h-16 object-contain mx-auto"
                        />
                    </div>
                )}
                <h1 className="text-base font-bold">
                    {settings?.system?.storeName || 'Wooyou'}
                    {console.log('Displaying store name:', settings?.system?.storeName)}
                </h1>
                {(settings?.system?.address || settings?.address) && (
                    <p className="text-xs mt-1">
                        {settings?.system?.address || settings?.address}
                        {console.log('Displaying address:', settings?.system?.address || settings?.address)}
                    </p>
                )}
                {(settings?.system?.phone || settings?.system?.email || settings?.phone || settings?.email) && (
                    <div className="text-xs mt-1">
                        {(settings?.system?.phone || settings?.phone) && <p>โทร: {settings?.system?.phone || settings?.phone}</p>}
                        {(settings?.system?.email || settings?.email) && <p>อีเมล: {settings?.system?.email || settings?.email}</p>}
                    </div>
                )}
                {(settings?.system?.taxId || settings?.tax_id) && (
                    <p className="text-xs mt-1">เลขประจำตัวผู้เสียภาษี: {settings?.system?.taxId || settings?.tax_id}</p>
                )}
                <p className="mt-2">
                    {type === 'tax-invoice' ? 'ใบกำกับภาษีอย่างย่อ' : 'ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ'}
                </p>
                <p>----------------------------------------</p>
            </div>
            <div className="my-2">
                <p>เลขที่: {safeSale.id}</p>
                <p>วันที่: {new Date(safeSale.created_at).toLocaleString('th-TH')}</p>
                <p>ลูกค้า: {safeSale.customer_name}</p>
                <p>คนขาย: {safeSale.created_by_name}</p>
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
                                    <div>
                                        <div className="font-medium">
                                            {item.product_name || item.name || `สินค้า ${index + 1}`}
                                        </div>
                                        {/* แสดง SKU และ Category */}
                                        {(item.sku || item.category) && (
                                            <div className="text-xs text-gray-600 mt-1">
                                                {item.sku && <span>SKU: {item.sku}</span>}
                                                {item.sku && item.category && <span> • </span>}
                                                {item.category && <span>หมวดหมู่: {item.category}</span>}
                                            </div>
                                        )}
                                        {/* แสดง Size และ Color */}
                                        {(item.sizes?.length > 0 || item.colors?.length > 0) && (
                                            <div className="text-xs text-gray-600 mt-1">
                                                {item.sizes?.length > 0 && (
                                                    <span>ขนาด: {item.sizes.join(', ')}</span>
                                                )}
                                                {item.sizes?.length > 0 && item.colors?.length > 0 && <span> • </span>}
                                                {item.colors?.length > 0 && (
                                                    <span>สี: {item.colors.join(', ')}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
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
            
            {/* แสดงข้อมูลสินค้าเพิ่มเติม */}
            {processedItems.some(item => item.sizes?.length > 0 || item.colors?.length > 0 || item.sku || item.category) && (
                <div className="mt-2 text-xs text-gray-600">
                    <p className="font-medium mb-1">รายละเอียดสินค้า:</p>
                    {processedItems.map((item, index) => {
                        if (!item.sizes?.length && !item.colors?.length && !item.sku && !item.category) return null;
                        
                        return (
                            <div key={item.id || index} className="ml-2 mb-1">
                                <span className="font-medium">{item.name}:</span>
                                {item.sku && <span className="ml-1">SKU: {item.sku}</span>}
                                {item.category && <span className="ml-1">หมวดหมู่: {item.category}</span>}
                                {item.sizes?.length > 0 && <span className="ml-1">ขนาด: {item.sizes.join(', ')}</span>}
                                {item.colors?.length > 0 && <span className="ml-1">สี: {item.colors.join(', ')}</span>}
                            </div>
                        );
                    })}
                </div>
            )}
            
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
                    <span>ภาษี ({parseFloat(settings?.system?.taxRate || settings?.tax_rate || 7)}%)</span>
                    <span>{safeSale.tax.toFixed(2)}</span>
                </div>
                <p>----------------------------------------</p>
                <div className="flex justify-between font-bold text-base">
                    <span>รวมทั้งสิ้น</span>
                    <span>{safeSale.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                    <span>ชำระโดย:</span>
                    <span>{getPaymentMethodThai(safeSale.paymentMethod)}</span>
                </div>
                {safeSale.pointsUsed > 0 && (
                    <div className="flex justify-between text-sm">
                        <span>ใช้คะแนน:</span>
                        <span>{safeSale.pointsUsed}</span>
                    </div>
                )}
                {safeSale.pointsEarned > 0 && (
                    <div className="flex justify-between text-sm">
                        <span>ได้คะแนน:</span>
                        <span>{safeSale.pointsEarned}</span>
                    </div>
                )}
            </div>
            <p>----------------------------------------</p>
            <div className="text-center text-xs">
                <p>ขอบคุณที่ใช้บริการ</p>
                {type === 'tax-invoice' && (
                    <p className="text-gray-500 mt-1">ไม่สามารถใช้เป็นใบเสร็จรับเงินได้</p>
                )}
                <div className="mt-2">
                    <svg ref={barcodeRef} className="mx-auto"></svg>
                </div>
            </div>
        </div>
    );
});

const ReceiptDialog = ({ isOpen, onClose, sale, type = 'receipt' }) => {
    const componentRef = useRef();
    const [settings, setSettings] = useState({});

    // Add custom scrollbar styles
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .receipt-scroll::-webkit-scrollbar {
                width: 8px;
            }
            .receipt-scroll::-webkit-scrollbar-track {
                background: #F3F4F6;
                border-radius: 4px;
            }
            .receipt-scroll::-webkit-scrollbar-thumb {
                background: #9CA3AF;
                border-radius: 4px;
            }
            .receipt-scroll::-webkit-scrollbar-thumb:hover {
                background: #6B7280;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

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
                const loadSettingsFromAPI = async () => {
                    try {
                        const data = await settingsService.getAllSettings();
                        console.log('Settings from API:', data);
                        if (data.settings) {
                            console.log('Settings from API:', data.settings);
                            console.log('System settings:', data.settings.system);
                            console.log('Store name:', data.settings.system?.storeName);
                            console.log('Store address:', data.settings.system?.address);
                            console.log('Store phone:', data.settings.system?.phone);
                            console.log('Store email:', data.settings.system?.email);
                            console.log('Store taxId:', data.settings.system?.taxId);
                            console.log('Store logo_url:', data.settings.system?.logo_url);
                            setSettings(data.settings);
                            localStorage.setItem('pos_settings', JSON.stringify(data.settings));
                        }
                    } catch (error) {
                        console.error('Error loading settings from API:', error);
                    }
                };
                
                loadSettingsFromAPI();
            }
        }
    }, [isOpen]);

    console.log('ReceiptDialog settings:', settings);
    console.log('ReceiptDialog system:', settings?.system);
    console.log('ReceiptDialog storeName:', settings?.system?.storeName);
    console.log('ReceiptDialog address:', settings?.system?.address);
    console.log('ReceiptDialog phone:', settings?.system?.phone);
    console.log('ReceiptDialog email:', settings?.system?.email);
    console.log('ReceiptDialog taxId:', settings?.system?.taxId);
    console.log('ReceiptDialog logo_url:', settings?.system?.logo_url);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: type === 'tax-invoice' ? `TaxInvoice-${sale?.id}` : `Receipt-${sale?.id}`,
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
        createdBy: sale?.created_by,
        createdByName: sale?.created_by_name,
        items: sale?.items
    });
    console.log('ReceiptDialog - sale created_by_name:', sale?.created_by_name);
    console.log('ReceiptDialog - sale created_by:', sale?.created_by);

    // Don't render if not open or no sale data
    if (!isOpen || !sale) {
        console.log('ReceiptDialog not rendering - isOpen:', isOpen, 'sale:', !!sale);
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
                            <h2 className="text-xl font-semibold text-gray-900">
                                {type === 'tax-invoice' ? 'ใบกำกับภาษี' : 'ใบเสร็จ'}
                            </h2>
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
                        <div 
                            className="p-4 overflow-y-auto max-h-[70vh] receipt-scroll"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#9CA3AF #F3F4F6'
                            }}
                        >
                            <Receipt ref={componentRef} sale={sale} settings={settings} type={type} />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ReceiptDialog;