import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  AlertTriangle,
  Filter,
  Image as ImageIcon,
  Barcode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ProductDialog from '@/components/ProductDialog';
import { usePos } from '@/hooks/usePos';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const { categories: posCategories } = usePos();

  useEffect(() => {
    const savedProducts = localStorage.getItem('pos_products');
    setProducts(savedProducts ? JSON.parse(savedProducts) : []);
    setCategories(posCategories);
  }, [posCategories]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'ทั้งหมด' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const updateAndSaveProducts = (updatedProducts) => {
      setProducts(updatedProducts);
      localStorage.setItem('pos_products', JSON.stringify(updatedProducts));
      window.dispatchEvent(new Event('storage'));
  }

  const updateAndSaveCategories = (updatedCategories) => {
    setCategories(updatedCategories);
    localStorage.setItem('pos_categories', JSON.stringify(updatedCategories));
    window.dispatchEvent(new Event('storage'));
  }
  
  const handleAddCategory = (newCategory) => {
      if (!categories.includes(newCategory)) {
          const updated = [...categories, newCategory];
          updateAndSaveCategories(updated);
          toast({ title: 'เพิ่มหมวดหมู่สำเร็จ', description: `หมวดหมู่ "${newCategory}" ถูกเพิ่มแล้ว`});
      }
  }

  const saveProduct = (productData) => {
    let updatedProducts;
    
    if (editingProduct) {
      updatedProducts = products.map(p => 
        p.id === editingProduct.id ? { ...editingProduct, ...productData } : p
      );
      toast({ title: "แก้ไขสินค้าสำเร็จ", description: `${productData.name} ถูกแก้ไขแล้ว` });
    } else {
      const newProduct = { ...productData, id: Date.now() };
      updatedProducts = [...products, newProduct];
      toast({ title: "เพิ่มสินค้าสำเร็จ", description: `${productData.name} ถูกเพิ่มแล้ว` });
    }
    
    updateAndSaveProducts(updatedProducts);
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const deleteProduct = (id) => {
    const updatedProducts = products.filter(p => p.id !== id);
    updateAndSaveProducts(updatedProducts);
    toast({ title: "ลบสินค้าสำเร็จ", description: "สินค้าถูกลบออกจากระบบแล้ว", variant: 'destructive' });
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const addNewProduct = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const lowStockProducts = products.filter(p => p.stock <= 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการสินค้า</h1>
          <p className="text-gray-600 mt-1">จัดการข้อมูลสินค้าและสต็อก</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/barcodes')}>
            <Barcode className="w-4 h-4 mr-2" />
            พิมพ์บาร์โค้ด
          </Button>
          <Button onClick={addNewProduct}>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มสินค้าใหม่
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 shadow-sm border">
          <Package className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="text-2xl font-bold text-gray-900">{products.length}</h3>
          <p className="text-gray-600 text-sm mt-1">สินค้าทั้งหมด</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-6 shadow-sm border">
          <AlertTriangle className="w-8 h-8 text-orange-600 mb-3" />
          <h3 className="text-2xl font-bold text-gray-900">{lowStockProducts.length}</h3>
          <p className="text-gray-600 text-sm mt-1">สต็อกต่ำ</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl p-6 shadow-sm border">
          <Filter className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="text-2xl font-bold text-gray-900">{categories.length}</h3>
          <p className="text-gray-600 text-sm mt-1">หมวดหมู่</p>
        </motion.div>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="ค้นหาสินค้าหรือ SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {['ทั้งหมด', ...categories].map((category) => (
              <Button key={category} variant={selectedCategory === category ? "default" : "outline"} onClick={() => setSelectedCategory(category)} className="whitespace-nowrap">{category}</Button>
            ))}
          </div>
        </div>
      </div>
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="py-4 px-6"></th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">สินค้า</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">SKU</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">หมวดหมู่</th>
                <th className="text-right py-4 px-6 font-medium text-gray-900">ราคาขาย</th>
                <th className="text-center py-4 px-6 font-medium text-gray-900">สต็อก</th>
                <th className="text-center py-4 px-6 font-medium text-gray-900">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-6">
                    <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                      {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover"/> : <ImageIcon className="w-6 h-6 text-gray-400"/>}
                    </div>
                  </td>
                  <td className="py-4 px-6"><p className="font-medium text-gray-900">{product.name}</p></td>
                  <td className="py-4 px-6 text-gray-600">{product.sku}</td>
                  <td className="py-4 px-6"><span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">{product.category}</span></td>
                  <td className="py-4 px-6 text-right font-medium text-gray-900">฿{product.price.toLocaleString()}</td>
                  <td className="py-4 px-6 text-center"><span className={`font-medium ${product.stock <= 10 ? 'text-red-600' : product.stock <= 20 ? 'text-orange-600' : 'text-green-600'}`}>{product.stock}</span></td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => editProduct(product)}><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline" onClick={() => deleteProduct(product.id)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="lg:hidden space-y-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border p-4 flex space-x-4">
            <div className="w-20 h-20 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
               {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover"/> : <ImageIcon className="w-8 h-8 text-gray-400"/>}
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => editProduct(product)}><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="outline" className="w-8 h-8 text-red-600 hover:text-red-700" onClick={() => deleteProduct(product.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-500">ราคาขาย</p>
                  <p className="font-medium text-gray-800">฿{product.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">สต็อก</p>
                  <p className={`font-medium ${product.stock <= 10 ? 'text-red-600' : 'text-green-600'}`}>{product.stock}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">หมวดหมู่</p>
                  <p className="font-medium text-gray-800 truncate">{product.category}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ProductDialog 
        isOpen={isDialogOpen} 
        onClose={() => { setIsDialogOpen(false); setEditingProduct(null); }} 
        onSave={saveProduct} 
        product={editingProduct} 
        categories={categories}
        onAddCategory={handleAddCategory}
      />
    </div>
  );
};

export default Products;