import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, UploadCloud, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JsBarcode from 'jsbarcode';
import { showError, showInput } from '@/utils/sweetalert';

const ProductDialog = ({ isOpen, onClose, onSave, product, categories }) => {
  const [formData, setFormData] = useState({
    name: '', sku: '', category: '', price: '', cost: '', stock: '', description: '', image: null, originalPrice: '',
    sizes: [], colors: []
  });
  const [newImage, setNewImage] = useState(null); // รูปภาพใหม่ที่เลือก

  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const barcodeRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (product) {
      console.log('🔍 ProductDialog - Loading product data:', product);
      setFormData({
        name: product.name || '',
        sku: product.sku || product.barcode || '', // แก้ไข: ใช้ barcode ถ้า sku ไม่มี
        category: product.category || (categories[0] || ''),
        price: product.price || '',
        cost: product.cost || '',
        stock: product.stock || '',
        description: product.description || '',
        image: product.image_url || null,
        originalPrice: product.original_price || product.originalPrice || '', // แก้ไข: รองรับทั้ง 2 format
        sizes: Array.isArray(product.sizes) ? product.sizes : (product.sizes ? JSON.parse(product.sizes) : []),
        colors: Array.isArray(product.colors) ? product.colors : (product.colors ? JSON.parse(product.colors) : [])
      });
    } else {
      setFormData({
        name: '', sku: '', category: categories[0] || '', price: '', cost: '', stock: '', description: '', image: null, originalPrice: '',
        sizes: [], colors: []
      });
    }

    setNewSize('');
    setNewColor('');
    setNewImage(null); // Reset รูปภาพใหม่
  }, [product, isOpen]); // แก้ไข: ลบ categories ออกจาก dependency

  // useEffect แยกสำหรับ categories เพื่อไม่ให้รีเซ็ตฟอร์ม
  useEffect(() => {
    if (!product && categories.length > 0 && !formData.category) {
      setFormData(prev => ({
        ...prev,
        category: categories[0]
      }));
    }
  }, [categories, product, formData.category]);

  useEffect(() => {
    if (barcodeRef.current && formData.sku) {
      try {
        JsBarcode(barcodeRef.current, formData.sku, {
          format: "CODE128", displayValue: true, fontSize: 16, width: 2, height: 80, margin: 10
        });
      } catch (e) {
        console.error("Barcode generation error:", e);
      }
    }
  }, [formData.sku, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      showError('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกชื่อสินค้า');
      return;
    }
    
    if (!formData.sku.trim()) {
      showError('ข้อมูลไม่ครบถ้วน', 'กรุณากรอก SKU');
      return;
    }
    
    if (!formData.category) {
      showError('ข้อมูลไม่ครบถ้วน', 'กรุณาเลือกหมวดหมู่');
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      showError('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกราคาสินค้า');
      return;
    }
    
    onSave({
      ...formData,
      price: parseFloat(formData.price) || 0,
      originalPrice: parseFloat(formData.originalPrice) || null,
      cost: parseFloat(formData.cost) || 0,
      stock: parseInt(formData.stock) || 0,
      newImage: newImage, // ส่งรูปภาพใหม่แยก
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file); // เก็บรูปภาพใหม่แยก
    }
  };



  const handleAddSize = () => {
    if (newSize.trim() !== '' && !formData.sizes.includes(newSize.trim())) {
      handleChange('sizes', [...formData.sizes, newSize.trim()]);
      setNewSize('');
    }
  };

  const handleRemoveSize = (sizeToRemove) => {
    handleChange('sizes', formData.sizes.filter(size => size !== sizeToRemove));
  };

  const handleAddColor = () => {
    if (newColor.trim() !== '' && !formData.colors.includes(newColor.trim())) {
      handleChange('colors', [...formData.colors, newColor.trim()]);
      setNewColor('');
    }
  };

  const handleRemoveColor = (colorToRemove) => {
    handleChange('colors', formData.colors.filter(color => color !== colorToRemove));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg"><Package className="w-5 h-5 text-blue-600" /></div>
                <h2 className="text-xl font-semibold text-gray-900">{product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">รูปภาพสินค้า</label>
                  <div className="mt-1 flex justify-center items-center w-full h-48 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-center cursor-pointer relative" onClick={() => fileInputRef.current.click()}>
                    {newImage || formData.image ? (
                      <>
                        {newImage ? (
                          <img src={URL.createObjectURL(newImage)} alt="Preview" className="w-full h-full object-cover rounded-lg"/>
                        ) : (
                          <img src={formData.image} alt="Preview" className="w-full h-full object-cover rounded-lg"/>
                        )}
                        <Button type="button" size="icon" variant="destructive" className="absolute top-2 right-2 w-8 h-8" onClick={(e) => {e.stopPropagation(); setNewImage(null);}}>
                          <Trash className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="text-gray-500">
                        <UploadCloud className="mx-auto h-12 w-12"/>
                        <p className="mt-2 text-sm">คลิกเพื่ออัปโหลด</p>
                        <p className="text-xs">PNG, JPG, GIF</p>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageChange}/>
                  </div>
                </div>
                <div className="space-y-4 md:col-span-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อสินค้า *</label>
                    <input type="text" required value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="ระบุชื่อสินค้า"/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
                      <input type="text" required value={formData.sku} onChange={(e) => handleChange('sku', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="รหัสสินค้า"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่ *</label>
                      <select required value={formData.category} onChange={(e) => handleChange('category', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">เลือกหมวดหมู่</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {categories.length === 0 && (
                        <p className="text-sm text-orange-600 mt-1">
                          ⚠️ ไม่มีหมวดหมู่ กรุณาไปที่ ตั้งค่า → หมวดหมู่ เพื่อเพิ่มหมวดหมู่ใหม่
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ราคาขาย (฿) *</label>
                      <input type="number" min="0" step="0.01" required value={formData.price} onChange={(e) => handleChange('price', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="0.00"/>
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ราคาปกติ (฿)</label>
                      <input type="number" min="0" step="0.01" value={formData.originalPrice} onChange={(e) => handleChange('originalPrice', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="ไม่บังคับ"/>
                    </div>
                  </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนสต็อก *</label>
                      <input type="number" min="0" required value={formData.stock} onChange={(e) => handleChange('stock', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="0"/>
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ราคาทุน (฿)</label>
                      <input type="number" min="0" step="0.01" value={formData.cost} onChange={(e) => handleChange('cost', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="0.00"/>
                    </div>
                   </div>

                   {/* ขนาด */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">ขนาด</label>
                     <div className="space-y-2">
                       <div className="flex items-center space-x-2">
                         <input 
                           type="text" 
                           value={newSize} 
                           onChange={(e) => setNewSize(e.target.value)}
                           onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSize())}
                           className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                           placeholder="เพิ่มขนาด เช่น S, M, L, XL"
                         />
                         <Button type="button" onClick={handleAddSize} className="px-4 py-2">เพิ่ม</Button>
                       </div>
                       {formData.sizes.length > 0 && (
                         <div className="flex flex-wrap gap-2">
                           {formData.sizes.map((size, index) => (
                             <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                               {size}
                               <button
                                 type="button"
                                 onClick={() => handleRemoveSize(size)}
                                 className="ml-2 text-blue-600 hover:text-blue-800"
                               >
                                 ×
                               </button>
                             </span>
                           ))}
                         </div>
                       )}
                     </div>
                   </div>

                   {/* สี */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">สี</label>
                     <div className="space-y-2">
                       <div className="flex items-center space-x-2">
                         <input 
                           type="text" 
                           value={newColor} 
                           onChange={(e) => setNewColor(e.target.value)}
                           onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddColor())}
                           className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                           placeholder="เพิ่มสี เช่น แดง, น้ำเงิน, ดำ"
                         />
                         <Button type="button" onClick={handleAddColor} className="px-4 py-2">เพิ่ม</Button>
                       </div>
                       {formData.colors.length > 0 && (
                         <div className="flex flex-wrap gap-2">
                           {formData.colors.map((color, index) => (
                             <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                               {color}
                               <button
                                 type="button"
                                 onClick={() => handleRemoveColor(color)}
                                 className="ml-2 text-green-600 hover:text-green-800"
                               >
                                 ×
                               </button>
                             </span>
                           ))}
                         </div>
                       )}
                     </div>
                   </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียด</label>
                <textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="รายละเอียดสินค้า (ไม่บังคับ)"/>
              </div>

              {formData.sku && (<div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">บาร์โค้ด (SKU: {formData.sku})</label>
                <div className="bg-gray-50 p-4 rounded-lg flex justify-center">
                  <svg ref={barcodeRef}></svg>
                </div>
              </div>)}

              <div className="flex space-x-3 pt-6">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">ยกเลิก</Button>
                <Button type="submit" className="flex-1">{product ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductDialog;