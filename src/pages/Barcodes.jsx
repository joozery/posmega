import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Barcode, Printer, Search, Image as ImageIcon } from 'lucide-react';
import PrintBarcodesDialog from '@/components/PrintBarcodesDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { productService } from '@/services/productService';
import { showError, showLoading, closeLoading } from '@/utils/sweetalert';

const Barcodes = () => {
    const { toast } = useToast();
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
    const [columns, setColumns] = useState(4);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            showLoading('กำลังโหลดข้อมูลสินค้า...');
            
            const response = await productService.getAllProducts();
            const productsArray = response.products || [];
            setProducts(productsArray);
            
            closeLoading();
        } catch (error) {
            console.error('Error loading products:', error);
            setError('ไม่สามารถโหลดข้อมูลสินค้าได้');
            closeLoading();
            showError('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลสินค้าได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSelectProduct = (productId, checked) => {
        setSelectedProducts(prev => {
            const newSelection = { ...prev };
            if (checked) {
                if (!newSelection[productId]) {
                    newSelection[productId] = 1;
                }
            } else {
                delete newSelection[productId];
            }
            return newSelection;
        });
    };

    const handleQuantityChange = (productId, quantity) => {
        const numQuantity = parseInt(quantity, 10);
        if (numQuantity > 0) {
            setSelectedProducts(prev => ({
                ...prev,
                [productId]: numQuantity
            }));
        }
    };
    
    const handleSelectAll = (checked) => {
        if (checked) {
            const allSelected = filteredProducts.reduce((acc, product) => {
                acc[product.id] = 1;
                return acc;
            }, {});
            setSelectedProducts(allSelected);
        } else {
            setSelectedProducts({});
        }
    };

    const handleGenerateClick = () => {
        if (Object.keys(selectedProducts).length === 0) {
            toast({
                title: "ยังไม่ได้เลือกสินค้า",
                description: "กรุณาเลือกสินค้าที่ต้องการพิมพ์บาร์โค้ด",
                variant: "destructive"
            });
            return;
        }
        setIsPrintDialogOpen(true);
    };

    const isAllSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedProducts[p.id]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">พิมพ์บาร์โค้ด</h1>
                    <p className="text-gray-600 mt-1">เลือกสินค้าเพื่อสร้างและพิมพ์ป้ายบาร์โค้ด</p>
                </div>
                <Button onClick={handleGenerateClick} disabled={Object.keys(selectedProducts).length === 0}>
                    <Printer className="w-4 h-4 mr-2" />
                    สร้างและพิมพ์ ({Object.values(selectedProducts).reduce((a, b) => a + b, 0)} ป้าย)
                </Button>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="ค้นหาสินค้า..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div className="w-full md:w-auto">
                    <Select value={String(columns)} onValueChange={(val) => setColumns(Number(val))}>
                        <SelectTrigger className="w-full md:w-[220px]">
                            <SelectValue placeholder="จำนวนสินค้าต่อแถว" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="3">3 สินค้า / แถว</SelectItem>
                            <SelectItem value="4">4 สินค้า / แถว</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="py-4 px-6 w-12">
                                    <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
                                </th>
                                <th className="py-4 px-6 w-20"></th>
                                <th className="text-left py-4 px-6 font-medium text-gray-900">สินค้า</th>
                                <th className="text-left py-4 px-6 font-medium text-gray-900">Barcode</th>
                                <th className="text-right py-4 px-6 font-medium text-gray-900">ราคา</th>
                                <th className="text-center py-4 px-6 font-medium text-gray-900 w-40">จำนวนป้าย</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className={`transition-colors ${selectedProducts[product.id] ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                    <td className="py-2 px-6">
                                        <Checkbox
                                            checked={!!selectedProducts[product.id]}
                                            onCheckedChange={(checked) => handleSelectProduct(product.id, checked)}
                                        />
                                    </td>
                                    <td className="py-2 px-6">
                                        <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-gray-400" />}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 font-medium text-gray-900">{product.name}</td>
                                    <td className="py-4 px-6 text-gray-600">{product.barcode || '-'}</td>
                                    <td className="py-4 px-6 text-right font-medium text-gray-900">฿{product.price.toLocaleString()}</td>
                                    <td className="py-4 px-6">
                                        {selectedProducts[product.id] && (
                                            <input
                                                type="number"
                                                min="1"
                                                value={selectedProducts[product.id] || 1}
                                                onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                                className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <PrintBarcodesDialog
                isOpen={isPrintDialogOpen}
                onClose={() => setIsPrintDialogOpen(false)}
                selectedProducts={selectedProducts}
                products={products}
                columns={columns}
            />
        </div>
    );
};

export default Barcodes;