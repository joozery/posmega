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
import { salesService } from '@/services/salesService';
import ReceiptDialog from '@/components/ReceiptDialog';
import EditSaleDialog from '@/components/EditSaleDialog';
import { useNavigate } from 'react-router-dom';

const RefundHistory = () => {
  const { toast } = useToast();
  const { hasPermission, user } = useAuth();
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [selectedSale, setSelectedSale] = useState(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isTaxInvoiceDialogOpen, setIsTaxInvoiceDialogOpen] = useState(false);
  const [isEditSaleDialogOpen, setIsEditSaleDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSales = async () => {
      try {
        setLoading(true);
        const response = await salesService.getAllSales();
        console.log('Sales API Response:', response);
        if (response.sales) {
          console.log('Sales Data:', response.sales);
          console.log('First Sale:', response.sales[0]);
          console.log('First Sale Items:', response.sales[0]?.items);
          console.log('First Sale Total Type:', typeof response.sales[0]?.total);
          console.log('First Sale Total Value:', response.sales[0]?.total);
          console.log('First Sale Discount Type:', typeof response.sales[0]?.discount);
          console.log('First Sale Discount Value:', response.sales[0]?.discount);
          setSales(response.sales);
          setFilteredSales(response.sales);
        }
      } catch (error) {
        console.error('Error loading sales:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดประวัติการขายได้",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, [toast]);

  useEffect(() => {
    let filtered = sales;

    // กรองตามคำค้นหา
    if (searchTerm) {
      filtered = filtered.filter(sale => 
        (sale.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.items || []).some(item => (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
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
          const saleDate = new Date(sale.timestamp || sale.created_at || new Date());
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

  const processRefund = async (refundReason) => {
    if (!selectedSale) return;

    try {
      // เรียกใช้ API คืนเงิน
      await salesService.processRefund(selectedSale.id, {
        reason: refundReason,
        refundAmount: selectedSale.total,
        refundMethod: 'cash'
      });

      toast({ title: "คืนเงินสำเร็จ", description: `คืนเงิน ${selectedSale.total.toLocaleString()} บาท เรียบร้อยแล้ว` });
      setIsRefundDialogOpen(false);
      setSelectedSale(null);
      
      // รีเฟรชข้อมูลการขาย
      const response = await salesService.getAllSales();
      if (response.sales) {
        setSales(response.sales);
        setFilteredSales(response.sales);
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      
      // แสดงข้อความแจ้งเตือนที่เหมาะสม
      let errorMessage = "ไม่สามารถคืนเงินได้ กรุณาลองใหม่อีกครั้ง";
      
      if (error.response?.data?.error) {
        if (error.response.data.error.includes('already been refunded')) {
          errorMessage = "รายการนี้ถูกคืนเงินแล้ว ไม่สามารถคืนซ้ำได้";
        } else if (error.response.data.error.includes('exceed sale total')) {
          errorMessage = "จำนวนเงินที่คืนเกินกว่ายอดขาย";
        } else {
          errorMessage = error.response.data.error;
        }
      }
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const printReceipt = (sale) => {
    setSelectedSale(sale);
    setIsReceiptDialogOpen(true);
  };

  const printTaxInvoice = (sale) => {
    setSelectedSale(sale);
    setIsTaxInvoiceDialogOpen(true);
  };

  const handleEditSale = (sale) => {
    setSelectedSale(sale);
    setIsEditSaleDialogOpen(true);
  };

  const handleConfirmEditSale = async (sale, reason, details) => {
    try {
      // 1. ทำ Refund
      await salesService.refundSale(sale.id, {
        reason: 'edit_sale',
        refundAmount: sale.total, // เพิ่ม refundAmount ที่ API ต้องการ
        refundMethod: 'cash',
        edit_reason: reason,
        edit_details: details,
        edited_by: user?.id,
        edited_at: new Date().toISOString().slice(0, 19).replace('T', ' ') // แปลงเป็น MySQL datetime format
      });

      toast({
        title: "✅ แก้ไขการขายสำเร็จ",
        description: `ยกเลิกการขาย #${sale.id} แล้ว กรุณาไปขายสินค้าใหม่`,
        duration: 5000,
      });

      // 2. ไปหน้า POS เพื่อขายใหม่
      navigate('/pos', { 
        state: { 
          editMode: true, 
          originalSaleId: sale.id,
          editReason: reason,
          editDetails: details
        } 
      });

    } catch (error) {
      console.error('Error editing sale:', error);
      toast({
        title: "❌ เกิดข้อผิดพลาด",
        description: "ไม่สามารถแก้ไขการขายได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
      throw error;
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

    const dataToExport = filteredSales.map(sale => ({
      'Sale ID': sale.id,
              'Date': new Date(sale.timestamp || sale.created_at || new Date()).toLocaleString('th-TH'),
              'Customer': sale.customer || sale.customer_name || 'ลูกค้าทั่วไป',
              'Items': (sale.items || []).map(item => `${item.name || 'สินค้าไม่ระบุ'} (x${item.quantity || 0})`).join(', '),
              'Subtotal': (sale.subtotal || 0).toFixed(2),
        'Tax': (sale.tax || 0).toFixed(2),
        'Total': (sale.total || 0).toFixed(2),
              'Payment Method': sale.paymentMethod || sale.payment_method || 'ไม่ระบุ',
      'Status': sale.status || 'completed',
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

  const getTotalSales = () => filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total || 0), 0);
  const getTotalItems = () => filteredSales.reduce((sum, sale) => sum + (sale.items || []).reduce((itemSum, item) => itemSum + (item.quantity || 0), 0), 0);

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
                {new Set(filteredSales.map(s => s.customer_name || s.customer).filter(Boolean)).size}
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
              ยอดรวม: ฿{filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total || 0), 0).toLocaleString()}
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
                  สถานะ
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
                    <div className="text-sm text-gray-500">{sale.payment_method || sale.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{sale.customer_name || sale.customer || 'ลูกค้าทั่วไป'}</div>
                    {sale.pointsUsed > 0 && (
                      <div className="text-xs text-blue-600">ใช้แต้ม: {sale.pointsUsed}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {(sale.items || []).length > 0 ? 
                        sale.items.map(item => `${item.product_name || item.name || 'สินค้าไม่ระบุ'} (x${item.quantity || 0})`).join(', ') :
                        'ไม่มีรายการสินค้า'
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">฿{parseFloat(sale.total || 0).toLocaleString()}</div>
                    {sale.discount > 0 && (
                      <div className="text-xs text-green-600">ส่วนลด: ฿{parseFloat(sale.discount || 0).toLocaleString()}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sale.created_at ? new Date(sale.created_at).toLocaleString('th-TH') : 'ไม่ระบุวันที่'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (sale.status || 'completed') === 'refunded' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {(sale.status || 'completed') === 'refunded' ? 'คืนเงินแล้ว' : 'สำเร็จ'}
                      </span>
                      {(sale.status || 'completed') === 'refunded' && (
                        <span className="text-xs text-gray-500 mt-1">
                          (ไม่สามารถคืนซ้ำได้)
                        </span>
                      )}
                    </div>
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
                      {/* เพิ่มปุ่มแก้ไขการขาย */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSale(sale)}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        ✏️ แก้ไข
                      </Button>
                      {hasPermission(PERMISSIONS.POS_REFUND) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRefund(sale)}
                          disabled={(sale.status || 'completed') === 'refunded'}
                          title={(sale.status || 'completed') === 'refunded' ? 'รายการนี้ถูกคืนเงินแล้ว' : ''}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">คืนเงิน</h3>
            <p className="text-gray-600 mb-4">
              คุณต้องการคืนเงินสำหรับการขาย #{selectedSale.id} จำนวน ฿{selectedSale.total.toLocaleString()} บาท หรือไม่?
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsRefundDialogOpen(false)}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={() => processRefund('customer_request')}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                คืนเงิน
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Dialog */}
      <ReceiptDialog
        isOpen={isReceiptDialogOpen}
        onClose={() => setIsReceiptDialogOpen(false)}
        sale={selectedSale}
        type="receipt"
      />

      {/* Tax Invoice Dialog */}
      <ReceiptDialog
        isOpen={isTaxInvoiceDialogOpen}
        onClose={() => setIsTaxInvoiceDialogOpen(false)}
        sale={selectedSale}
        type="tax-invoice"
      />

      {/* EditSaleDialog */}
      <EditSaleDialog 
        isOpen={isEditSaleDialogOpen} 
        onClose={() => setIsEditSaleDialogOpen(false)} 
        sale={selectedSale}
        onConfirmEdit={handleConfirmEditSale}
      />
    </div>
  );
};

export default RefundHistory; 