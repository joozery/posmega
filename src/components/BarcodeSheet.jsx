import React from 'react';
import MultiProductBarcodeLabel from './MultiProductBarcodeLabel';

const BarcodeSheet = React.forwardRef(({ labels, columns = 4 }, ref) => {
    const chunk = (arr, size) =>
        Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
            arr.slice(i * size, i * size + size)
        );

    const labelChunks = chunk(labels, columns);

    return (
        <div ref={ref} className="bg-white p-1 print:p-0 barcode-print-container">
            <div className="space-y-1 print:space-y-0">
                {labelChunks.map((chunk, index) => (
                    <MultiProductBarcodeLabel key={index} products={chunk} />
                ))}
            </div>
        </div>
    );
});

export default BarcodeSheet;