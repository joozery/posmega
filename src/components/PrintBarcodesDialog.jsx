import React, { useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import { X, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BarcodeSheet from '@/components/BarcodeSheet';

const PrintBarcodesDialog = ({ isOpen, onClose, selectedProducts, products, columns }) => {
    const componentRef = useRef();

    const labelsToPrint = useMemo(() => {
        if (!isOpen) return [];
        const allLabels = [];
        const productMap = products.reduce((map, p) => {
            map[p.id] = p;
            return map;
        }, {});

        for (const productId in selectedProducts) {
            const product = productMap[productId];
            const quantity = selectedProducts[productId];
            if (product) {
                for (let i = 0; i < quantity; i++) {
                    allLabels.push(product);
                }
            }
        }
        return allLabels;
    }, [isOpen, selectedProducts, products]);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: 'Barcode-Labels',
        pageStyle: `
          @page {
            size: A4;
            margin: 0.3cm;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print\\:space-y-0 > * + * {
              margin-top: 0 !important;
            }
            .print\\:gap-0 {
              gap: 0 !important;
            }
            .print\\:p-0\\.5 {
              padding: 0.125rem !important;
            }
            .print\\:mt-0\\.5 {
              margin-top: 0.125rem !important;
            }
            .barcode-print-container {
              page-break-inside: avoid;
            }
            .barcode-row {
              page-break-inside: avoid;
              margin-bottom: 0 !important;
            }
            .barcode-item {
              page-break-inside: avoid;
              break-inside: avoid;
            }
          }
        `,
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
                        className="relative bg-gray-100 rounded-xl shadow-xl w-full max-w-4xl mx-4 flex flex-col max-h-[90vh]"
                    >
                        <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-xl flex-shrink-0">
                            <h2 className="text-xl font-semibold text-gray-900">ตัวอย่างก่อนพิมพ์</h2>
                            <div className="flex items-center space-x-2">
                                <Button onClick={handlePrint} size="sm">
                                    <Printer className="w-4 h-4 mr-2" />
                                    พิมพ์ ({labelsToPrint.length} ป้าย)
                                </Button>
                                <Button variant="ghost" size="icon" onClick={onClose}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6 overflow-y-auto">
                            <div ref={componentRef}>
                                <BarcodeSheet labels={labelsToPrint} columns={columns} />
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PrintBarcodesDialog;