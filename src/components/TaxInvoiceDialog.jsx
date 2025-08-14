import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { settingsService } from '@/services/settingsService';

// Tax Invoice Component
const TaxInvoice = React.forwardRef(({ sale, settings }, ref) => {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && sale?.id) {
      try {
        // Generate barcode for sale ID
        const JsBarcode = require('jsbarcode');
        JsBarcode(barcodeRef.current, sale.id.toString(), {
          format: 'CODE128',
          width: 2,
          height: 50,
          displayValue: false
        });
      } catch (e) {
        console.error("Barcode generation error:", e);
      }
    }
  }, [sale?.id]);

  if (!sale) {
    console.log('No sale data provided to TaxInvoice component');
    return null;
  }

  try {
    // Safe parsing of sale data
    const safeSale = {
      id: sale.id || 'N/A',
      customer: sale.customer_name || sale.customer || 'ลูกค้าทั่วไป',
      items: Array.isArray(sale.items) ? sale.items : [],
      total: parseFloat(sale.total || 0),
      subtotal: parseFloat(sale.subtotal || 0),
      tax: parseFloat(sale.tax || 0),
      discount: parseFloat(sale.discount || 0),
      timestamp: sale.created_at || sale.timestamp || new Date(),
      paymentMethod: sale.payment_method || sale.paymentMethod || 'เงินสด',
      pointsUsed: parseInt(sale.pointsUsed || 0),
      pointsEarned: parseInt(sale.pointsEarned || 0)
    };

    const getPaymentMethodThai = (method) => {
      const methods = {
        'cash': 'เงินสด',
        'card': 'บัตรเครดิต/เดบิต',
        'transfer': 'โอนเงิน',
        'qr': 'QR Code'
      };
      return methods[method] || method;
    };

    const processedItems = (safeSale.items || []).map((item, index) => {
      const itemName = item.product_name || item.name || 'สินค้าไม่ระบุ';
      const itemPrice = parseFloat(item.price || 0);
      const itemQuantity = parseInt(item.quantity || 0);
      const itemTotal = itemPrice * itemQuantity;
      
      return {
        name: itemName,
        price: itemPrice,
        quantity: itemQuantity,
        total: itemTotal
      };
    });

    const taxRate = parseFloat(settings?.system?.taxRate || settings?.tax_rate || 7);
    const calculatedTax = (safeSale.subtotal * taxRate) / 100;
    const finalTax = safeSale.tax || calculatedTax;

    return (
      <div ref={ref} className="bg-white text-black p-4 font-sans text-xs w-[300px] mx-auto">
        <div className="text-center">
          {console.log('Rendering tax invoice with settings:', settings)}
          {console.log('Store name:', settings?.system?.storeName)}
          {console.log('Store address:', settings?.system?.address)}
          
          {/* Store Logo */}
          {(settings?.system?.logo_url || settings?.logo_url) && (
            <div className="mb-2">
              <img 
                src={settings?.system?.logo_url || settings?.logo_url} 
                alt="Store Logo" 
                className="w-16 h-16 object-contain mx-auto"
              />
            </div>
          )}
          
          {/* Store Header */}
          <h1 className="text-base font-bold">
            {settings?.system?.storeName || settings?.store_name || 'Wooyou'}
            {console.log('Displaying store name:', settings?.system?.storeName || settings?.store_name)}
          </h1>
          
          {/* Store Details */}
          {(settings?.system?.address || settings?.address) && (
            <p className="text-xs mt-1">{settings?.system?.address || settings?.address}</p>
          )}
          
          {(settings?.system?.phone || settings?.system?.email || settings?.phone || settings?.email) && (
            <div className="text-xs mt-1">
              {(settings?.system?.phone || settings?.phone) && (
                <p>โทร: {settings?.system?.phone || settings?.phone}</p>
              )}
              {(settings?.system?.email || settings?.email) && (
                <p>อีเมล: {settings?.system?.email || settings?.email}</p>
              )}
            </div>
          )}
          
          {(settings?.system?.taxId || settings?.tax_id) && (
            <p className="text-xs mt-1">เลขประจำตัวผู้เสียภาษี: {settings?.system?.taxId || settings?.tax_id}</p>
          )}
          
          <div className="mt-2 border-t pt-2">
            <p className="text-sm font-bold">ใบกำกับภาษีอย่างย่อ</p>
            <p className="text-xs">เลขที่: {safeSale.id}</p>
            <p className="text-xs">วันที่: {new Date(safeSale.timestamp).toLocaleDateString('th-TH')}</p>
            <p className="text-xs">เวลา: {new Date(safeSale.timestamp).toLocaleTimeString('th-TH')}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mt-3 border-b pb-2">
          <p className="text-sm font-medium">ลูกค้า: {safeSale.customer}</p>
          <p className="text-xs text-gray-600">วิธีการชำระ: {getPaymentMethodThai(safeSale.paymentMethod)}</p>
        </div>

        {/* Items */}
        <div className="mt-3 border-b pb-2">
          <div className="text-xs font-medium mb-2">รายการสินค้า</div>
          {processedItems.map((item, index) => (
            <div key={index} className="flex justify-between text-xs mb-1">
              <span className="flex-1">{item.name}</span>
              <span className="text-right ml-2">
                {item.quantity} x ฿{item.price.toFixed(2)} = ฿{item.total.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-3 space-y-1 text-xs">
          <div className="flex justify-between">
            <span>ราคารวม: ฿{safeSale.subtotal.toFixed(2)}</span>
          </div>
          
          {safeSale.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>ส่วนลด: -฿{safeSale.discount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span>ภาษี ({taxRate}%): ฿{finalTax.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between font-bold text-base border-t pt-1">
            <span>รวมทั้งสิ้น: ฿{safeSale.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Loyalty Points */}
        {(safeSale.pointsUsed > 0 || safeSale.pointsEarned > 0) && (
          <div className="mt-3 border-t pt-2 text-xs">
            {safeSale.pointsUsed > 0 && (
              <p className="text-blue-600">ใช้แต้ม: {safeSale.pointsUsed} แต้ม</p>
            )}
            {safeSale.pointsEarned > 0 && (
              <p className="text-green-600">ได้รับแต้ม: {safeSale.pointsEarned} แต้ม</p>
            )}
          </div>
        )}

        {/* Barcode */}
        <div className="mt-3 text-center">
          <svg ref={barcodeRef}></svg>
          <p className="text-xs text-gray-500 mt-1">รหัสการขาย: {safeSale.id}</p>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>ขอบคุณที่ใช้บริการ</p>
          <p>ใบกำกับภาษีอย่างย่อ</p>
          <p>ไม่สามารถใช้เป็นใบเสร็จรับเงินได้</p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering tax invoice:', error);
    return (
      <div ref={ref} className="bg-white text-black p-4 font-sans text-xs w-[300px] mx-auto">
        <p className="text-red-600">เกิดข้อผิดพลาดในการแสดงใบกำกับภาษี</p>
        <p className="text-xs">{error.message}</p>
      </div>
    );
  }
});

// Main Dialog Component
const TaxInvoiceDialog = ({ isOpen, onClose, sale }) => {
  const componentRef = useRef();
  const [settings, setSettings] = useState({});

  useEffect(() => {
    if (isOpen) {
      const savedSettings = localStorage.getItem('pos_settings');
      console.log('Loading settings from localStorage:', savedSettings);
      
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('Parsed settings:', parsedSettings);
        setSettings(parsedSettings);
      } else {
        console.log('No settings in localStorage, loading from API...');
        const loadSettingsFromAPI = async () => {
          try {
            const data = await settingsService.getAllSettings();
            console.log('Settings from API:', data);
            if (data.settings) {
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

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => {
      console.log('Tax invoice printed successfully');
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">ใบกำกับภาษี</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="mb-4">
          <TaxInvoice ref={componentRef} sale={sale} settings={settings} />
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            ปิด
          </Button>
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="w-4 h-4 mr-2" />
            พิมพ์
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaxInvoiceDialog; 