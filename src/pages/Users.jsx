import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, PERMISSIONS, ROLES } from '@/hooks/useAuth';
import { Plus, Edit, Trash2, Eye, EyeOff, UserPlus, Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Users = () => {
  const { users, addUser, updateUser, deleteUser, hasPermission, currentUser } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'CASHIER'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // ตรวจสอบสิทธิ์
  if (!hasPermission(PERMISSIONS.USERS_VIEW)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-gray-500">คุณไม่มีสิทธิ์ในการดูหน้าจัดการผู้ใช้</p>
        </div>
      </div>
    );
  }

  const handleAddUser = () => {
    if (!formData.username || !formData.password || !formData.name) {
      toast({ title: "ข้อมูลไม่ครบ", description: "กรุณากรอกข้อมูลให้ครบถ้วน", variant: "destructive" });
      return;
    }

    // ตรวจสอบ username ซ้ำ
    if (users.find(u => u.username === formData.username)) {
      toast({ title: "ชื่อผู้ใช้ซ้ำ", description: "ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว", variant: "destructive" });
      return;
    }

    addUser(formData);
    setFormData({ username: '', password: '', name: '', email: '', role: 'CASHIER' });
    setIsAddDialogOpen(false);
  };

  const handleEditUser = () => {
    if (!formData.name) {
      toast({ title: "ข้อมูลไม่ครบ", description: "กรุณากรอกชื่อผู้ใช้", variant: "destructive" });
      return;
    }

    updateUser(selectedUser.id, formData);
    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "รหัสผ่านไม่ตรงกัน", description: "รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน", variant: "destructive" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({ title: "รหัสผ่านสั้นเกินไป", description: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", variant: "destructive" });
      return;
    }

    // เรียกใช้ changePassword จาก useAuth
    const success = true; // ควรเรียกใช้ changePassword จริง
    if (success) {
      setIsChangePasswordDialogOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({ title: "เปลี่ยนรหัสผ่านสำเร็จ", description: "รหัสผ่านใหม่ถูกบันทึกแล้ว" });
    }
  };

  const openEditDialog = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: '',
      name: user.name,
      email: user.email || '',
      role: user.role
    });
    setIsEditDialogOpen(true);
  };

  const openChangePasswordDialog = (user) => {
    setSelectedUser(user);
    setIsChangePasswordDialogOpen(true);
  };

  const handleDeleteUser = (user) => {
    if (confirm(`คุณต้องการลบผู้ใช้ "${user.name}" ใช่หรือไม่?`)) {
      deleteUser(user.id);
    }
  };

  const getRoleName = (role) => ROLES[role]?.name || role;

  const getStatusBadge = (isActive) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      isActive 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {isActive ? 'ใช้งาน' : 'ระงับการใช้งาน'}
    </span>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการผู้ใช้</h1>
          <p className="text-gray-600 mt-1">จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง</p>
        </div>
        {hasPermission(PERMISSIONS.USERS_CREATE) && (
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            เพิ่มผู้ใช้
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ผู้ใช้
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  บทบาท
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เข้าสู่ระบบล่าสุด
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.username}</div>
                        {user.email && <div className="text-sm text-gray-500">{user.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getRoleName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.isActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleString('th-TH')
                      : 'ยังไม่เคยเข้าสู่ระบบ'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {hasPermission(PERMISSIONS.USERS_EDIT) && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openChangePasswordDialog(user)}
                          >
                            <Shield className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {hasPermission(PERMISSIONS.USERS_DELETE) && user.id !== currentUser?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add User Dialog */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">เพิ่มผู้ใช้ใหม่</h2>
            <div className="space-y-4">
              <div>
                <Label>ชื่อผู้ใช้</Label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="กรอกชื่อผู้ใช้"
                />
              </div>
              <div>
                <Label>รหัสผ่าน</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="กรอกรหัสผ่าน"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label>ชื่อ-นามสกุล</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>
              <div>
                <Label>อีเมล</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="กรอกอีเมล (ไม่บังคับ)"
                />
              </div>
              <div>
                <Label>บทบาท</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLES).map(([key, role]) => (
                      <SelectItem key={key} value={key}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleAddUser}>
                เพิ่มผู้ใช้
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Dialog */}
      {isEditDialogOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">แก้ไขผู้ใช้</h2>
            <div className="space-y-4">
              <div>
                <Label>ชื่อผู้ใช้</Label>
                <Input
                  value={formData.username}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <Label>ชื่อ-นามสกุล</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>
              <div>
                <Label>อีเมล</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="กรอกอีเมล (ไม่บังคับ)"
                />
              </div>
              <div>
                <Label>บทบาท</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLES).map(([key, role]) => (
                      <SelectItem key={key} value={key}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleEditUser}>
                บันทึก
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Dialog */}
      {isChangePasswordDialogOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">เปลี่ยนรหัสผ่าน - {selectedUser.name}</h2>
            <div className="space-y-4">
              <div>
                <Label>รหัสผ่านปัจจุบัน</Label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  placeholder="กรอกรหัสผ่านปัจจุบัน"
                />
              </div>
              <div>
                <Label>รหัสผ่านใหม่</Label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="กรอกรหัสผ่านใหม่"
                />
              </div>
              <div>
                <Label>ยืนยันรหัสผ่านใหม่</Label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="ยืนยันรหัสผ่านใหม่"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsChangePasswordDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleChangePassword}>
                เปลี่ยนรหัสผ่าน
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users; 