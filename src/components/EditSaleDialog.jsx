import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, RotateCcw, ShoppingCart } from 'lucide-react';

const EditSaleDialog = ({ isOpen, onClose, sale, onConfirmEdit }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('กรุณาเลือกเหตุผลในการแก้ไข');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmEdit(sale, reason, details);
      onClose();
    } catch (error) {
      console.error('Error in edit sale:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      setDetails('');
      onClose();
    }
  };

  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      <div className="relative bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-orange-600" />
            แก้ไขการขาย #{sale.id}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        </div>

        {/* Warning Alert */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-orange-800">⚠️ คำเตือน: การแก้ไขการขาย</h3>
              <p className="text-sm text-orange-700 mt-1">
                การแก้ไขการขายจะทำการยกเลิกการขายเดิมและให้คุณขายสินค้าใหม่ 
                ข้อมูลการขายเดิมจะถูกเก็บไว้ในประวัติการคืนเงิน
              </p>
            </div>
          </div>
        </div>

        {/* Original Sale Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-3">📋 ข้อมูลการขายเดิม</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">ลูกค้า:</span>
              <span className="ml-2 font-medium">{sale.customer_name || sale.customer || 'ลูกค้าทั่วไป'}</span>
            </div>
            <div>
              <span className="text-gray-600">ยอดรวม:</span>
              <span className="ml-2 font-medium text-green-600">฿{parseFloat(sale.total || 0).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">วันที่:</span>
              <span className="ml-2 font-medium">
                {sale.created_at ? new Date(sale.created_at).toLocaleString('th-TH') : 'ไม่ระบุวันที่'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">ช่องทางชำระ:</span>
              <span className="ml-2 font-medium">{sale.payment_method || sale.paymentMethod || 'ไม่ระบุ'}</span>
            </div>
          </div>
          
          {/* Sale Items */}
          <div className="mt-3">
            <span className="text-gray-600 text-sm">สินค้า:</span>
            <div className="mt-1 space-y-1">
              {sale.items && sale.items.length > 0 ? (
                sale.items.map((item, index) => (
                  <div key={index} className="text-sm bg-white rounded px-2 py-1">
                    • {item.product_name || item.name || 'สินค้าไม่ระบุ'} x{item.quantity} 
                    @ ฿{parseFloat(item.price || 0).toLocaleString()}
                  </div>
                ))
              ) : (
                <span className="text-gray-500 text-sm">ไม่มีรายการสินค้า</span>
              )}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
              เหตุผลในการแก้ไข <span className="text-red-500">*</span>
            </Label>
            <Select value={reason} onValueChange={setReason} required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="เลือกเหตุผลในการแก้ไข" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wrong_product">ขายสินค้าผิด</SelectItem>
                <SelectItem value="wrong_quantity">จำนวนสินค้าผิด</SelectItem>
                <SelectItem value="wrong_price">ราคาสินค้าผิด</SelectItem>
                <SelectItem value="wrong_customer">ลูกค้าผิด</SelectItem>
                <SelectItem value="wrong_payment">ช่องทางชำระผิด</SelectItem>
                <SelectItem value="duplicate_sale">ขายซ้ำ</SelectItem>
                <SelectItem value="other">อื่นๆ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="details" className="text-sm font-medium text-gray-700">
              รายละเอียดเพิ่มเติม
            </Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="อธิบายรายละเอียดเพิ่มเติม (ถ้ามี)..."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลังประมวลผล...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  ยกเลิกการขายและขายใหม่
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Process Flow Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            ขั้นตอนการแก้ไข
          </h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>ยกเลิกการขายเดิม (Refund)</li>
            <li>บันทึกเหตุผลการแก้ไข</li>
            <li>นำไปยังหน้า POS เพื่อขายสินค้าใหม่</li>
            <li>บันทึกการขายใหม่</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default EditSaleDialog;
