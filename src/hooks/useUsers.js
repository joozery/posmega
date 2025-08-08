import { useState, useCallback } from 'react';
import { userService } from '@/services/userService';
import { useToast } from '@/components/ui/use-toast';

export const useUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Fetch users error:', error);
      setError(error.response?.data?.error || 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.response?.data?.error || 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create new user
  const createUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.createUser(userData);
      setUsers(prev => [...prev, response.user]);
      toast({
        title: "เพิ่มผู้ใช้สำเร็จ",
        description: `ผู้ใช้ ${response.user.name} ถูกเพิ่มเรียบร้อยแล้ว`
      });
      return response.user;
    } catch (error) {
      console.error('Create user error:', error);
      const errorMessage = error.response?.data?.error || 'เกิดข้อผิดพลาดในการเพิ่มผู้ใช้';
      setError(errorMessage);
      toast({
        title: "เพิ่มผู้ใช้ไม่สำเร็จ",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update user
  const updateUser = useCallback(async (id, userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.updateUser(id, userData);
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, ...response.user } : user
      ));
      toast({
        title: "อัปเดตผู้ใช้สำเร็จ",
        description: `ข้อมูลผู้ใช้ ${response.user.name} ถูกอัปเดตเรียบร้อยแล้ว`
      });
      return response.user;
    } catch (error) {
      console.error('Update user error:', error);
      const errorMessage = error.response?.data?.error || 'เกิดข้อผิดพลาดในการอัปเดตผู้ใช้';
      setError(errorMessage);
      toast({
        title: "อัปเดตผู้ใช้ไม่สำเร็จ",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Delete user
  const deleteUser = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await userService.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
      toast({
        title: "ลบผู้ใช้สำเร็จ",
        description: "ผู้ใช้ถูกลบเรียบร้อยแล้ว"
      });
    } catch (error) {
      console.error('Delete user error:', error);
      const errorMessage = error.response?.data?.error || 'เกิดข้อผิดพลาดในการลบผู้ใช้';
      setError(errorMessage);
      toast({
        title: "ลบผู้ใช้ไม่สำเร็จ",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Change user password
  const changeUserPassword = useCallback(async (id, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      await userService.changeUserPassword(id, newPassword);
      toast({
        title: "เปลี่ยนรหัสผ่านสำเร็จ",
        description: "รหัสผ่านถูกเปลี่ยนเรียบร้อยแล้ว"
      });
    } catch (error) {
      console.error('Change user password error:', error);
      const errorMessage = error.response?.data?.error || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน';
      setError(errorMessage);
      toast({
        title: "เปลี่ยนรหัสผ่านไม่สำเร็จ",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Toggle user status
  const toggleUserStatus = useCallback(async (id, isActive) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.toggleUserStatus(id, isActive);
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, is_active: isActive } : user
      ));
      toast({
        title: isActive ? "เปิดใช้งานผู้ใช้สำเร็จ" : "ปิดใช้งานผู้ใช้สำเร็จ",
        description: `ผู้ใช้ถูก${isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}เรียบร้อยแล้ว`
      });
      return response.user;
    } catch (error) {
      console.error('Toggle user status error:', error);
      const errorMessage = error.response?.data?.error || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะผู้ใช้';
      setError(errorMessage);
      toast({
        title: "เปลี่ยนสถานะผู้ใช้ไม่สำเร็จ",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    changeUserPassword,
    toggleUserStatus
  };
}; 