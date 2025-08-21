import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Users, 
  Package,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  User,
  Shield,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth, PERMISSIONS } from '@/hooks/useAuth';
import { salesService } from '@/services/salesService';
import { productService } from '@/services/productService';
import { customerService } from '@/services/customerService';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { toast } = useToast();
  const { currentUser, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('today'); // today, week, month, year, custom
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

  // ดึงข้อมูลจาก API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Dashboard: Fetching data from APIs...');
        
        // ดึงข้อมูลจาก API พร้อมกัน
        const [salesResponse, productsResponse, customersResponse] = await Promise.all([
          salesService.getAllSales(),
          productService.getAllProducts(),
          customerService.getAllCustomers()
        ]);
        
        console.log('📊 Dashboard API responses:', {
          sales: salesResponse?.length || 0,
          products: productsResponse?.length || 0,
          customers: customersResponse?.length || 0
        });
        
        // จัดการข้อมูล Sales
        let salesData = [];
        if (Array.isArray(salesResponse)) {
          salesData = salesResponse;
        } else if (salesResponse?.sales && Array.isArray(salesResponse.sales)) {
          salesData = salesResponse.sales;
        }
        
        // แก้ไขข้อมูลยอดขายที่อาจมีปัญหา
        salesData = salesData.map(sale => ({
          ...sale,
          total: parseFloat(sale.total) || 0,
          subtotal: parseFloat(sale.subtotal) || 0,
          discount: parseFloat(sale.discount) || 0,
          tax: parseFloat(sale.tax) || 0
        }));
        
        // จัดการข้อมูล Products
        let productsData = [];
        if (Array.isArray(productsResponse)) {
          productsData = productsResponse;
        } else if (productsResponse?.products && Array.isArray(productsResponse.products)) {
          productsData = productsResponse.products;
        }
        
        // จัดการข้อมูล Customers
        let customersData = [];
        if (Array.isArray(customersResponse)) {
          customersData = customersResponse;
        } else if (customersResponse?.customers && Array.isArray(customersResponse.customers)) {
          customersData = customersResponse.customers;
        }
        
        setSales(salesData);
        setProducts(productsData);
        setCustomers(customersData);
        
        console.log('✅ Dashboard: Data loaded successfully', {
          salesCount: salesData.length,
          productsCount: productsData.length,
          customersCount: customersData.length
        });
        
      } catch (error) {
        console.error('❌ Dashboard: Error fetching data:', error);
        setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const getFilteredSales = () => {
    const now = new Date();
    let startDate, endDate;

    switch (dateFilter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        startDate = startOfWeek;
        endDate = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      case 'custom':
        if (customDateRange.start && customDateRange.end) {
          startDate = new Date(customDateRange.start);
          endDate = new Date(customDateRange.end);
          endDate.setDate(endDate.getDate() + 1); // Include end date
        } else {
          return sales;
        }
        break;
      default:
        return sales;
    }

    return sales.filter(sale => {
      const saleDate = new Date(sale.created_at || sale.timestamp);
      return saleDate >= startDate && saleDate < endDate;
    });
  };

  const getSalesOnDate = (date) => {
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return sales.filter(sale => {
      const saleDate = new Date(sale.created_at || sale.timestamp);
      return saleDate >= targetDate && saleDate < new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);
    });
  };

  const filteredSales = getFilteredSales();
  const salesToday = getSalesOnDate(today);
  const salesYesterday = getSalesOnDate(yesterday);

  // แก้ไขการคำนวณยอดขายให้ถูกต้อง
  const totalSalesToday = salesToday.reduce((sum, sale) => {
    const saleTotal = parseFloat(sale.total) || 0;
    // ตรวจสอบว่าจำนวนเงินไม่เกินค่าที่สมเหตุสมผล
    if (isNaN(saleTotal) || saleTotal < 0 || saleTotal > 1000000) {
      console.warn('Invalid sale total detected:', sale);
      return sum;
    }
    return sum + saleTotal;
  }, 0);
  
  const totalSalesYesterday = salesYesterday.reduce((sum, sale) => {
    const saleTotal = parseFloat(sale.total) || 0;
    // ตรวจสอบว่าจำนวนเงินไม่เกินค่าที่สมเหตุสมผล
    if (isNaN(saleTotal) || saleTotal < 0 || saleTotal > 1000000) {
      console.warn('Invalid sale total detected:', sale);
      return sum;
    }
    return sum + saleTotal;
  }, 0);
  
  const totalFilteredSales = filteredSales.reduce((sum, sale) => {
    const saleTotal = parseFloat(sale.total) || 0;
    // ตรวจสอบว่าจำนวนเงินไม่เกินค่าที่สมเหตุสมผล
    if (isNaN(saleTotal) || saleTotal < 0 || saleTotal > 1000000) {
      console.warn('Invalid sale total detected:', sale);
      return sum;
    }
    return sum + saleTotal;
  }, 0);

  const salesChange = totalSalesYesterday > 0 
    ? ((totalSalesToday - totalSalesYesterday) / totalSalesYesterday) * 100
    : (totalSalesToday > 0 ? 100 : 0);

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case 'today': return 'ยอดขายวันนี้';
      case 'week': return 'ยอดขายสัปดาห์นี้';
      case 'month': return 'ยอดขายเดือนนี้';
      case 'year': return 'ยอดขายปีนี้';
      case 'custom': return 'ยอดขายช่วงที่เลือก';
      default: return 'ยอดขายทั้งหมด';
    }
  };

  const getOrderFilterLabel = () => {
    switch (dateFilter) {
      case 'today': return 'จำนวนออเดอร์วันนี้';
      case 'week': return 'จำนวนออเดอร์สัปดาห์นี้';
      case 'month': return 'จำนวนออเดอร์เดือนนี้';
      case 'year': return 'จำนวนออเดอร์ปีนี้';
      case 'custom': return 'จำนวนออเดอร์ช่วงที่เลือก';
      default: return 'จำนวนออเดอร์ทั้งหมด';
    }
  };

  const stats = [
    {
      title: getDateFilterLabel(),
      value: `฿${totalFilteredSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
      change: dateFilter === 'today' ? `${salesChange.toFixed(1)}%` : '',
      trend: dateFilter === 'today' ? (salesChange >= 0 ? 'up' : 'down') : null,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: getOrderFilterLabel(),
      value: filteredSales.length,
      change: dateFilter === 'today' ? `เทียบเมื่อวาน ${salesYesterday.length}` : '',
      trend: dateFilter === 'today' ? (salesToday.length >= salesYesterday.length ? 'up' : 'down') : null,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'ลูกค้าทั้งหมด',
      value: customers.length,
      change: '',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'สินค้าคงเหลือ',
      value: products.reduce((sum, p) => sum + (p.stock || 0), 0),
      change: '',
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const recentSales = filteredSales.slice(0, 5);
  
  const productSales = filteredSales.reduce((acc, sale) => {
    const items = sale.items || [];
    items.forEach(item => {
      const itemId = item.product_id || item.id;
      const itemName = item.product_name || item.name;
      const itemQuantity = parseInt(item.quantity) || 0;
      const itemPrice = parseFloat(item.price) || 0;
      
      // ตรวจสอบว่าข้อมูลถูกต้อง
      if (isNaN(itemQuantity) || itemQuantity < 0 || itemQuantity > 10000) {
        console.warn('Invalid item quantity detected:', item);
        return;
      }
      
      if (isNaN(itemPrice) || itemPrice < 0 || itemPrice > 100000) {
        console.warn('Invalid item price detected:', item);
        return;
      }
      
      if (!acc[itemId]) {
        acc[itemId] = { name: itemName, sold: 0, revenue: 0 };
      }
      acc[itemId].sold += itemQuantity;
      acc[itemId].revenue += itemQuantity * itemPrice;
    });
    return acc;
  }, {});

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  const handleExport = () => {
    if (!hasPermission(PERMISSIONS.REPORTS_EXPORT)) {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "คุณไม่มีสิทธิ์ในการส่งออกรายงาน",
        variant: "destructive"
      });
      return;
    }
    
    if (sales.length === 0) {
      toast({
        title: "ไม่มีข้อมูลให้ส่งออก",
        description: "ยังไม่มีข้อมูลการขายในระบบ",
        variant: "destructive"
      });
      return;
    }

    const dataToExport = sales.map(sale => {
      // ตรวจสอบและแก้ไขข้อมูลยอดขาย
      const subtotal = parseFloat(sale.subtotal || 0);
      const discount = parseFloat(sale.discount || 0);
      const tax = parseFloat(sale.tax || 0);
      const total = parseFloat(sale.total || 0);
      
      return {
        'Sale ID': sale.id,
        'Timestamp': new Date(sale.created_at || sale.timestamp).toLocaleString('th-TH'),
        'Customer': sale.customer_name || sale.customer || 'ลูกค้าทั่วไป',
        'Subtotal': isNaN(subtotal) ? '0.00' : subtotal.toFixed(2),
        'Discount': isNaN(discount) ? '0.00' : discount.toFixed(2),
        'Tax': isNaN(tax) ? '0.00' : tax.toFixed(2),
        'Total': isNaN(total) ? '0.00' : total.toFixed(2),
        'Payment Method': sale.payment_method || sale.paymentMethod,
        'Items': (sale.items || []).map(item => `${item.product_name || item.name} (x${item.quantity})`).join(', ')
      };
    });

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `all_sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "ส่งออกรายงานสำเร็จ",
      description: "ไฟล์ CSV กำลังถูกดาวน์โหลด"
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ด</h1>
            <p className="text-gray-600 mt-1">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border animate-pulse">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="mt-4">
                <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ด</h1>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()}>
            ลองใหม่อีกครั้ง
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ด</h1>
          <p className="text-gray-600 mt-1">ภาพรวมการขายและสถิติร้านค้า</p>
        </div>
        <div className="flex items-center gap-4">
          {hasPermission(PERMISSIONS.REPORTS_EXPORT) && (
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              ส่งออกรายงานทั้งหมด
            </Button>
          )}
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">กรองข้อมูล:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'today', label: 'วันนี้' },
              { value: 'week', label: 'สัปดาห์นี้' },
              { value: 'month', label: 'เดือนนี้' },
              { value: 'year', label: 'ปีนี้' },
              { value: 'custom', label: 'กำหนดเอง' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setDateFilter(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateFilter === filter.value
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-500">ถึง</span>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border card-hover"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              {stat.change && (
                <div className={`flex items-center text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                  )}
                  {stat.change}
                </div>
              )}
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">แนวโน้มยอดขาย</h2>
        <div className="h-64 flex items-end justify-between space-x-2">
          {(() => {
            const days = dateFilter === 'week' ? 7 : dateFilter === 'month' ? 30 : dateFilter === 'year' ? 12 : 7;
            const maxSales = Math.max(...Array.from({ length: days }, (_, i) => {
              const date = new Date();
              if (dateFilter === 'year') {
                date.setMonth(date.getMonth() - (days - 1 - i));
                const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
                const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                const monthSales = sales.filter(sale => {
                  const saleDate = new Date(sale.created_at || sale.timestamp);
                  return saleDate >= monthStart && saleDate < monthEnd;
                }).reduce((sum, sale) => {
                  const saleTotal = parseFloat(sale.total) || 0;
                  if (isNaN(saleTotal) || saleTotal < 0 || saleTotal > 1000000) {
                    return sum;
                  }
                  return sum + saleTotal;
                }, 0);
                return isNaN(monthSales) ? 0 : monthSales;
              } else {
                date.setDate(date.getDate() - (days - 1 - i));
                const daySales = getSalesOnDate(date).reduce((sum, sale) => {
                  const saleTotal = parseFloat(sale.total) || 0;
                  if (isNaN(saleTotal) || saleTotal < 0 || saleTotal > 1000000) {
                    return sum;
                  }
                  return sum + saleTotal;
                }, 0);
                return isNaN(daySales) ? 0 : daySales;
              }
            })) || 1;

            return Array.from({ length: days }, (_, i) => {
              const date = new Date();
              let label, salesAmount;
              
              if (dateFilter === 'year') {
                date.setMonth(date.getMonth() - (days - 1 - i));
                label = date.toLocaleDateString('th-TH', { month: 'short' });
                const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
                const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1);
                const monthSales = sales.filter(sale => {
                  const saleDate = new Date(sale.created_at || sale.timestamp);
                  return saleDate >= monthStart && saleDate < monthEnd;
                }).reduce((sum, sale) => {
                  const saleTotal = parseFloat(sale.total) || 0;
                  if (isNaN(saleTotal) || saleTotal < 0 || saleTotal > 1000000) {
                    return sum;
                  }
                  return sum + saleTotal;
                }, 0);
                salesAmount = isNaN(monthSales) ? 0 : monthSales;
              } else {
                date.setDate(date.getDate() - (days - 1 - i));
                label = date.getDate().toString();
                const daySales = getSalesOnDate(date).reduce((sum, sale) => {
                  const saleTotal = parseFloat(sale.total) || 0;
                  if (isNaN(saleTotal) || saleTotal < 0 || saleTotal > 1000000) {
                    return sum;
                  }
                  return sum + saleTotal;
                }, 0);
                salesAmount = isNaN(daySales) ? 0 : daySales;
              }
              
              const height = maxSales > 0 ? (salesAmount / maxSales) * 200 : 0;
              
              // ตรวจสอบว่าค่าที่คำนวณได้สมเหตุสมผล
              const validHeight = isNaN(height) || height < 0 || height > 200 ? 0 : height;
              const validSalesAmount = isNaN(salesAmount) || salesAmount < 0 || salesAmount > 1000000 ? 0 : salesAmount;
              
              return (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-md transition-all duration-300 hover:from-blue-600 hover:to-blue-400 min-h-[4px]"
                    style={{ height: `${validHeight}px` }}
                    title={`${label}: ฿${parseFloat(validSalesAmount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`}
                  />
                  <span className="text-xs text-gray-500 mt-2">{label}</span>
                </div>
              );
            });
          })()}
        </div>
        <div className="flex justify-center mt-4">
          <span className="text-sm text-gray-500">
            {dateFilter === 'year' ? 'รายเดือน' : 'รายวัน'} ({
              dateFilter === 'today' ? 'วันนี้' :
              dateFilter === 'week' ? '7 วันล่าสุด' :
              dateFilter === 'month' ? '30 วันล่าสุด' :
              dateFilter === 'year' ? '12 เดือนล่าสุด' :
              'ช่วงที่เลือก'
            })
          </span>
        </div>
      </div>

      {/* Comparison Statistics */}
      {dateFilter !== 'today' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">สถิติเปรียบเทียบ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(() => {
              const getPreviousPeriodSales = () => {
                const now = new Date();
                let prevStartDate, prevEndDate;
                
                switch (dateFilter) {
                  case 'week':
                    const startOfLastWeek = new Date(now);
                    startOfLastWeek.setDate(now.getDate() - now.getDay() - 7);
                    startOfLastWeek.setHours(0, 0, 0, 0);
                    prevStartDate = startOfLastWeek;
                    prevEndDate = new Date(startOfLastWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
                    break;
                  case 'month':
                    prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    prevEndDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                  case 'year':
                    prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
                    prevEndDate = new Date(now.getFullYear(), 0, 1);
                    break;
                  default:
                    return [];
                }
                
                return sales.filter(sale => {
                  const saleDate = new Date(sale.created_at || sale.timestamp);
                  return saleDate >= prevStartDate && saleDate < prevEndDate;
                });
              };

              const previousPeriodSales = getPreviousPeriodSales();
              const currentPeriodTotal = filteredSales.reduce((sum, sale) => {
                const saleTotal = parseFloat(sale.total) || 0;
                if (isNaN(saleTotal) || saleTotal < 0 || saleTotal > 1000000) {
                  return sum;
                }
                return sum + saleTotal;
              }, 0);
              const previousPeriodTotal = previousPeriodSales.reduce((sum, sale) => {
                const saleTotal = parseFloat(sale.total) || 0;
                if (isNaN(saleTotal) || saleTotal < 0 || saleTotal > 1000000) {
                  return sum;
                }
                return sum + saleTotal;
              }, 0);
              
              const salesGrowth = previousPeriodTotal > 0 
                ? ((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal) * 100
                : (currentPeriodTotal > 0 ? 100 : 0);

              const orderGrowth = previousPeriodSales.length > 0
                ? ((filteredSales.length - previousPeriodSales.length) / previousPeriodSales.length) * 100
                : (filteredSales.length > 0 ? 100 : 0);

              const avgOrderValueCurrent = filteredSales.length > 0 ? currentPeriodTotal / filteredSales.length : 0;
              const avgOrderValuePrevious = previousPeriodSales.length > 0 ? previousPeriodTotal / previousPeriodSales.length : 0;
              
              // ตรวจสอบว่าค่าที่คำนวณได้สมเหตุสมผล
              const validAvgOrderValueCurrent = isNaN(avgOrderValueCurrent) || avgOrderValueCurrent < 0 || avgOrderValueCurrent > 1000000 ? 0 : avgOrderValueCurrent;
              const validAvgOrderValuePrevious = isNaN(avgOrderValuePrevious) || avgOrderValuePrevious < 0 || avgOrderValuePrevious > 1000000 ? 0 : avgOrderValuePrevious;
              
              const avgOrderGrowth = validAvgOrderValuePrevious > 0
                ? ((validAvgOrderValueCurrent - validAvgOrderValuePrevious) / validAvgOrderValuePrevious) * 100
                : (validAvgOrderValueCurrent > 0 ? 100 : 0);

              const getPeriodLabel = () => {
                switch (dateFilter) {
                  case 'week': return 'สัปดาห์ที่แล้ว';
                  case 'month': return 'เดือนที่แล้ว';
                  case 'year': return 'ปีที่แล้ว';
                  default: return 'ช่วงก่อนหน้า';
                }
              };

              return [
                {
                  title: 'เปรียบเทียบยอดขาย',
                  current: currentPeriodTotal,
                  previous: previousPeriodTotal,
                  growth: salesGrowth,
                  format: 'currency'
                },
                {
                  title: 'เปรียบเทียบจำนวนออเดอร์',
                  current: filteredSales.length,
                  previous: previousPeriodSales.length,
                  growth: orderGrowth,
                  format: 'number'
                },
                {
                  title: 'มูลค่าเฉลี่ยต่อออเดอร์',
                  current: validAvgOrderValueCurrent,
                  previous: validAvgOrderValuePrevious,
                  growth: avgOrderGrowth,
                  format: 'currency'
                }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="mb-3">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">{stat.title}</h3>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.format === 'currency' 
                          ? `฿${parseFloat(stat.current || 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` 
                          : stat.current.toLocaleString()
                        }
                      </p>
                      <p className="text-sm text-gray-500">
                        {getPeriodLabel()}: {stat.format === 'currency' 
                          ? `฿${parseFloat(stat.previous || 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` 
                          : stat.previous.toLocaleString()
                        }
                      </p>
                    </div>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    stat.growth >= 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {stat.growth >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                    )}
                    {Math.abs(stat.growth).toFixed(1)}%
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">การขายล่าสุด</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/reports')}>
              ดูทั้งหมด
            </Button>
          </div>
          <div className="space-y-4">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {(sale.customer_name || sale.customer || 'ลูกค้าทั่วไป').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{sale.customer_name || sale.customer || 'ลูกค้าทั่วไป'}</p>
                    <p className="text-sm text-gray-500">{sale.items?.length || 0} รายการ • {new Date(sale.created_at || sale.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">฿{parseFloat(sale.total || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">สินค้าขายดี</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/reports')}>
              ดูทั้งหมด
            </Button>
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">ขายได้ {product.sold} ชิ้น</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">฿{parseFloat(product.revenue || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white"
        >
          <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">เริ่มขายสินค้าเลย!</h2>
              <p className="text-blue-100">ระบบ POS พร้อมใช้งาน เริ่มต้นการขายได้ทันที</p>
            </div>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => navigate('/pos')}
              className="bg-white text-blue-600 hover:bg-gray-100 flex-shrink-0"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              เริ่มขาย
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">ข้อมูลผู้ใช้</h2>
              <p className="text-gray-600">ข้อมูลการเข้าสู่ระบบปัจจุบัน</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">ชื่อผู้ใช้:</span>
              <span className="font-medium">{currentUser?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">บทบาท:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {currentUser?.role}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">เข้าสู่ระบบล่าสุด:</span>
              <span className="text-sm text-gray-500">
                {currentUser?.lastLogin 
                  ? new Date(currentUser.lastLogin).toLocaleString('th-TH')
                  : 'เพิ่งเข้าสู่ระบบ'
                }
              </span>
            </div>
            {hasPermission(PERMISSIONS.USERS_VIEW) && (
              <div className="pt-3 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/users')}
                  className="w-full"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  จัดการผู้ใช้
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;