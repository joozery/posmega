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
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth, PERMISSIONS } from '@/hooks/useAuth';
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

  useEffect(() => {
    const savedCustomers = localStorage.getItem('pos_customers');
    const savedSales = localStorage.getItem('pos_sales');
    
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }
    if (savedSales) {
      setSales(JSON.parse(savedSales));
    }
  }, []);

  useEffect(() => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(customer => 
        (customer.name && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // เพิ่มข้อมูลการซื้อล่าสุดและสถิติ
    filtered = filtered.map(customer => {
      const customerSales = sales.filter(sale => sale.customerId === customer.id);
      const totalSpent = customerSales.reduce((sum, sale) => sum + sale.total, 0);
      const totalOrders = customerSales.length;
      const lastPurchase = customerSales.length > 0 
        ? new Date(Math.max(...customerSales.map(s => new Date(s.timestamp))))
        : null;
      
      return {
        ...customer,
        totalSpent,
        totalOrders,
        lastPurchase,
        averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0
      };
    });

    // เรียงตามยอดซื้อล่าสุด
    filtered.sort((a, b) => (b.lastPurchase || 0) - (a.lastPurchase || 0));

    setFilteredCustomers(filtered);
  }, [customers, sales, searchTerm]);

  const viewCustomerHistory = (customer) => {
    setSelectedCustomer(customer);
    setIsHistoryDialogOpen(true);
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

    const dataToExport = filteredCustomers.map(customer => ({
      'Customer ID': customer.id,
      'Name': customer.name,
      'Phone': customer.phone || '',
      'Email': customer.email || '',
      'Join Date': customer.joinDate || '',
      'Total Purchases': customer.totalSpent.toFixed(2),
      'Total Orders': customer.totalOrders,
      'Average Order Value': customer.averageOrderValue.toFixed(2),
      'Loyalty Points': customer.loyaltyPoints || 0,
      'Last Purchase': customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString('th-TH') : 'ไม่เคยซื้อ'
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
  };

  const getCustomerSales = (customerId) => {
    return sales.filter(sale => sale.customerId === customerId);
  };

  const getTotalCustomers = () => filteredCustomers.length;
  const getTotalRevenue = () => filteredCustomers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const getAverageOrderValue = () => {
    const totalOrders = filteredCustomers.reduce((sum, customer) => sum + customer.totalOrders, 0);
    return totalOrders > 0 ? getTotalRevenue() / totalOrders : 0;
  };
  const getActiveCustomers = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return filteredCustomers.filter(customer => 
      customer.lastPurchase && new Date(customer.lastPurchase) > thirtyDaysAgo
    ).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ประวัติลูกค้า</h1>
          <p className="text-gray-600 mt-1">ดูประวัติการซื้อและพฤติกรรมของลูกค้า</p>
        </div>
        {hasPermission(PERMISSIONS.REPORTS_EXPORT) && (
          <Button onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            ส่งออกรายงาน
          </Button>
        )}
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
              {filteredCustomers.map((customer) => (
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
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">ID: {customer.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.phone || '-'}</div>
                    <div className="text-sm text-gray-500">{customer.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">฿{customer.totalSpent.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{customer.totalOrders} ออเดอร์</div>
                    <div className="text-xs text-gray-400">เฉลี่ย ฿{customer.averageOrderValue.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{customer.loyaltyPoints || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.lastPurchase 
                      ? new Date(customer.lastPurchase).toLocaleDateString('th-TH')
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer History Dialog */}
      {isHistoryDialogOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsHistoryDialogOpen(false)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">ประวัติการซื้อ - {selectedCustomer.name}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900">ยอดซื้อรวม</h3>
                <p className="text-2xl font-bold text-blue-600">฿{selectedCustomer.totalSpent.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900">จำนวนออเดอร์</h3>
                <p className="text-2xl font-bold text-green-600">{selectedCustomer.totalOrders}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900">แต้มสะสม</h3>
                <p className="text-2xl font-bold text-purple-600">{selectedCustomer.loyaltyPoints || 0}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">รายการซื้อล่าสุด</h3>
              {getCustomerSales(selectedCustomer.id).length > 0 ? (
                <div className="space-y-3">
                  {getCustomerSales(selectedCustomer.id).map((sale) => (
                    <div key={sale.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{sale.id}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(sale.timestamp).toLocaleString('th-TH')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">฿{sale.total.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">{sale.paymentMethod}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>สินค้า: {sale.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}</p>
                        {sale.pointsUsed > 0 && (
                          <p className="text-blue-600">ใช้แต้ม: {sale.pointsUsed}</p>
                        )}
                        {sale.pointsEarned > 0 && (
                          <p className="text-green-600">ได้แต้ม: {sale.pointsEarned}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>ยังไม่มีประวัติการซื้อ</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>
                ปิด
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerHistory; 