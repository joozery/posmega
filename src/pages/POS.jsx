import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { usePos } from '@/hooks/usePos';
import { useAuth, PERMISSIONS } from '@/hooks/useAuth';
import PosHeader from '@/components/pos/PosHeader';
import ProductGrid from '@/components/pos/ProductGrid';
import CartPanel from '@/components/pos/CartPanel';
import CustomerDialog from '@/components/CustomerDialog';
import ReceiptDialog from '@/components/ReceiptDialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Shield, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccessToast, showErrorToast } from '@/utils/sweetalert';
import { categoriesService } from '@/services/categoriesService';

const POS = () => {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const {
    products,
    customers,
    categories,
    cart,
    setCart,
    selectedCustomer,
    setSelectedCustomer,
    addToCart,
    updateQuantity,
    removeFromCart,
    processSale,
    handleSaveCustomer,
    loading,
    error,
  } = usePos();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [productCategories, setProductCategories] = useState(['ทั้งหมด']);
  const searchInputRef = useRef(null);

  // โหลดหมวดหมู่สินค้าจาก API
  const loadProductCategories = useCallback(async () => {
    try {
      console.log('🔄 Loading product categories from Categories API...');
      const response = await categoriesService.getAllCategories(true); // active only
      console.log('✅ Categories response:', response);
      
      if (response && Array.isArray(response.categories)) {
        // แปลงเป็น array ของชื่อหมวดหมู่
        const categoryNames = response.categories.map(cat => cat.name);
        const allCategories = ['ทั้งหมด', ...categoryNames];
        setProductCategories(allCategories);
        console.log('✅ Product categories loaded:', allCategories);
      } else {
        console.log('⚠️ No categories found in response, using fallback');
        setProductCategories(['ทั้งหมด', 'เสื้อผ้า', 'รองเท้า', 'กระเป๋า', 'เครื่องประดับ']);
      }
    } catch (error) {
      console.error('❌ Error loading product categories:', error);
      // ใช้ fallback categories
      setProductCategories(['ทั้งหมด', 'เสื้อผ้า', 'รองเท้า', 'กระเป๋า', 'เครื่องประดับ']);
    }
  }, []);

  // โหลดหมวดหมู่เมื่อ component mount
  useEffect(() => {
    loadProductCategories();
  }, [loadProductCategories]);

  const handleProcessSale = useCallback(async (paymentMethod, discountInfo) => {
    try {
      console.log('Processing sale with:', { paymentMethod, discountInfo });
      const saleData = await processSale(paymentMethod, discountInfo);
      console.log('Sale data returned:', saleData);
      if(saleData) {
          setLastSale(saleData);
          setIsCartVisible(false);
          console.log('Sale processed successfully, lastSale set to:', saleData);
      } else {
          console.log('No sale data returned from processSale');
      }
      return saleData;
    } catch (error) {
      console.error('Error in handleProcessSale:', error);
      return null;
    }
  }, [processSale]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("stripe_session") === "success") {
        const pendingCart = JSON.parse(localStorage.getItem('pending_checkout_cart'));
        const pendingCustomer = JSON.parse(localStorage.getItem('pending_checkout_customer'));
        const pendingDiscount = JSON.parse(localStorage.getItem('pending_checkout_discount'));

        if (pendingCart) {
            setCart(pendingCart);
            setSelectedCustomer(pendingCustomer);
            
            const pointsToUse = pendingDiscount > 0 ? (pendingDiscount / (JSON.parse(localStorage.getItem('pos_settings') || '{}')?.loyalty?.onePointValueInBaht || 1)) : 0;
            const discountInfo = {
                pointsUsed: pointsToUse,
                discountAmount: pendingDiscount
            };

            setTimeout(() => {
                handleProcessSale('card', discountInfo);
                localStorage.removeItem('pending_checkout_cart');
                localStorage.removeItem('pending_checkout_customer');
                localStorage.removeItem('pending_checkout_discount');
                showSuccessToast('ชำระเงินผ่าน Stripe สำเร็จ! บันทึกการขายเรียบร้อย');
            }, 0);
        }
    } else if (query.get("stripe_session") === "cancel") {
        localStorage.removeItem('pending_checkout_cart');
        localStorage.removeItem('pending_checkout_customer');
        localStorage.removeItem('pending_checkout_discount');
        showErrorToast('การชำระเงินถูกยกเลิก คุณสามารถลองชำระเงินอีกครั้งได้');
    }
    
    if(query.has("stripe_session")){
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
  }, [setCart, setSelectedCustomer, handleProcessSale, toast]);

  // ตรวจสอบสิทธิ์การเข้าถึง POS
  if (!hasPermission(PERMISSIONS.POS_VIEW)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-gray-500">คุณไม่มีสิทธิ์ในการเข้าถึงระบบ POS</p>
        </div>
      </div>
    );
  }

  // แสดง loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">กำลังโหลดข้อมูล...</h2>
          <p className="text-gray-500">กรุณารอสักครู่</p>
        </div>
      </div>
    );
  }

  // แสดง error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>ลองใหม่</Button>
        </div>
      </div>
    );
  }

  const filteredProducts = (products || []).filter(product => {
    const matchesSearch = (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'ทั้งหมด' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  const handleOpenCustomerDialog = () => setIsCustomerDialogOpen(true);
  
  const handleInternalSaveCustomer = (customerData) => {
    handleSaveCustomer(customerData);
    setIsCustomerDialogOpen(false);
  }

  const totalItemsInCart = (cart || []).reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <div className="h-full">
        <div className="h-full flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex flex-col min-h-0">
                <PosHeader
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    categories={productCategories}
                    searchInputRef={searchInputRef}
                    onAddCustomer={handleOpenCustomerDialog}
                />
                <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 -mr-2 pb-20 lg:pb-0">
                    <ProductGrid products={filteredProducts || []} onAddToCart={addToCart} />
                </div>
            </div>

            <div className="hidden lg:block lg:w-[380px] xl:w-[420px] flex-shrink-0">
                <CartPanel
                    cart={cart || []}
                    customers={customers || []}
                    selectedCustomer={selectedCustomer}
                    onSelectCustomer={setSelectedCustomer}
                    onRemoveCustomer={() => setSelectedCustomer(null)}
                    onUpdateQuantity={updateQuantity}
                    onRemoveFromCart={removeFromCart}
                    onOpenCustomerDialog={handleOpenCustomerDialog}
                    onProcessSale={handleProcessSale}
                />
            </div>
        </div>

        <div className="lg:hidden">
            {(cart || []).length > 0 && (
                <div className="fixed bottom-6 right-6 z-40">
                    <Button
                        size="lg"
                        className="rounded-full shadow-lg h-16 w-16 flex items-center justify-center relative"
                        onClick={() => setIsCartVisible(true)}
                    >
                        <ShoppingCart className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                            {totalItemsInCart || 0}
                        </span>
                    </Button>
                </div>
            )}

            <AnimatePresence>
                {isCartVisible && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 z-40"
                            onClick={() => setIsCartVisible(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background z-50"
                        >
                            <CartPanel
                                cart={cart || []}
                                customers={customers || []}
                                selectedCustomer={selectedCustomer}
                                onSelectCustomer={setSelectedCustomer}
                                onRemoveCustomer={() => setSelectedCustomer(null)}
                                onUpdateQuantity={updateQuantity}
                                onRemoveFromCart={removeFromCart}
                                onOpenCustomerDialog={handleOpenCustomerDialog}
                                onProcessSale={handleProcessSale}
                                onClose={() => setIsCartVisible(false)}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>

        <CustomerDialog
            isOpen={isCustomerDialogOpen}
            onClose={() => setIsCustomerDialogOpen(false)}
            onSave={handleInternalSaveCustomer}
        />
        <ReceiptDialog
            isOpen={!!lastSale}
            onClose={() => setLastSale(null)}
            sale={lastSale}
        />
        {console.log('POS render - lastSale:', lastSale)}
        {console.log('POS render - lastSale type:', typeof lastSale)}
        {console.log('POS render - lastSale keys:', lastSale ? Object.keys(lastSale) : 'null')}
        {console.log('POS render - lastSale items:', lastSale?.items)}
        {console.log('POS render - lastSale total:', lastSale?.total)}
        {console.log('POS render - lastSale subtotal:', lastSale?.subtotal)}
        {console.log('POS render - lastSale created_by_name:', lastSale?.created_by_name)}
        {console.log('POS render - lastSale created_by:', lastSale?.created_by)}
        {console.log('POS render - ReceiptDialog isOpen:', !!lastSale)}
    </div>
  );
};

export default POS;