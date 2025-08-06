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
            JsBarcode(barcodeRef.current, sale.id, {
                format: "CODE128",
                displayValue: false,
                width: 1.5,
                height: 40,
                margin: 0
            });
        }
    }, [sale]);

    if (!sale) return null;

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
                <h1 className="text-base font-bold">{settings?.system?.storeName || 'My Store'}</h1>
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
                <p>เลขที่: {sale.id}</p>
                <p>วันที่: {new Date(sale.timestamp).toLocaleString('th-TH')}</p>
                <p>ลูกค้า: {sale.customer}</p>
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
                    {sale.items.map(item => (
                        <tr key={item.id}>
                            <td className="text-left align-top">{item.name}</td>
                            <td className="text-center align-top">{item.quantity}</td>
                            <td className="text-right align-top">{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p>----------------------------------------</p>
            <div className="space-y-1">
                <div className="flex justify-between">
                    <span>ยอดรวม</span>
                    <span>{sale.subtotal.toFixed(2)}</span>
                </div>
                {sale.discount > 0 && (
                    <div className="flex justify-between">
                        <span>ส่วนลด</span>
                        <span>- {sale.discount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span>ภาษี ({parseFloat(settings?.system?.taxRate || 7)}%)</span>
                    <span>{sale.tax.toFixed(2)}</span>
                </div>
                <p>----------------------------------------</p>
                <div className="flex justify-between font-bold text-base">
                    <span>รวมทั้งสิ้น</span>
                    <span>{sale.total.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between">
                    <span>ชำระโดย</span>
                    <span>{sale.paymentMethod}</span>
                </div>
            </div>
            {sale.customerId && (
                <>
                    <p>----------------------------------------</p>
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span>แต้มที่ใช้</span>
                            <span>{sale.pointsUsed || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>แต้มที่ได้รับ</span>
                            <span>{sale.pointsEarned || 0}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>แต้มคงเหลือ</span>
                            <span>{sale.finalLoyaltyPoints || 0}</span>
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
});

const ReceiptDialog = ({ isOpen, onClose, sale }) => {
    const componentRef = useRef();
    const [settings, setSettings] = useState({});

    useEffect(() => {
        if(isOpen) {
            const savedSettings = localStorage.getItem('pos_settings');
            if (savedSettings) setSettings(JSON.parse(savedSettings));
        }
    }, [isOpen]);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Receipt-${sale?.id}`,
    });

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