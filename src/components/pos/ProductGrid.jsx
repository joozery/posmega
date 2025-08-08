import React from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

const ProductCard = ({ product, onAddToCart }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`bg-white rounded-xl p-3 sm:p-4 shadow-sm border card-hover cursor-pointer flex flex-col relative ${product.stock <= 0 ? 'opacity-50' : ''}`}
        onClick={() => onAddToCart(product)}
    >
        {product.stock <= 0 && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-xl z-10">
                <span className="font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">สินค้าหมด</span>
            </div>
        )}
        <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
            {product.image_url ? (
                <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
            ) : (
                <Package className="w-1/2 h-1/2 text-gray-300" />
            )}
            <Package className="w-1/2 h-1/2 text-gray-300" style={{ display: 'none' }} />
        </div>
        <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2 flex-grow">{product.name}</h3>
        <div className="flex items-end justify-between mt-2">
            <p className="text-base sm:text-lg font-bold text-blue-600">฿{product.price.toLocaleString()}</p>
            <p className="text-xs text-gray-500">เหลือ {product.stock}</p>
        </div>
    </motion.div>
);

const ProductGrid = ({ products, onAddToCart }) => {
    if (products.length === 0) {
        return (
            <div className="text-center py-16">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบสินค้า</h3>
                <p className="text-gray-500">ลองค้นหาด้วยคำอื่นหรือเปลี่ยนหมวดหมู่</p>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
        </div>
    );
};

export default ProductGrid;