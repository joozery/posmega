import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  DollarSign,
  User,
  Package,
  Star,
  ShoppingBag,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth, PERMISSIONS } from '@/hooks/useAuth';
import { customerService } from '@/services/customerService';
import { salesService } from '@/services/salesService';
import Papa from 'papaparse';

const CustomerHistory = () => {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ดึงข้อมูลจาก API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // ตรวจสอบ authentication token
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setError('ไม่พบ authentication token กรุณาเข้าสู่ระบบใหม่');
          setLoading(false);
          return;
        }
        
        console.log('Fetching data with token:', token);
        
        // ดึงข้อมูลลูกค้าและข้อมูลการขายพร้อมกัน
        const [customersResponse, salesResponse] = await Promise.all([
          customerService.getAllCustomers(),
          salesService.getAllSales()
        ]);
        
        console.log('Customers API response:', customersResponse);
        console.log('Sales API response:', salesResponse);
        
        // ตรวจสอบและจัดการข้อมูลที่ได้จาก API
        let customersData = [];
        let salesData = [];
        
        if (customersResponse && Array.isArray(customersResponse)) {
          customersData = customersResponse;
        } else if (customersResponse && customersResponse.customers && Array.isArray(customersResponse.customers)) {
          // กรณีที่ API ส่งข้อมูลในรูปแบบ { customers: [...] }
          customersData = customersResponse.customers;
        } else if (customersResponse && customersResponse.data && Array.isArray(customersResponse.data)) {
          // กรณีที่ API ส่งข้อมูลในรูปแบบ { data: [...] }
          customersData = customersResponse.data;
        } else {
          console.warn('Invalid customers data format:', customersResponse);
          if (customersResponse && customersResponse.error) {
            setError(`API Error: ${customersResponse.error}`);
          } else {
            setError('รูปแบบข้อมูลลูกค้าไม่ถูกต้อง');
          }
          customersData = [];
        }
        
        if (salesResponse && Array.isArray(salesResponse)) {
          salesData = salesResponse;
        } else if (salesResponse && salesResponse.sales && Array.isArray(salesResponse.sales)) {
          // กรณีที่ API ส่งข้อมูลในรูปแบบ { sales: [...] }
          salesData = salesResponse.sales;
        } else if (salesResponse && salesResponse.data && Array.isArray(salesResponse.data)) {
          // กรณีที่ API ส่งข้อมูลในรูปแบบ { data: [...] }
          salesData = salesResponse.data;
        } else {
          console.warn('Invalid sales data format:', salesResponse);
          if (salesResponse && salesResponse.error) {
            setError(`API Error: ${salesResponse.error}`);
          } else {
            setError('รูปแบบข้อมูลการขายไม่ถูกต้อง');
          }
          salesData = [];
        }
        
        console.log('Processed customers data:', customersData);
        console.log('Processed sales data:', salesData);
        
        setCustomers(customersData);
        setSales(salesData);
        
        if (customersData.length === 0 && salesData.length === 0) {
          setError('ไม่พบข้อมูลลูกค้าหรือการขาย');
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        
        // จัดการ error ตามประเภท
        if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          const errorMessage = error.response.data?.error || 'Unknown error';
          
          if (status === 401) {
            setError('Token หมดอายุ กรุณาเข้าสู่ระบบใหม่');
            // ลบ token และ redirect ไปหน้า login
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
          } else if (status === 403) {
            setError('ไม่มีสิทธิ์เข้าถึงข้อมูล กรุณาติดต่อผู้ดูแลระบบ');
          } else if (status === 404) {
            setError('ไม่พบ API endpoint กรุณาติดต่อผู้ดูแลระบบ');
          } else if (status >= 500) {
            setError('เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่อีกครั้ง');
          } else {
            setError(`API Error (${status}): ${errorMessage}`);
          }
        } else if (error.request) {
          // Network error
          setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
        } else {
          // Other error
          setError(`เกิดข้อผิดพลาด: ${error.message}`);
        }
        
        // ตั้งค่าเป็น array ว่างเมื่อเกิดข้อผิดพลาด
        setCustomers([]);
        setSales([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    // ตรวจสอบว่า customers และ sales เป็น array และไม่เป็น null/undefined
    if (!Array.isArray(customers) || !Array.isArray(sales)) {
      console.warn('Customers or sales data is not an array:', { customers, sales });
      setFilteredCustomers([]);
      return;
    }

    let filtered = [...customers]; // สร้าง copy ของ array

    if (searchTerm) {
      filtered = filtered.filter(customer => 
        customer && 
        ((customer.name && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
         (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
         (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // ใช้ข้อมูลจาก Backend โดยตรง (ไม่คำนวณซ้ำ)
    filtered = filtered.map(customer => {
      if (!customer || !customer.id) {
        console.warn('Invalid customer data:', customer);
        return null;
      }

      // แปลงข้อมูลให้เป็น number และจัดการ null/undefined
      const totalSpent = parseFloat(customer.total_spent) || 0;
      const totalPurchases = parseInt(customer.total_purchases) || 0;
      const loyaltyPoints = parseInt(customer.loyalty_points) || 0;
      
      // คำนวณค่าเฉลี่ยต่อออเดอร์
      const averageOrderValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0;
      
      console.log(`Customer ${customer.id} (${customer.name}):`, {
        total_spent: customer.total_spent,
        total_purchases: customer.total_purchases,
        parsed_spent: totalSpent,
        parsed_purchases: totalPurchases,
        averageOrderValue
      });
      
      return {
        ...customer,
        total_spent: totalSpent,
        total_purchases: totalPurchases,
        loyalty_points: loyaltyPoints,
        averageOrderValue: averageOrderValue
      };
    }).filter(Boolean); // กรอง null values ออก

    // เรียงตามยอดซื้อล่าสุด
    try {
      filtered.sort((a, b) => {
        const aDate = a.last_purchase ? new Date(a.last_purchase) : new Date(0);
        const bDate = b.last_purchase ? new Date(b.last_purchase) : new Date(0);
        return bDate - aDate;
      });
    } catch (error) {
      console.warn('Error sorting customers:', error);
    }

    setFilteredCustomers(filtered);
  }, [customers, sales, searchTerm]);

  const viewCustomerHistory = async (customer) => {
    if (!customer || !customer.id) {
      toast({
        title: "ข้อมูลไม่ถูกต้อง",
        description: "ไม่สามารถดูประวัติลูกค้าได้",
        variant: "destructive"
      });
      return;
    }

    try {
      setSelectedCustomer(customer);
      setIsHistoryDialogOpen(true);
      
      // ดึงประวัติการซื้อล่าสุดจาก API
      const customerHistory = await customerService.getCustomerHistory(customer.id);
      if (customerHistory && customerHistory.sales && Array.isArray(customerHistory.sales)) {
        // อัปเดตข้อมูลการขายของลูกค้านี้
        const updatedSales = sales.map(sale => {
          if (sale && sale.customer_id === customer.id) {
            const historySale = customerHistory.sales.find(s => s && s.id === sale.id);
            return historySale ? { ...sale, ...historySale } : sale;
          }
          return sale;
        });
        setSales(updatedSales);
      } else if (customerHistory && customerHistory.data && customerHistory.data.sales && Array.isArray(customerHistory.data.sales)) {
        // กรณีที่ API ส่งข้อมูลในรูปแบบ { data: { sales: [...] } }
        const updatedSales = sales.map(sale => {
          if (sale && sale.customer_id === customer.id) {
            const historySale = customerHistory.data.sales.find(s => s && s.id === sale.id);
            return historySale ? { ...sale, ...historySale } : sale;
          }
          return sale;
        });
        setSales(updatedSales);
      }
    } catch (error) {
      console.error('Error fetching customer history:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงประวัติลูกค้าได้",
        variant: "destructive"
      });
    }
  };

  const exportData = () => {
    if (!hasPermission(PERMISSIONS.REPORTS_EXPORT)) {
      toast({ 
        title: "ไม่มีสิทธิ์", 
        description: "คุณไม่มีสิทธิ์ในการส่งออกรายงาน", 
        variant: "destructive" 
      });
      return;
    }

    if (!Array.isArray(filteredCustomers) || filteredCustomers.length === 0) {
      toast({
        title: "ไม่มีข้อมูล",
        description: "ไม่มีข้อมูลลูกค้าให้ส่งออก",
        variant: "destructive"
      });
      return;
    }

    try {
      const dataToExport = filteredCustomers.map(customer => ({
        'Customer ID': customer?.id || 'ไม่ระบุ',
        'Name': customer?.name || 'ไม่ระบุ',
        'Phone': customer?.phone || '',
        'Email': customer?.email || '',
        'Join Date': customer?.created_at ? new Date(customer.created_at).toLocaleDateString('th-TH') : 'ไม่ระบุ',
        'Total Purchases': (customer?.total_spent || 0).toFixed(2),
        'Total Orders': customer?.total_purchases || 0,
        'Average Order Value': (customer?.averageOrderValue || 0).toFixed(2),
        'Loyalty Points': customer?.loyalty_points || 0,
        'Last Purchase': customer?.last_purchase ? new Date(customer.last_purchase).toLocaleDateString('th-TH') : 'ไม่เคยซื้อ'
      }));

      const csv = Papa.unparse(dataToExport);
      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `customer_history_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "ส่งออกรายงานสำเร็จ", description: "ไฟล์ CSV กำลังถูกดาวน์โหลด" });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งออกรายงานได้",
        variant: "destructive"
      });
    }
  };

  const getCustomerSales = (customerId) => {
    if (!Array.isArray(sales) || !customerId) {
      return [];
    }
    return sales.filter(sale => sale && sale.customer_id === customerId);
  };

  // ฟังก์ชันสำหรับรีเฟรชข้อมูล
  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ตรวจสอบ authentication token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('ไม่พบ authentication token กรุณาเข้าสู่ระบบใหม่');
        setLoading(false);
        return;
      }
      
      console.log('Refreshing data with token:', token);
      
      const [customersResponse, salesResponse] = await Promise.all([
        customerService.getAllCustomers(),
        salesService.getAllSales()
      ]);
      
      console.log('Refresh - Customers API response:', customersResponse);
      console.log('Refresh - Sales API response:', salesResponse);
      
      // ตรวจสอบและจัดการข้อมูลที่ได้จาก API
      let customersData = [];
      let salesData = [];
      
      if (customersResponse && Array.isArray(customersResponse)) {
        customersData = customersResponse;
      } else if (customersResponse && customersResponse.customers && Array.isArray(customersResponse.customers)) {
        // กรณีที่ API ส่งข้อมูลในรูปแบบ { customers: [...] }
        customersData = customersResponse.customers;
      } else if (customersResponse && customersResponse.data && Array.isArray(customersResponse.data)) {
        // กรณีที่ API ส่งข้อมูลในรูปแบบ { data: [...] }
        customersData = customersResponse.data;
      } else {
        console.warn('Invalid customers data format:', customersResponse);
        if (customersResponse && customersResponse.error) {
          setError(`API Error: ${customersResponse.error}`);
        } else {
          setError('รูปแบบข้อมูลลูกค้าไม่ถูกต้อง');
        }
        customersData = [];
      }
      
      if (salesResponse && Array.isArray(salesResponse)) {
        salesData = salesResponse;
      } else if (salesResponse && salesResponse.sales && Array.isArray(salesResponse.sales)) {
        // กรณีที่ API ส่งข้อมูลในรูปแบบ { sales: [...] }
        salesData = salesResponse.sales;
      } else if (salesResponse && salesResponse.data && Array.isArray(salesResponse.data)) {
        // กรณีที่ API ส่งข้อมูลในรูปแบบ { data: [...] }
        salesData = salesResponse.data;
      } else {
        console.warn('Invalid sales data format:', salesResponse);
        if (salesResponse && salesResponse.error) {
          setError(`API Error: ${salesResponse.error}`);
        } else {
          setError('รูปแบบข้อมูลการขายไม่ถูกต้อง');
        }
        salesData = [];
      }
      
      console.log('Refresh - Processed customers data:', customersData);
      console.log('Refresh - Processed sales data:', salesData);
      
      setCustomers(customersData);
      setSales(salesData);
      
      if (customersData.length === 0 && salesData.length === 0) {
        setError('ไม่พบข้อมูลลูกค้าหรือการขาย');
      } else {
        toast({
          title: "อัปเดตข้อมูลสำเร็จ",
          description: `โหลดข้อมูลลูกค้า ${customersData.length} รายการ และข้อมูลการขาย ${salesData.length} รายการ`,
        });
      }
      
    } catch (error) {
      console.error('Error refreshing data:', error);
      
      // จัดการ error ตามประเภท
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const errorMessage = error.response.data?.error || 'Unknown error';
        
        if (status === 401) {
          setError('Token หมดอายุ กรุณาเข้าสู่ระบบใหม่');
          // ลบ token และ redirect ไปหน้า login
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        } else if (status === 403) {
          setError('ไม่มีสิทธิ์เข้าถึงข้อมูล กรุณาติดต่อผู้ดูแลระบบ');
        } else if (status === 404) {
          setError('ไม่พบ API endpoint กรุณาติดต่อผู้ดูแลระบบ');
        } else if (status >= 500) {
          setError('เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่อีกครั้ง');
        } else {
          setError(`API Error (${status}): ${errorMessage}`);
        }
      } else if (error.request) {
        // Network error
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      } else {
        // Other error
        setError(`เกิดข้อผิดพลาด: ${error.message}`);
      }
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตข้อมูลได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalCustomers = () => Array.isArray(filteredCustomers) ? filteredCustomers.length : 0;
  
  const getTotalRevenue = () => {
    if (!Array.isArray(filteredCustomers)) return 0;
    return filteredCustomers.reduce((sum, customer) => {
      const totalSpent = parseFloat(customer?.total_spent) || 0;
      return sum + totalSpent;
    }, 0);
  };
  
  const getAverageOrderValue = () => {
    if (!Array.isArray(filteredCustomers)) return 0;
    const totalOrders = filteredCustomers.reduce((sum, customer) => {
      const orders = parseInt(customer?.total_purchases) || 0;
      return sum + orders;
    }, 0);
    return totalOrders > 0 ? getTotalRevenue() / totalOrders : 0;
  };
  
  const getActiveCustomers = () => {
    if (!Array.isArray(filteredCustomers)) return 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return filteredCustomers.filter(customer => {
      if (!customer?.last_purchase) return false;
      try {
        const lastPurchaseDate = new Date(customer.last_purchase);
        return lastPurchaseDate > thirtyDaysAgo;
      } catch (error) {
        console.warn('Error parsing last_purchase date:', error);
        return false;
      }
    }).length;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-full space-y-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-gray-600">กำลังโหลดข้อมูลจาก API...</p>
        <p className="text-sm text-gray-500">กรุณารอสักครู่</p>
        <div className="text-xs text-gray-400">
          <p>ตรวจสอบ Console (F12) เพื่อดูข้อมูลการโหลด</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-600 space-y-4">
        <div className="p-4 bg-red-50 rounded-lg max-w-md">
          <p className="text-red-600 font-medium mb-2">{error}</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>ลูกค้า: {customers.length} รายการ</p>
            <p>การขาย: {sales.length} รายการ</p>
            <p>ที่กรองแล้ว: {filteredCustomers.length} รายการ</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshData}>
            ลองใหม่
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              console.log('Current state:', {
                customers,
                sales,
                filteredCustomers,
                loading,
                error
              });
              toast({
                title: "ข้อมูล Debug",
                description: `ลูกค้า: ${customers.length}, การขาย: ${sales.length}, ที่กรองแล้ว: ${filteredCustomers.length}`,
              });
            }}
          >
            Debug Info
          </Button>
        </div>
        <div className="text-xs text-gray-400">
          <p>ตรวจสอบ Console (F12) เพื่อดูข้อมูลเพิ่มเติม</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ประวัติลูกค้า</h1>
          <p className="text-gray-600 mt-1">
            ดูประวัติการซื้อและพฤติกรรมของลูกค้า 
            {!loading && customers.length > 0 && (
              <span className="text-blue-600 font-medium">
                ({customers.length} รายการ)
              </span>
            )}
            {!loading && customers.length === 0 && (
              <span className="text-orange-600 font-medium">
                (ไม่มีข้อมูล)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={loading}
          >
            <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              console.log('Current state:', {
                customers,
                sales,
                filteredCustomers,
                loading,
                error
              });
              toast({
                title: "ข้อมูล Debug",
                description: `ลูกค้า: ${customers.length}, การขาย: ${sales.length}, ที่กรองแล้ว: ${filteredCustomers.length}`,
              });
            }}
          >
            Debug Info
          </Button>
          {hasPermission(PERMISSIONS.REPORTS_EXPORT) && (
            <Button onClick={exportData} disabled={loading}>
              <Download className="w-4 h-4 mr-2" />
              ส่งออกรายงาน
            </Button>
          )}
        </div>
      </div>

      {/* สถิติ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ลูกค้าทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalCustomers()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ยอดขายรวม</p>
              <p className="text-2xl font-bold text-gray-900">฿{getTotalRevenue().toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-50 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ออเดอร์เฉลี่ย</p>
              <p className="text-2xl font-bold text-gray-900">฿{getAverageOrderValue().toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center">
            <div className="p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ลูกค้าแอคทีฟ</p>
              <p className="text-2xl font-bold text-gray-900">{getActiveCustomers()}</p>
              <p className="text-xs text-gray-500">30 วันล่าสุด</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ตัวกรอง */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="ค้นหาตามชื่อ, เบอร์โทร, หรืออีเมล..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ตารางลูกค้า */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ลูกค้า
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ข้อมูลติดต่อ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถิติการซื้อ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  แต้มสะสม
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ซื้อล่าสุด
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!Array.isArray(filteredCustomers) || filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>ไม่พบข้อมูลลูกค้า</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  if (!customer || !customer.id) {
                    return null; // ข้ามข้อมูลที่ไม่ถูกต้อง
                  }
                  
                  return (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {customer.name && customer.name.length > 0 ? customer.name.charAt(0).toUpperCase() : '?'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name || 'ไม่ระบุชื่อ'}</div>
                            <div className="text-sm text-gray-500">ID: {customer.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.phone || '-'}</div>
                        <div className="text-sm text-gray-500">{customer.email || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">฿{(customer.total_spent || 0).toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{customer.total_purchases || 0} ออเดอร์</div>
                        <div className="text-xs text-gray-400">เฉลี่ย ฿{(customer.averageOrderValue || 0).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900">{customer.loyalty_points || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.last_purchase 
                          ? new Date(customer.last_purchase).toLocaleDateString('th-TH')
                          : 'ไม่เคยซื้อ'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewCustomerHistory(customer)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  );
                }).filter(Boolean) // กรอง null values ออก
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer History Dialog */}
      {isHistoryDialogOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsHistoryDialogOpen(false)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">ประวัติการซื้อ - {selectedCustomer.name || 'ไม่ระบุชื่อ'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900">ยอดซื้อรวม</h3>
                <p className="text-2xl font-bold text-blue-600">฿{(selectedCustomer.total_spent || 0).toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900">จำนวนออเดอร์</h3>
                <p className="text-2xl font-bold text-green-600">{selectedCustomer.total_purchases || 0}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900">แต้มสะสม</h3>
                <p className="text-2xl font-bold text-purple-600">{selectedCustomer.loyalty_points || 0}</p>
              </div>
            </div>
            
            {/* ข้อมูลเพิ่มเติม */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">ข้อมูลลูกค้า</h3>
                <p className="text-sm text-gray-600">เบอร์โทร: {selectedCustomer.phone || 'ไม่ระบุ'}</p>
                <p className="text-sm text-gray-600">อีเมล: {selectedCustomer.email || 'ไม่ระบุ'}</p>
                <p className="text-sm text-gray-600">วันที่สมัคร: {selectedCustomer.created_at ? new Date(selectedCustomer.created_at).toLocaleDateString('th-TH') : 'ไม่ระบุ'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">สถิติเพิ่มเติม</h3>
                <p className="text-sm text-gray-600">ออเดอร์เฉลี่ย: ฿{(selectedCustomer.averageOrderValue || 0).toLocaleString()}</p>
                <p className="text-sm text-gray-600">ลูกค้าแอคทีฟ: {selectedCustomer.last_purchase ? 'ใช่' : 'ไม่'}</p>
                <p className="text-sm text-gray-600">ซื้อล่าสุด: {selectedCustomer.last_purchase ? new Date(selectedCustomer.last_purchase).toLocaleDateString('th-TH') : 'ไม่เคยซื้อ'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">รายการซื้อล่าสุด</h3>
              {getCustomerSales(selectedCustomer.id).length > 0 ? (
                <div className="space-y-3">
                  {getCustomerSales(selectedCustomer.id).map((sale) => {
                    if (!sale || !sale.id) return null;
                    
                    return (
                      <div key={sale.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900">ออเดอร์ #{sale.id}</p>
                            <p className="text-sm text-gray-500">
                              {sale.created_at ? new Date(sale.created_at).toLocaleString('th-TH') : 'ไม่ระบุเวลา'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">฿{(sale.total || 0).toLocaleString()}</p>
                            <p className="text-sm text-gray-500">{sale.payment_method || 'ไม่ระบุ'}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>สินค้า: {sale.items && Array.isArray(sale.items) && sale.items.length > 0 ? 
                            sale.items.map(item => `${item.product_name || item.name || 'ไม่ระบุ'} (x${item.quantity || 0})`).join(', ') : 
                            'ไม่ระบุรายการสินค้า'
                          }</p>
                          {sale.points_used > 0 && (
                            <p className="text-blue-600">ใช้แต้ม: {sale.points_used}</p>
                          )}
                          {sale.points_earned > 0 && (
                            <p className="text-green-600">ได้แต้ม: {sale.points_earned}</p>
                          )}
                        </div>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>ยังไม่มีประวัติการซื้อ</p>
                </div>
              )}
            </div>
            
            {/* สรุปข้อมูล */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">สรุปข้อมูล</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-700">ลูกค้าคนนี้ได้ซื้อสินค้าจากร้านเราเป็นจำนวน <span className="font-bold">{selectedCustomer.total_purchases || 0}</span> ครั้ง</p>
                  <p className="text-blue-700">มียอดซื้อรวม <span className="font-bold">฿{(selectedCustomer.total_spent || 0).toLocaleString()}</span></p>
                </div>
                <div>
                  <p className="text-blue-700">ออเดอร์เฉลี่ย <span className="font-bold">฿{(selectedCustomer.averageOrderValue || 0).toLocaleString()}</span></p>
                  <p className="text-blue-700">มีแต้มสะสม <span className="font-bold">{selectedCustomer.loyalty_points || 0}</span> แต้ม</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsHistoryDialogOpen(false);
                }}
              >
                ปิด
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  // รีเฟรชข้อมูลเฉพาะของลูกค้านี้
                  viewCustomerHistory(selectedCustomer);
                }}
                disabled={loading}
              >
                <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                อัปเดตข้อมูล
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerHistory; 