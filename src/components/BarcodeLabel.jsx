import React, { useRef, useEffect, useState } from 'react';
import JsBarcode from 'jsbarcode';

const defaultSettings = {
    format: "CODE128",
    width: 2,
    height: 40,
    displayValue: true,
    font: "monospace",
    textAlign: "center",
    textPosition: "bottom",
    textMargin: 2,
    fontSize: 20,
    background: "#ffffff",
    lineColor: "#000000",
    margin: 10,
    showName: true,
    showPrice: true,
    showSku: true,
    nameBold: true,
    priceBold: true,
    labelWidth: 240,
    labelHeight: 140,
};

const BarcodeLabel = ({ product, settings: propSettings }) => {
  const barcodeRef = useRef(null);
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const savedSettings = localStorage.getItem('pos_barcode_settings');
    const initialSettings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    setSettings({ ...initialSettings, ...propSettings });
  }, [propSettings]);

  useEffect(() => {
    if (barcodeRef.current && product.barcode) {
      try {
        JsBarcode(barcodeRef.current, product.barcode, {
          ...settings,
          displayValue: settings.showSku,
          lineColor: settings.lineColor, 
        });
      } catch (e) {
        console.error("Barcode generation error:", e);
      }
    }
  }, [product.barcode, settings]);

  const priceParts = product.price.toLocaleString('en-US', { minimumFractionDigits: 2 }).split('.');

  return (
    <div 
      className="border rounded-lg p-2 flex flex-col justify-between bg-white text-black break-inside-avoid"
      style={{ width: `${settings.labelWidth}px`, height: `${settings.labelHeight}px` }}
    >
      <div className="flex-grow overflow-hidden">
        <div className="flex justify-between items-start">
          {settings.showName && (
            <span className={`text-lg leading-tight line-clamp-2 ${settings.nameBold ? 'font-bold' : ''}`}>
              {product.name}
            </span>
          )}
          {settings.showPrice && (
            <div className="text-right flex-shrink-0 ml-2">
              <span className={`leading-none ${settings.priceBold ? 'font-black text-4xl' : 'font-bold text-3xl'}`}>
                {priceParts[0]}
              </span>
              <span className={`ml-1 ${settings.priceBold ? 'font-bold text-md' : 'font-semibold text-sm'}`}>
                .{priceParts[1]}
              </span>
            </div>
          )}
        </div>
        {settings.showPrice && product.originalPrice && (
          <p className="text-right text-xs text-gray-600 mt-1 line-through">
            ปกติ {product.originalPrice.toLocaleString()}
          </p>
        )}
      </div>
      <div className="flex justify-center items-end" style={{ height: `${settings.height + (settings.showSku ? settings.fontSize : 0) + 10}px` }}>
        <svg ref={barcodeRef}></svg>
      </div>
    </div>
  );
};

export default BarcodeLabel;