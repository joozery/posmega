import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { usePos } from '@/hooks/usePos';
import PosHeader from '@/components/pos/PosHeader';
import ProductGrid from '@/components/pos/ProductGrid';
import CartPanel from '@/components/pos/CartPanel';
import CustomerDialog from '@/components/CustomerDialog';
import ReceiptDialog from '@/components/ReceiptDialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const POS = () => {
  const { toast } = useToast();
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
  } = usePos();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const searchInputRef = useRef(null);

  const handleProcessSale = useCallback((paymentMethod, discountInfo) => {
    const saleData = processSale(paymentMethod, discountInfo);
    if(saleData) {
        setLastSale(saleData);
        setIsCartVisible(false);
    }
    return saleData;
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
                handleProcessSale('Stripe', discountInfo);
                localStorage.removeItem('pending_checkout_cart');
                localStorage.removeItem('pending_checkout_customer');
                localStorage.removeItem('pending_checkout_discount');
                toast({ title: "ชำระเงินผ่าน Stripe สำเร็จ!", description: "บันทึกการขายเรียบร้อย" });
            }, 0);
        }
    } else if (query.get("stripe_session") === "cancel") {
        localStorage.removeItem('pending_checkout_cart');
        localStorage.removeItem('pending_checkout_customer');
        localStorage.removeItem('pending_checkout_discount');
        toast({ title: "การชำระเงินถูกยกเลิก", description: "คุณสามารถลองชำระเงินอีกครั้งได้", variant: "destructive" });
    }
    
    if(query.has("stripe_session")){
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    }
  }, [setCart, setSelectedCustomer, handleProcessSale, toast]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'ทั้งหมด' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  const handleOpenCustomerDialog = () => setIsCustomerDialogOpen(true);
  
  const handleInternalSaveCustomer = (customerData) => {
    handleSaveCustomer(customerData);
    setIsCustomerDialogOpen(false);
  }

  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="h-full">
        <div className="h-full flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex flex-col min-h-0">
                <PosHeader
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    categories={['ทั้งหมด', ...categories]}
                    searchInputRef={searchInputRef}
                />
                <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 -mr-2 pb-20 lg:pb-0">
                    <ProductGrid products={filteredProducts} onAddToCart={addToCart} />
                </div>
            </div>

            <div className="hidden lg:block lg:w-[380px] xl:w-[420px] flex-shrink-0">
                <CartPanel
                    cart={cart}
                    customers={customers}
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
            {cart.length > 0 && (
                <div className="fixed bottom-6 right-6 z-40">
                    <Button
                        size="lg"
                        className="rounded-full shadow-lg h-16 w-16 flex items-center justify-center relative"
                        onClick={() => setIsCartVisible(true)}
                    >
                        <ShoppingCart className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                            {totalItemsInCart}
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
                                cart={cart}
                                customers={customers}
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
    </div>
  );
};

export default POS;