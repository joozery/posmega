import React, { useRef, useEffect, useState } from 'react';
import JsBarcode from 'jsbarcode';

const defaultSettings = {
    format: "CODE128",
    lineColor: "#000000",
    showName: true,
    showPrice: true,
    showSku: true,
    nameBold: true,
    priceBold: true,
};

const BarcodeItem = ({ product }) => {
    const barcodeRef = useRef(null);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const savedSettings = localStorage.getItem('pos_barcode_settings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        } else {
            setSettings(defaultSettings);
        }
    }, []);

    useEffect(() => {
        if (barcodeRef.current && product.barcode && settings) {
            try {
                JsBarcode(barcodeRef.current, product.barcode, {
                    format: settings.format || "CODE128",
                    width: 1.2,
                    height: 35,
                    displayValue: false,
                    background: 'transparent',
                    lineColor: settings.lineColor || "#000000",
                });
            } catch (e) {
                console.error("Barcode generation error:", e);
            }
        }
    }, [product.barcode, settings]);

    if (!settings) return null;

    return (
        <div className="flex-1 text-center flex flex-col justify-between border border-gray-300 rounded-lg p-1 print:p-0.5 min-w-0 barcode-label-print">
            <div className="min-w-0">
                <div className="flex justify-between items-baseline gap-1">
                    {settings.showName && (
                        <span className={`text-xs truncate flex-1 text-left ${settings.nameBold ? 'font-bold' : ''}`}>{product.name}</span>
                    )}
                    {settings.showPrice && (
                        <span className={`text-lg flex-shrink-0 ${settings.priceBold ? 'font-black' : 'font-bold'}`}>
                            {product.price.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                    )}
                </div>
                 {settings.showPrice && product.originalPrice && (
                    <p className="text-right text-xs text-gray-500 mt-0 line-through">
                        ปกติ {product.originalPrice.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                )}
            </div>
            <div className="w-full h-[35px] mt-1 print:mt-0.5">
                <svg ref={barcodeRef} className="w-full h-full"></svg>
            </div>
            {settings.showSku && (
                <p className="text-xs font-mono mt-1 print:mt-0.5 truncate">{product.barcode}</p>
            )}
        </div>
    );
};

const MultiProductBarcodeLabel = ({ products }) => {
    if (!products || products.length === 0) return null;

    return (
        <div className="flex justify-around gap-1 print:gap-0 bg-white break-inside-avoid text-black print:break-inside-avoid barcode-row">
            {products.map((p, index) => (
                <BarcodeItem key={`${p.id}-${index}`} product={p} />
            ))}
        </div>
    );
};

export default MultiProductBarcodeLabel;