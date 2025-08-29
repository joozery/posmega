import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth, PERMISSIONS } from '@/hooks/useAuth';
import { productService } from '@/services/productService';
import { customerService } from '@/services/customerService';
import { settingsService } from '@/services/settingsService';
import sendLineMessage from '@/utils/lineNotify';
import { showError, showLoading, closeLoading } from '@/utils/sweetalert';

// Helper function to safely parse JSON strings
const parseJsonField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  try {
    return JSON.parse(field);
  } catch (error) {
    console.error('Error parsing JSON field:', error);
    return [];
  }
};

export const usePos = () => {
    const { toast } = useToast();
    const { hasPermission } = useAuth();
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [cart, setCart] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load data from API
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            showLoading('กำลังโหลดข้อมูล...');
            
            // Load products
            try {
                const productsResponse = await productService.getAllProducts();
                const productsArray = productsResponse.products || [];
                setProducts(productsArray);
            } catch (error) {
                console.error('Error loading products:', error);
                setProducts([]);
            }
            
            // Load customers
            try {
                const customersResponse = await customerService.getAllCustomers();
                const customersArray = customersResponse.customers || [];
                setCustomers(customersArray);
            } catch (error) {
                console.error('Error loading customers:', error);
                setCustomers([]);
            }
            
            // Load settings
            try {
                const settingsResponse = await settingsService.getAllSettings();
                const settings = settingsResponse.settings || {};
                console.log('✅ usePos - settings loaded:', settings);
                
                // บันทึกการตั้งค่าลง localStorage
                localStorage.setItem('pos_settings', JSON.stringify(settings));
                console.log('✅ usePos - settings saved to localStorage');
                
                // ใช้ categories จาก settings หรือ fallback
                const categoriesFromSettings = settings.categories || [];
                if (Array.isArray(categoriesFromSettings) && categoriesFromSettings.length > 0) {
                    setCategories(categoriesFromSettings);
                    console.log('✅ usePos - categories from settings:', categoriesFromSettings);
                } else {
                    // Fallback categories
                    const fallbackCategories = ['เสื้อผ้า', 'รองเท้า', 'กระเป๋า', 'เครื่องประดับ'];
                    setCategories(fallbackCategories);
                    console.log('⚠️ usePos - using fallback categories:', fallbackCategories);
                }
            } catch (error) {
                console.error('❌ Error loading settings:', error);
                // Fallback categories
                const fallbackCategories = ['เสื้อผ้า', 'รองเท้า', 'กระเป๋า', 'เครื่องประดับ'];
                setCategories(fallbackCategories);
                console.log('⚠️ usePos - using fallback categories due to error:', fallbackCategories);
            }
            
            closeLoading();
        } catch (error) {
            console.error('Error loading data:', error);
            setError('ไม่สามารถโหลดข้อมูลได้');
            closeLoading();
            showError('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const addToCart = useCallback((product) => {
        if (!hasPermission(PERMISSIONS.POS_ADD_TO_CART)) {
            toast({ title: "ไม่มีสิทธิ์", description: "คุณไม่มีสิทธิ์ในการเพิ่มสินค้าลงตะกร้า", variant: "destructive" });
            return;
        }
        
        if ((product.stock || 0) <= 0) {
            toast({ title: "สินค้าหมด", description: `${product.name || 'สินค้า'} ไม่มีในสต็อกแล้ว`, variant: "destructive" });
            return;
        }
        setCart(prevCart => {
            const existingItem = (prevCart || []).find(item => item.id === product.id);
            if (existingItem) {
                if ((existingItem.quantity || 0) < (product.stock || 0)) {
                    return (prevCart || []).map(item =>
                        item.id === product.id ? { ...item, quantity: (item.quantity || 0) + 1 } : item
                    );
                } else {
                    toast({ title: "สต็อกไม่พอ", description: `มี ${product.name || 'สินค้า'} ในสต็อกแค่ ${product.stock || 0} ชิ้น`, variant: "destructive" });
                    return prevCart || [];
                }
            } else {
                const newItem = { ...product, quantity: 1 };
                console.log('Adding new item to cart:', {
                    id: newItem.id,
                    name: newItem.name,
                    sizes: newItem.sizes,
                    colors: newItem.colors,
                    sku: newItem.sku,
                    category: newItem.category,
                    barcode: newItem.barcode
                });
                return [...(prevCart || []), newItem];
            }
        });
    }, [toast, hasPermission]);

    const removeFromCart = useCallback((id) => {
        setCart(prevCart => (prevCart || []).filter(item => item.id !== id));
    }, []);

    const updateQuantity = useCallback((id, newQuantity) => {
        const productInStock = (products || []).find(p => p.id === id);
        
        if (newQuantity <= 0) {
            removeFromCart(id);
            return;
        }
        
        if (productInStock && newQuantity > (productInStock.stock || 0)) {
            toast({ title: "สต็อกไม่พอ", description: `มี ${productInStock.name || 'สินค้า'} ในสต็อกแค่ ${productInStock.stock || 0} ชิ้น`, variant: "destructive" });
            newQuantity = productInStock.stock || 0;
        }

        setCart(prevCart =>
            (prevCart || []).map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            )
        );
    }, [products, toast, removeFromCart]);

    const processSale = useCallback(async (paymentMethod, discountInfo = { pointsUsed: 0, discountAmount: 0, excludeVAT: false }) => {
        if (!hasPermission(PERMISSIONS.POS_PROCESS_SALE)) {
            toast({ title: "ไม่มีสิทธิ์", description: "คุณไม่มีสิทธิ์ในการประมวลผลการขาย", variant: "destructive" });
            return null;
        }
        
        if (!cart || cart.length === 0) return null;
        
        try {
            showLoading('กำลังบันทึกการขาย...');
            
            // Get settings
            let settings = {};
            try {
                const settingsResponse = await settingsService.getAllSettings();
                settings = settingsResponse.settings || {};
                console.log('✅ usePos.processSale - settings loaded:', settings);
            } catch (error) {
                console.error('❌ Error loading settings in processSale:', error);
                settings = {};
            }
            
            const taxRate = parseFloat(settings?.system?.taxRate || 3) / 100;
            const loyaltySettings = settings?.loyalty || { purchaseAmountForOnePoint: 100, onePointValueInBaht: 1 };

            const subtotal = (cart || []).reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
            const totalAfterDiscount = subtotal - discountInfo.discountAmount;
            const tax = discountInfo.excludeVAT ? 0 : totalAfterDiscount * taxRate;
            const total = totalAfterDiscount + tax;

            let pointsEarned = 0;
            let finalLoyaltyPoints = selectedCustomer ? (selectedCustomer.loyaltyPoints || 0) : 0;
            
            // Create sale data
            const saleData = {
                customerId: selectedCustomer ? selectedCustomer.id : null,
                items: (cart || []).map(item => {
                    console.log('Creating sale item from cart item:', item);
                    
                    // ข้อมูล sizes และ colors เป็น object/array อยู่แล้ว ไม่ต้อง parse
                    let sizes = item.sizes || [];
                    let colors = item.colors || [];
                    
                    // แปลงเป็น array ถ้าเป็น object
                    if (typeof sizes === 'object' && !Array.isArray(sizes)) {
                        sizes = Object.values(sizes);
                    }
                    if (typeof colors === 'object' && !Array.isArray(colors)) {
                        colors = Object.values(colors);
                    }
                    
                    console.log('Original sizes:', item.sizes, 'Processed sizes:', sizes);
                    console.log('Original colors:', item.colors, 'Processed colors:', colors);
                    
                    const saleItem = {
                        productId: item.id,
                        product_name: item.name,
                        name: item.name,
                        quantity: item.quantity || 0,
                        price: item.price || 0,
                        total: (item.price || 0) * (item.quantity || 0),
                        // เพิ่มข้อมูลรายละเอียดสินค้า
                        sizes: sizes,
                        colors: colors,
                        sku: item.barcode || '',
                        category: item.category || ''
                    };
                    
                    console.log('Created sale item:', saleItem);
                    return saleItem;
                }),
                subtotal,
                discount: discountInfo.discountAmount,
                tax,
                total,
                excludeVAT: discountInfo.excludeVAT,
                paymentMethod,
                notes: discountInfo.excludeVAT ? 'ไม่รวม VAT' : '',
                pointsUsed: discountInfo.pointsUsed,
                pointsEarned: loyaltySettings.purchaseAmountForOnePoint > 0 
                    ? Math.floor(total / loyaltySettings.purchaseAmountForOnePoint) 
                    : 0
            };

            console.log('Sending sale data:', saleData);
            console.log('Cart items:', cart);
            console.log('Cart items details:');
            cart.forEach((item, index) => {
                console.log(`Cart item ${index}:`, {
                    id: item.id,
                    name: item.name,
                    sizes: item.sizes,
                    colors: item.colors,
                    sku: item.sku,
                    category: item.category,
                    barcode: item.barcode
                });
            });
            console.log('Sale data items:', saleData.items);
            console.log('Auth token:', localStorage.getItem('auth_token'));

            // Save sale to API
            try {
                const saleResponse = await fetch('https://rocky-crag-70324-8ba51ccad186.herokuapp.com/api/sales', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    },
                    body: JSON.stringify(saleData)
                });

                console.log('Sale response status:', saleResponse.status);
                console.log('Sale response headers:', saleResponse.headers);

                if (!saleResponse.ok) {
                    const errorText = await saleResponse.text();
                    console.error('Sale API error response:', errorText);
                    throw new Error(`Failed to save sale: ${saleResponse.status} - ${errorText}`);
                }

                const sale = await saleResponse.json();
                console.log('Sale saved successfully:', sale);
                console.log('Sale data structure:', JSON.stringify(sale, null, 2));
                console.log('Sale items:', sale.sale?.items);
                console.log('Sale total:', sale.sale?.total);
                console.log('Sale subtotal:', sale.sale?.subtotal);
                console.log('Sale response keys:', Object.keys(sale));
                console.log('Sale.sale keys:', sale.sale ? Object.keys(sale.sale) : 'no sale property');
                console.log('Full sale response:', sale);

                // Update customer loyalty points if applicable
                if (selectedCustomer) {
                    pointsEarned = sale.pointsEarned;
                    finalLoyaltyPoints = (selectedCustomer.loyaltyPoints || 0) - discountInfo.pointsUsed + pointsEarned;
                    
                    // Update customer in API
                    try {
                        await customerService.updateCustomer(selectedCustomer.id, {
                            ...selectedCustomer,
                            totalPurchases: (selectedCustomer.totalPurchases || 0) + total,
                            lastPurchase: new Date().toISOString().split('T')[0],
                            loyaltyPoints: finalLoyaltyPoints
                        });
                    } catch (error) {
                        console.error('Error updating customer:', error);
                    }
                }

                // Update product stock
                for (const item of (cart || [])) {
                    try {
                        await productService.updateProduct(item.id, {
                            ...item,
                            stock: (item.stock || 0) - (item.quantity || 0)
                        });
                    } catch (error) {
                        console.error('Error updating product stock:', error);
                    }
                }

                // Reload products to get updated stock
                try {
                    const productsResponse = await productService.getAllProducts();
                    setProducts(productsResponse.products || []);
                } catch (error) {
                    console.error('Error reloading products:', error);
                }

                // Send Line notification if configured
                if (settings?.notifications?.notifyOnSale && settings?.notifications?.lineChannelAccessToken && settings?.notifications?.lineUserId) {
                    const saleMessage = `
ยอดขายใหม่: ${(sale.total || 0).toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}
ลูกค้า: ${selectedCustomer && selectedCustomer.name ? selectedCustomer.name : 'ลูกค้าทั่วไป'}
สินค้า: ${(sale.items || []).length} รายการ
ชำระโดย: ${sale.paymentMethod || 'ไม่ระบุ'}`;
                    sendLineMessage(saleMessage);
                }

                closeLoading();
                setCart([]);
                setSelectedCustomer(null);
                toast({ title: "บันทึกการขายสำเร็จ", description: `ยอดขาย: ${total.toLocaleString('th-TH', { style: 'currency', currency: 'THB' })}` });
                console.log('Sale completed successfully:', sale);
                console.log('Returning sale object:', sale.sale || sale);
                console.log('Sale object structure:', {
                    hasSaleProperty: !!sale.sale,
                    saleKeys: sale.sale ? Object.keys(sale.sale) : 'no sale property',
                    directKeys: Object.keys(sale)
                });
                
                // Ensure the returned sale object has all required fields
                const finalSale = sale.sale || sale;
                console.log('Final sale before processing:', finalSale);
                console.log('Final sale items before processing:', finalSale.items);
                
                if (!finalSale.items || finalSale.items.length === 0) {
                    // If items are missing, create them from cart
                    console.log('Creating items from cart because items are missing or empty');
                    finalSale.items = (cart || []).map(item => {
                        console.log('Creating final sale item from cart item:', item);
                        
                        // ข้อมูล sizes และ colors เป็น object/array อยู่แล้ว ไม่ต้อง parse
                        let sizes = item.sizes || [];
                        let colors = item.colors || [];
                        
                        // แปลงเป็น array ถ้าเป็น object
                        if (typeof sizes === 'object' && !Array.isArray(sizes)) {
                            sizes = Object.values(sizes);
                        }
                        if (typeof colors === 'object' && !Array.isArray(colors)) {
                            colors = Object.values(colors);
                        }
                        
                        console.log('Final sale item - Original sizes:', item.sizes, 'Processed sizes:', sizes);
                        console.log('Final sale item - Original colors:', item.colors, 'Processed colors:', colors);
                        
                        return {
                            id: item.id,
                            product_id: item.id,
                            product_name: item.name,
                            name: item.name,
                            quantity: item.quantity || 0,
                            price: item.price || 0,
                            total: (item.price || 0) * (item.quantity || 0),
                            // เพิ่มข้อมูลรายละเอียดสินค้า
                            sizes: sizes,
                            colors: colors,
                            sku: item.sku || item.barcode || '',
                            category: item.category || ''
                        };
                    });
                }
                
                console.log('Final sale items:', finalSale.items);
                console.log('Final sale items length:', finalSale.items?.length);
                console.log('Final sale created_by_name:', finalSale.created_by_name);
                console.log('Final sale created_by:', finalSale.created_by);
                console.log('Final sale keys:', Object.keys(finalSale));
                
                return finalSale;
                
            } catch (error) {
                console.error('Error saving sale:', error);
                closeLoading();
                showError('เกิดข้อผิดพลาด', `ไม่สามารถบันทึกการขายได้: ${error.message}`);
                return null;
            }
            
        } catch (error) {
            console.error('Error processing sale:', error);
            closeLoading();
            showError('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกการขายได้');
            return null;
        }
    }, [cart, selectedCustomer, hasPermission, toast]);

    const handleSaveCustomer = useCallback(async (customerData) => {
        if (!hasPermission(PERMISSIONS.CUSTOMERS_CREATE)) {
            toast({ title: "ไม่มีสิทธิ์", description: "คุณไม่มีสิทธิ์ในการเพิ่มลูกค้า", variant: "destructive" });
            return;
        }
        
        try {
            showLoading('กำลังบันทึกลูกค้า...');
            
            const newCustomer = await customerService.createCustomer({
                ...customerData,
                totalPurchases: 0,
                lastPurchase: null,
                joinDate: new Date().toISOString().split('T')[0],
                loyaltyPoints: 0
            });
            
            const updatedCustomers = [...(customers || []), newCustomer];
            setCustomers(updatedCustomers);
            setSelectedCustomer(newCustomer);
            
            closeLoading();
            toast({ title: "เพิ่มลูกค้าสำเร็จ", description: `${newCustomer.name || 'ลูกค้าใหม่'} ถูกเลือกสำหรับออเดอร์นี้` });
            
        } catch (error) {
            console.error('Error saving customer:', error);
            closeLoading();
            showError('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกลูกค้าได้');
        }
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
        handleSaveCustomer,
        loading,
        error,
        loadData
    };
};