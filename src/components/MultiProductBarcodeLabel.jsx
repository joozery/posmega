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
        if (barcodeRef.current && product.sku && settings) {
            try {
                JsBarcode(barcodeRef.current, product.sku, {
                    format: settings.format || "CODE128",
                    width: 1.5,
                    height: 40,
                    displayValue: false,
                    background: 'transparent',
                    lineColor: settings.lineColor || "#000000",
                });
            } catch (e) {
                console.error("Barcode generation error:", e);
            }
        }
    }, [product.sku, settings]);

    if (!settings) return null;

    return (
        <div className="flex-1 text-center flex flex-col justify-between border border-gray-300 rounded-lg p-2">
            <div>
                <div className="flex justify-between items-baseline">
                    {settings.showName && (
                        <span className={`text-sm truncate pr-2 ${settings.nameBold ? 'font-bold' : ''}`}>{product.name}</span>
                    )}
                    {settings.showPrice && (
                        <span className={`text-xl ${settings.priceBold ? 'font-black' : 'font-bold'}`}>
                            {product.price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                    )}
                </div>
                 {settings.showPrice && product.originalPrice && (
                    <p className="text-right text-xs text-gray-500 mt-0 line-through">
                        ปกติ {product.originalPrice.toLocaleString()}
                    </p>
                )}
            </div>
            <div className="w-full h-[40px] mt-1">
                <svg ref={barcodeRef} className="w-full h-full"></svg>
            </div>
            {settings.showSku && (
                <p className="text-xs font-mono mt-1">{product.sku}</p>
            )}
        </div>
    );
};

const MultiProductBarcodeLabel = ({ products }) => {
    if (!products || products.length === 0) return null;

    return (
        <div className="flex justify-around gap-2 bg-white break-inside-avoid text-black">
            {products.map((p, index) => (
                <BarcodeItem key={`${p.id}-${index}`} product={p} />
            ))}
        </div>
    );
};

export default MultiProductBarcodeLabel;