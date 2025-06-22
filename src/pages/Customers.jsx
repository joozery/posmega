
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import CustomerDialog from '@/components/CustomerDialog';

const Customers = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  useEffect(() => {
    const savedCustomers = localStorage.getItem('pos_customers');
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    } else {
      const defaultCustomers = [
        {
          id: 1,
          name: 'คุณสมชาย ใจดี',
          phone: '081-234-5678',
          email: 'somchai@email.com',
          address: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
          totalPurchases: 15420,
          lastPurchase: '2024-06-15',
          joinDate: '2024-01-15',
          loyaltyPoints: 154
        },
        {
          id: 2,
          name: 'คุณสมหญิง รักดี',
          phone: '082-345-6789',
          email: 'somying@email.com',
          address: '456 ถนนพหลโยธิน แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900',
          totalPurchases: 8950,
          lastPurchase: '2024-06-18',
          joinDate: '2024-02-20',
          loyaltyPoints: 89
        },
        {
          id: 3,
          name: 'คุณสมศักดิ์ มีสุข',
          phone: '083-456-7890',
          email: 'somsak@email.com',
          address: '789 ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400',
          totalPurchases: 23100,
          lastPurchase: '2024-06-20',
          joinDate: '2023-12-10',
          loyaltyPoints: 231
        }
      ];
      setCustomers(defaultCustomers);
      localStorage.setItem('pos_customers', JSON.stringify(defaultCustomers));
    }
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchTerm)) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const saveCustomer = (customerData) => {
    let updatedCustomers;
    
    if (editingCustomer) {
      updatedCustomers = customers.map(c => 
        c.id === editingCustomer.id ? { ...c, ...customerData } : c
      );
      toast({
        title: "แก้ไขลูกค้าสำเร็จ",
        description: `${customerData.name} ถูกแก้ไขแล้ว`
      });
    } else {
      const newCustomer = {
        ...customerData,
        id: Date.now(),
        totalPurchases: 0,
        lastPurchase: null,
        joinDate: new Date().toISOString().split('T')[0],
        loyaltyPoints: 0
      };
      updatedCustomers = [...customers, newCustomer];
      toast({
        title: "เพิ่มลูกค้าสำเร็จ",
        description: `${customerData.name} ถูกเพิ่มแล้ว`
      });
    }
    
    setCustomers(updatedCustomers);
    localStorage.setItem('pos_customers', JSON.stringify(updatedCustomers));
    setIsDialogOpen(false);
    setEditingCustomer(null);
  };

  const deleteCustomer = (id) => {
    const updatedCustomers = customers.filter(c => c.id !== id);
    setCustomers(updatedCustomers);
    localStorage.setItem('pos_customers', JSON.stringify(updatedCustomers));
    toast({
      title: "ลบลูกค้าสำเร็จ",
      description: "ข้อมูลลูกค้าถูกลบออกจากระบบแล้ว"
    });
  };

  const editCustomer = (customer) => {
    setEditingCustomer(customer);
    setIsDialogOpen(true);
  };

  const addNewCustomer = () => {
    setEditingCustomer(null);
    setIsDialogOpen(true);
  };

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);
  const avgPurchase = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการลูกค้า</h1>
          <p className="text-gray-600 mt-1">จัดการข้อมูลลูกค้าและประวัติการซื้อ</p>
        </div>
        <Button onClick={addNewCustomer}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มลูกค้าใหม่
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 shadow-sm border">
          <User className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="text-2xl font-bold text-gray-900">{totalCustomers}</h3>
          <p className="text-gray-600 text-sm mt-1">ลูกค้าทั้งหมด</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-6 shadow-sm border">
          <Calendar className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="text-2xl font-bold text-gray-900">฿{totalRevenue.toLocaleString()}</h3>
          <p className="text-gray-600 text-sm mt-1">ยอดขายรวม</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl p-6 shadow-sm border">
          <User className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="text-2xl font-bold text-gray-900">฿{avgPurchase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <p className="text-gray-600 text-sm mt-1">ยอดซื้อเฉลี่ย</p>
        </motion.div>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="ค้นหาลูกค้า (ชื่อ, เบอร์โทร, อีเมล)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer, index) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border card-hover flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-lg">
                    {customer.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                  <p className="text-sm text-gray-500">
                    สมาชิกตั้งแต่ {new Date(customer.joinDate).toLocaleDateString('th-TH')}
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => editCustomer(customer)}><Edit className="w-4 h-4" /></Button>
                <Button size="icon" variant="outline" className="w-8 h-8 text-red-600 hover:text-red-700" onClick={() => deleteCustomer(customer.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>

            <div className="space-y-3 flex-grow">
              <div className="flex items-center space-x-2 text-sm text-gray-600"><Phone className="w-4 h-4" /><span>{customer.phone}</span></div>
              {customer.email && (<div className="flex items-center space-x-2 text-sm text-gray-600"><Mail className="w-4 h-4" /><span className="truncate">{customer.email}</span></div>)}
              {customer.address && (<div className="flex items-start space-x-2 text-sm text-gray-600"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /><span className="line-clamp-2">{customer.address}</span></div>)}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm text-gray-600">ยอดซื้อรวม</p>
                  <p className="font-semibold text-green-600">฿{(customer.totalPurchases || 0).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">ซื้อล่าสุด</p>
                  <p className="text-sm font-medium">{customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString('th-TH') : 'ยังไม่มี'}</p>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-yellow-600 bg-yellow-100 p-2 rounded-lg">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">แต้มสะสม: {customer.loyaltyPoints || 0} แต้ม</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบลูกค้า</h3>
          <p className="text-gray-500">ลองค้นหาด้วยคำอื่น หรือเพิ่มลูกค้าใหม่</p>
        </div>
      )}

      <CustomerDialog isOpen={isDialogOpen} onClose={() => { setIsDialogOpen(false); setEditingCustomer(null); }} onSave={saveCustomer} customer={editingCustomer} />
    </div>
  );
};

export default Customers;
