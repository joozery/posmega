
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Download, 
  DollarSign,
  ShoppingCart,
  Package,
  BarChart3,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Papa from 'papaparse';

const Reports = () => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState('today');
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    const savedSales = localStorage.getItem('pos_sales');
    if (savedSales) {
      setSalesData(JSON.parse(savedSales));
    }
  }, []);

  const getFilteredData = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return salesData.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      
      switch (dateRange) {
        case 'today':
          return saleDate >= today;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return saleDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return saleDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
          return saleDate >= yearAgo;
        default:
          return true;
      }
    });
  };

  const filteredSales = getFilteredData();

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalOrders = filteredSales.length;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const totalItems = filteredSales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  const productSales = {};
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      if (productSales[item.name]) {
        productSales[item.name].quantity += item.quantity;
        productSales[item.name].revenue += item.price * item.quantity;
      } else {
        productSales[item.name] = {
          name: item.name,
          quantity: item.quantity,
          revenue: item.price * item.quantity
        };
      }
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const paymentMethods = {};
  filteredSales.forEach(sale => {
    const method = sale.paymentMethod || 'ไม่ระบุ';
    if (paymentMethods[method]) {
      paymentMethods[method].count += 1;
      paymentMethods[method].amount += sale.total;
    } else {
      paymentMethods[method] = {
        method: method,
        count: 1,
        amount: sale.total
      };
    }
  });

  const dailySales = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const daySales = salesData.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      return saleDate >= dayStart && saleDate < dayEnd;
    });
    
    const dayTotal = daySales.reduce((sum, sale) => sum + sale.total, 0);
    
    dailySales.push({
      date: date.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric' }),
      amount: dayTotal,
      orders: daySales.length
    });
  }

  const handleExport = () => {
    if (filteredSales.length === 0) {
      toast({
        title: "ไม่มีข้อมูลให้ส่งออก",
        description: "กรุณาเลือกช่วงเวลาที่มีข้อมูลการขาย",
        variant: "destructive"
      });
      return;
    }

    const dataToExport = filteredSales.map(sale => ({
      'Sale ID': sale.id,
      'Timestamp': new Date(sale.timestamp).toLocaleString('th-TH'),
      'Customer': sale.customer,
      'Subtotal': sale.subtotal.toFixed(2),
      'Discount': (sale.discount || 0).toFixed(2),
      'Tax': sale.tax.toFixed(2),
      'Total': sale.total.toFixed(2),
      'Payment Method': sale.paymentMethod,
      'Items': sale.items.map(item => `${item.name} (x${item.quantity})`).join(', ')
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "ส่งออกรายงานสำเร็จ",
      description: "ไฟล์ CSV กำลังถูกดาวน์โหลด"
    });
  };

  const dateRangeOptions = [
    { value: 'today', label: 'วันนี้' },
    { value: 'week', label: '7 วันที่ผ่านมา' },
    { value: 'month', label: '30 วันที่ผ่านมา' },
    { value: 'year', label: '1 ปีที่ผ่านมา' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">รายงานและสถิติ</h1>
          <p className="text-gray-600 mt-1">วิเคราะห์ข้อมูลการขายและประสิทธิภาพธุรกิจ</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          ส่งออกรายงาน
        </Button>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">ช่วงเวลา</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 shadow-sm border">
          <DollarSign className="w-8 h-8 text-green-600 mb-3" />
          <p className="text-sm text-gray-600">ยอดขายรวม</p>
          <p className="text-2xl font-bold text-gray-900">฿{totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-6 shadow-sm border">
          <ShoppingCart className="w-8 h-8 text-blue-600 mb-3" />
          <p className="text-sm text-gray-600">จำนวนออเดอร์</p>
          <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl p-6 shadow-sm border">
          <BarChart3 className="w-8 h-8 text-purple-600 mb-3" />
          <p className="text-sm text-gray-600">ยอดเฉลี่ยต่อออเดอร์</p>
          <p className="text-2xl font-bold text-gray-900">฿{avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl p-6 shadow-sm border">
          <Package className="w-8 h-8 text-orange-600 mb-3" />
          <p className="text-sm text-gray-600">สินค้าที่ขายได้</p>
          <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">ยอดขายรายวัน (7 วันที่ผ่านมา)</h2>
          <div className="space-y-4">
            {dailySales.map((day, index) => {
              const maxAmount = Math.max(...dailySales.map(d => d.amount));
              const percentage = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center space-x-2 sm:space-x-4">
                  <div className="w-12 sm:w-16 text-sm text-gray-600">{day.date}</div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }} className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full" />
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700 px-2">฿{day.amount.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="w-16 sm:w-20 text-sm text-gray-600 text-right">{day.orders} ออเดอร์</div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">สินค้าขายดี</h2>
          <div className="space-y-4">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">ขายได้ {product.quantity} ชิ้น</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">฿{product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">ยังไม่มีข้อมูลการขาย</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {Object.keys(paymentMethods).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">วิธีการชำระเงิน</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(paymentMethods).map((method) => (
              <div key={method.method} className="text-center p-4 rounded-lg bg-gray-50">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  {method.method === 'เงินสด' ? <DollarSign className="w-6 h-6 text-white" /> : <CreditCard className="w-6 h-6 text-white" />}
                </div>
                <h3 className="font-medium text-gray-900">{method.method}</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">฿{method.amount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{method.count} ครั้ง</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {filteredSales.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl p-12 shadow-sm border text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีข้อมูลในช่วงเวลาที่เลือก</h3>
          <p className="text-gray-500">ลองเปลี่ยนช่วงเวลา หรือเริ่มขายสินค้าเพื่อดูรายงาน</p>
        </motion.div>
      )}
    </div>
  );
};

export default Reports;
