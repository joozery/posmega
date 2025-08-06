import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  RotateCcw,
  Receipt,
  FileText,
  Calendar,
  DollarSign,
  User,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth, PERMISSIONS } from '@/hooks/useAuth';
import Papa from 'papaparse';

const RefundHistory = () => {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [selectedSale, setSelectedSale] = useState(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isTaxInvoiceDialogOpen, setIsTaxInvoiceDialogOpen] = useState(false);

  useEffect(() => {
    const savedSales = localStorage.getItem('pos_sales');
    if (savedSales) {
      const parsedSales = JSON.parse(savedSales);
      setSales(parsedSales);
      setFilteredSales(parsedSales);
    }
  }, []);

  useEffect(() => {
    let filtered = sales;

    // กรองตามคำค้นหา
    if (searchTerm) {
      filtered = filtered.filter(sale => 
        sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // กรองตามช่วงวันที่
    if (selectedDateRange !== 'all') {
      const today = new Date();
      let startDate, endDate;
      
      switch (selectedDateRange) {
        case 'today':
          startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'week':
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          startDate = startOfWeek;
          endDate = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
          break;
        case 'year':
          startDate = new Date(today.getFullYear(), 0, 1);
          endDate = new Date(today.getFullYear() + 1, 0, 1);
          break;
        case 'custom':
          if (customDateRange.start && customDateRange.end) {
            startDate = new Date(customDateRange.start);
            endDate = new Date(customDateRange.end);
            endDate.setDate(endDate.getDate() + 1); // Include end date
          } else {
            break; // Skip filtering if custom range is incomplete
          }
          break;
        default:
          break;
      }

      if (startDate && endDate) {
        filtered = filtered.filter(sale => {
          const saleDate = new Date(sale.timestamp);
          return saleDate >= startDate && saleDate < endDate;
        });
      }
    }

    setFilteredSales(filtered);
  }, [sales, searchTerm, selectedDateRange, customDateRange]);

  const handleRefund = (sale) => {
    if (!hasPermission(PERMISSIONS.POS_REFUND)) {
      toast({ 
        title: "ไม่มีสิทธิ์", 
        description: "คุณไม่มีสิทธิ์ในการคืนเงิน", 
        variant: "destructive" 
      });
      return;
    }
    setSelectedSale(sale);
    setIsRefundDialogOpen(true);
  };

  const processRefund = (refundReason) => {
    if (!selectedSale) return;

    // สร้างข้อมูลการคืนเงิน
    const refund = {
      id: `REFUND-${Date.now()}`,
      originalSaleId: selectedSale.id,
      amount: selectedSale.total,
      reason: refundReason,
      timestamp: new Date().toISOString(),
      customer: selectedSale.customer,
      items: selectedSale.items
    };

    // บันทึกการคืนเงิน
    const existingRefunds = JSON.parse(localStorage.getItem('pos_refunds') || '[]');
    localStorage.setItem('pos_refunds', JSON.stringify([refund, ...existingRefunds]));

    // อัพเดทสต็อกสินค้า (เพิ่มกลับเข้าไป)
    const currentProducts = JSON.parse(localStorage.getItem('pos_products') || '[]');
    const updatedProducts = currentProducts.map(product => {
      const refundedItem = selectedSale.items.find(item => item.id === product.id);
      if (refundedItem) {
        return { ...product, stock: product.stock + refundedItem.quantity };
      }
      return product;
    });
    localStorage.setItem('pos_products', JSON.stringify(updatedProducts));

    // อัพเดทลูกค้า (ลบแต้มที่ได้จากการซื้อ)
    if (selectedSale.customerId) {
      const currentCustomers = JSON.parse(localStorage.getItem('pos_customers') || '[]');
      const updatedCustomers = currentCustomers.map(customer => {
        if (customer.id === selectedSale.customerId) {
          return {
            ...customer,
            totalPurchases: Math.max(0, customer.totalPurchases - selectedSale.total),
            loyaltyPoints: Math.max(0, (customer.loyaltyPoints || 0) - (selectedSale.pointsEarned || 0))
          };
        }
        return customer;
      });
      localStorage.setItem('pos_customers', JSON.stringify(updatedCustomers));
    }

    toast({ title: "คืนเงินสำเร็จ", description: `คืนเงิน ${selectedSale.total.toLocaleString()} บาท เรียบร้อยแล้ว` });
    setIsRefundDialogOpen(false);
    setSelectedSale(null);
    
    // รีเฟรชข้อมูล
    window.dispatchEvent(new Event('storage'));
  };

  const printReceipt = (sale) => {
    setSelectedSale(sale);
    setIsReceiptDialogOpen(true);
  };

  const printTaxInvoice = (sale) => {
    setSelectedSale(sale);
    setIsTaxInvoiceDialogOpen(true);
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

    const dataToExport = filteredSales.map(sale => ({
      'Sale ID': sale.id,
      'Date': new Date(sale.timestamp).toLocaleString('th-TH'),
      'Customer': sale.customer,
      'Items': sale.items.map(item => `${item.name} (x${item.quantity})`).join(', '),
      'Subtotal': sale.subtotal.toFixed(2),
      'Tax': sale.tax.toFixed(2),
      'Total': sale.total.toFixed(2),
      'Payment Method': sale.paymentMethod,
      'Points Used': sale.pointsUsed || 0,
      'Points Earned': sale.pointsEarned || 0
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "ส่งออกรายงานสำเร็จ", description: "ไฟล์ CSV กำลังถูกดาวน์โหลด" });
  };

  const getTotalSales = () => filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const getTotalItems = () => filteredSales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ประวัติการขาย</h1>
          <p className="text-gray-600 mt-1">ดูประวัติการขายและจัดการการคืนเงิน</p>
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
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ยอดขายรวม</p>
              <p className="text-2xl font-bold text-gray-900">฿{getTotalSales().toLocaleString()}</p>
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
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">จำนวนรายการ</p>
              <p className="text-2xl font-bold text-gray-900">{filteredSales.length}</p>
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
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">สินค้าขายได้</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalItems()}</p>
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
              <User className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">ลูกค้าไม่ซ้ำ</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(filteredSales.map(s => s.customer)).size}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ตัวกรอง */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="ค้นหาตามลูกค้า, รหัสการขาย, หรือสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Date Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">กรองตามวันที่:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'ทั้งหมด' },
                { value: 'today', label: 'วันนี้' },
                { value: 'week', label: 'สัปดาห์นี้' },
                { value: 'month', label: 'เดือนนี้' },
                { value: 'year', label: 'ปีนี้' },
                { value: 'custom', label: 'กำหนดเอง' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedDateRange(filter.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDateRange === filter.value
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {selectedDateRange === 'custom' && (
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

          {/* Results Summary */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-gray-600">
              แสดง {filteredSales.length} รายการ จากทั้งหมด {sales.length} รายการ
            </span>
            <span className="text-sm font-medium text-blue-600">
              ยอดรวม: ฿{filteredSales.reduce((sum, sale) => sum + sale.total, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ตารางประวัติการขาย */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  รายการ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ลูกค้า
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สินค้า
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ยอดรวม
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <motion.tr
                  key={sale.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{sale.id}</div>
                    <div className="text-sm text-gray-500">{sale.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{sale.customer}</div>
                    {sale.pointsUsed > 0 && (
                      <div className="text-xs text-blue-600">ใช้แต้ม: {sale.pointsUsed}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {sale.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">฿{sale.total.toLocaleString()}</div>
                    {sale.discount > 0 && (
                      <div className="text-xs text-green-600">ส่วนลด: ฿{sale.discount.toLocaleString()}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sale.timestamp).toLocaleString('th-TH')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => printReceipt(sale)}
                      >
                        <Receipt className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => printTaxInvoice(sale)}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      {hasPermission(PERMISSIONS.POS_REFUND) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRefund(sale)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Dialog */}
      {isRefundDialogOpen && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsRefundDialogOpen(false)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">คืนเงิน</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">รหัสการขาย: {selectedSale.id}</p>
                <p className="text-sm text-gray-600">ลูกค้า: {selectedSale.customer}</p>
                <p className="text-lg font-bold">ยอดคืน: ฿{selectedSale.total.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เหตุผลการคืนเงิน</label>
                <textarea
                  id="refundReason"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ระบุเหตุผลการคืนเงิน..."
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)} className="flex-1">
                ยกเลิก
              </Button>
              <Button 
                onClick={() => {
                  const reason = document.getElementById('refundReason').value;
                  processRefund(reason || 'ไม่ระบุเหตุผล');
                }}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                คืนเงิน
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Dialog */}
      {isReceiptDialogOpen && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsReceiptDialogOpen(false)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">ใบเสร็จ</h2>
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h3 className="text-lg font-bold">ร้านค้า</h3>
                <p className="text-sm text-gray-600">ใบเสร็จรับเงิน</p>
                <p className="text-sm text-gray-600">{selectedSale.id}</p>
                <p className="text-sm text-gray-600">{new Date(selectedSale.timestamp).toLocaleString('th-TH')}</p>
              </div>
              
              <div>
                <p className="font-medium">ลูกค้า: {selectedSale.customer}</p>
                <div className="mt-2 space-y-1">
                  {selectedSale.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>฿{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>ยอดรวม:</span>
                  <span>฿{selectedSale.subtotal.toLocaleString()}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>ส่วนลด:</span>
                    <span>-฿{selectedSale.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>ภาษี:</span>
                  <span>฿{selectedSale.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>รวมทั้งสิ้น:</span>
                  <span>฿{selectedSale.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>ชำระโดย: {selectedSale.paymentMethod}</p>
                <p>ขอบคุณที่ใช้บริการ</p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button variant="outline" onClick={() => setIsReceiptDialogOpen(false)} className="flex-1">
                ปิด
              </Button>
              <Button onClick={() => window.print()} className="flex-1">
                พิมพ์
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tax Invoice Dialog */}
      {isTaxInvoiceDialogOpen && selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsTaxInvoiceDialogOpen(false)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">ใบกำกับภาษี</h2>
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                {settings?.system?.logo && (
                  <div className="mb-3">
                    <img 
                      src={settings.system.logo} 
                      alt="Store Logo" 
                      className="w-20 h-20 object-contain mx-auto"
                    />
                  </div>
                )}
                <h3 className="text-lg font-bold">{settings?.system?.storeName || 'ร้านค้า'}</h3>
                {settings?.system?.address && (
                  <p className="text-sm text-gray-600 mt-1">{settings.system.address}</p>
                )}
                {(settings?.system?.phone || settings?.system?.email) && (
                  <div className="text-sm text-gray-600 mt-1">
                    {settings?.system?.phone && <p>โทร: {settings.system.phone}</p>}
                    {settings?.system?.email && <p>อีเมล: {settings.system.email}</p>}
                  </div>
                )}
                {settings?.system?.taxId && (
                  <p className="text-sm text-gray-600 mt-1">เลขประจำตัวผู้เสียภาษี: {settings.system.taxId}</p>
                )}
                <p className="text-sm text-gray-600 mt-2 font-medium">ใบกำกับภาษีอย่างย่อ</p>
                <p className="text-sm text-gray-600">เลขที่: {selectedSale.id}</p>
                <p className="text-sm text-gray-600">วันที่: {new Date(selectedSale.timestamp).toLocaleString('th-TH')}</p>
              </div>
              
              <div>
                <p className="font-medium">ลูกค้า: {selectedSale.customer}</p>
                <div className="mt-2 space-y-1">
                  {selectedSale.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>฿{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>ราคารวม:</span>
                  <span>฿{selectedSale.subtotal.toLocaleString()}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>ส่วนลด:</span>
                    <span>-฿{selectedSale.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>ภาษีมูลค่าเพิ่ม 7%:</span>
                  <span>฿{selectedSale.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>รวมทั้งสิ้น:</span>
                  <span>฿{selectedSale.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>หมายเหตุ: ใบกำกับภาษีนี้เป็นใบกำกับภาษีอย่างย่อ</p>
                <p>ชำระโดย: {selectedSale.paymentMethod}</p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button variant="outline" onClick={() => setIsTaxInvoiceDialogOpen(false)} className="flex-1">
                ปิด
              </Button>
              <Button onClick={() => window.print()} className="flex-1">
                พิมพ์
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundHistory; 