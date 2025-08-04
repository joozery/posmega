import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth, PERMISSIONS } from '@/hooks/useAuth';
import sendLineMessage from '@/utils/lineNotify';

export const usePos = () => {
    const { toast } = useToast();
    const { hasPermission } = useAuth();
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [cart, setCart] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const loadData = useCallback(() => {
        const savedProducts = localStorage.getItem('pos_products');
        setProducts(savedProducts ? JSON.parse(savedProducts) : []);

        const savedCustomers = localStorage.getItem('pos_customers');
        setCustomers(savedCustomers ? JSON.parse(savedCustomers) : []);
        
        const savedSettings = localStorage.getItem('pos_settings');
        const parsedSettings = savedSettings ? JSON.parse(savedSettings) : {};
        setCategories(parsedSettings.categories || ['เสื้อผ้า', 'รองเท้า', 'กระเป๋า', 'เครื่องประดับ']);
    }, []);

    useEffect(() => {
        loadData();
        window.addEventListener('storage', loadData);
        window.addEventListener('settings_updated', loadData);
        return () => {
            window.removeEventListener('storage', loadData);
            window.removeEventListener('settings_updated', loadData);
        };
    }, [loadData]);

    const addToCart = useCallback((product) => {
        if (!hasPermission(PERMISSIONS.POS_ADD_TO_CART)) {
            toast({ title: "ไม่มีสิทธิ์", description: "คุณไม่มีสิทธิ์ในการเพิ่มสินค้าลงตะกร้า", variant: "destructive" });
            return;
        }
        
        if (product.stock <= 0) {
            toast({ title: "สินค้าหมด", description: `${product.name} ไม่มีในสต็อกแล้ว`, variant: "destructive" });
            return;
        }
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                if (existingItem.quantity < product.stock) {
                    return prevCart.map(item =>
                        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                    );
                } else {
                    toast({ title: "สต็อกไม่พอ", description: `มี ${product.name} ในสต็อกแค่ ${product.stock} ชิ้น`, variant: "destructive" });
                    return prevCart;
                }
            } else {
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    }, [toast, hasPermission]);

    const removeFromCart = useCallback((id) => {
        setCart(prevCart => prevCart.filter(item => item.id !== id));
    }, []);

    const updateQuantity = useCallback((id, newQuantity) => {
        const productInStock = products.find(p => p.id === id);
        
        if (newQuantity <= 0) {
            removeFromCart(id);
            return;
        }
        
        if (productInStock && newQuantity > productInStock.stock) {
            toast({ title: "สต็อกไม่พอ", description: `มี ${productInStock.name} ในสต็อกแค่ ${productInStock.stock} ชิ้น`, variant: "destructive" });
            newQuantity = productInStock.stock;
        }

        setCart(prevCart =>
            prevCart.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );
    }, [products, toast, removeFromCart]);

    const processSale = useCallback((paymentMethod, discountInfo = { pointsUsed: 0, discountAmount: 0 }) => {
        if (!hasPermission(PERMISSIONS.POS_PROCESS_SALE)) {
            toast({ title: "ไม่มีสิทธิ์", description: "คุณไม่มีสิทธิ์ในการประมวลผลการขาย", variant: "destructive" });
            return null;
        }
        
        if (cart.length === 0) return null;
        
        const settings = JSON.parse(localStorage.getItem('pos_settings') || '{}');
        const taxRate = parseFloat(settings?.system?.taxRate || 7) / 100;
        const loyaltySettings = settings?.loyalty || { purchaseAmountForOnePoint: 100, onePointValueInBaht: 1 };

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalAfterDiscount = subtotal - discountInfo.discountAmount;
        const tax = totalAfterDiscount * taxRate;
        const total = totalAfterDiscount + tax;

        let pointsEarned = 0;
        let finalLoyaltyPoints = selectedCustomer ? (selectedCustomer.loyaltyPoints || 0) : 0;
        
        if(selectedCustomer) {
            pointsEarned = loyaltySettings.purchaseAmountForOnePoint > 0 
                ? Math.floor(total / loyaltySettings.purchaseAmountForOnePoint) 
                : 0;

            const currentCustomers = JSON.parse(localStorage.getItem('pos_customers') || '[]');
            const updatedCustomers = currentCustomers.map(c => {
                if (c.id === selectedCustomer.id) {
                    const newPoints = (c.loyaltyPoints || 0) - discountInfo.pointsUsed + pointsEarned;
                    finalLoyaltyPoints = newPoints;
                    return { 
                        ...c, 
                        totalPurchases: (c.totalPurchases || 0) + total, 
                        lastPurchase: new Date().toISOString().split('T')[0],
                        loyaltyPoints: newPoints
                    };
                }
                return c;
            });
            setCustomers(updatedCustomers);
            localStorage.setItem('pos_customers', JSON.stringify(updatedCustomers));
        }

        const sale = {
            id: `SALE-${Date.now()}`,
            items: cart,
            subtotal,
            discount: discountInfo.discountAmount,
            tax,
            total,
            paymentMethod,
            timestamp: new Date().toISOString(),
            customer: selectedCustomer ? selectedCustomer.name : 'ลูกค้าทั่วไป',
            customerId: selectedCustomer ? selectedCustomer.id : null,
            pointsUsed: discountInfo.pointsUsed,
            pointsEarned: pointsEarned,
            finalLoyaltyPoints: finalLoyaltyPoints
        };

        const existingSales = JSON.parse(localStorage.getItem('pos_sales') || '[]');
        localStorage.setItem('pos_sales', JSON.stringify([sale, ...existingSales]));

        const currentProducts = JSON.parse(localStorage.getItem('pos_products') || '[]');
        const updatedProducts = currentProducts.map(p => {
            const itemInCart = cart.find(item => item.id === p.id);
            if (itemInCart) {
                return { ...p, stock: p.stock - itemInCart.quantity };
            }
            return p;
        });
        setProducts(updatedProducts);
        localStorage.setItem('pos_products', JSON.stringify(updatedProducts));

        if (settings?.notifications?.notifyOnSale && settings?.notifications?.lineChannelAccessToken && settings?.notifications?.lineUserId) {
            const saleMessage = `
ยอดขายใหม่: ${sale.total.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
ลูกค้า: ${sale.customer}
สินค้า: ${sale.items.length} รายการ
ชำระโดย: ${sale.paymentMethod}`;
            sendLineMessage(saleMessage);
        }

        window.dispatchEvent(new Event('storage'));
        setCart([]);
        setSelectedCustomer(null);
        return sale;
    }, [cart, selectedCustomer]);

    const handleSaveCustomer = useCallback((customerData) => {
        if (!hasPermission(PERMISSIONS.CUSTOMERS_CREATE)) {
            toast({ title: "ไม่มีสิทธิ์", description: "คุณไม่มีสิทธิ์ในการเพิ่มลูกค้า", variant: "destructive" });
            return;
        }
        
        const newCustomer = { 
            ...customerData, 
            id: Date.now(),
            totalPurchases: 0,
            lastPurchase: null,
            joinDate: new Date().toISOString().split('T')[0],
            loyaltyPoints: 0
        };
        const updatedCustomers = [...customers, newCustomer];
        setCustomers(updatedCustomers);
        localStorage.setItem('pos_customers', JSON.stringify(updatedCustomers));
        setSelectedCustomer(newCustomer);
        toast({ title: "เพิ่มลูกค้าสำเร็จ", description: `${newCustomer.name} ถูกเลือกสำหรับออเดอร์นี้` });
    }, [customers, toast, hasPermission]);

    return {
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
        handleSaveCustomer
    };
};