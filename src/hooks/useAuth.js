import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

// กำหนดสิทธิ์การเข้าถึง
export const PERMISSIONS = {
  // ระบบ POS
  POS_VIEW: 'pos_view',
  POS_ADD_TO_CART: 'pos_add_to_cart',
  POS_PROCESS_SALE: 'pos_process_sale',
  POS_REFUND: 'pos_refund',
  
  // จัดการสินค้า
  PRODUCTS_VIEW: 'products_view',
  PRODUCTS_CREATE: 'products_create',
  PRODUCTS_EDIT: 'products_edit',
  PRODUCTS_DELETE: 'products_delete',
  
  // จัดการลูกค้า
  CUSTOMERS_VIEW: 'customers_view',
  CUSTOMERS_CREATE: 'customers_create',
  CUSTOMERS_EDIT: 'customers_edit',
  CUSTOMERS_DELETE: 'customers_delete',
  
  // รายงาน
  REPORTS_VIEW: 'reports_view',
  REPORTS_EXPORT: 'reports_export',
  
  // การตั้งค่า
  SETTINGS_VIEW: 'settings_view',
  SETTINGS_EDIT: 'settings_edit',
  
  // จัดการผู้ใช้
  USERS_VIEW: 'users_view',
  USERS_CREATE: 'users_create',
  USERS_EDIT: 'users_edit',
  USERS_DELETE: 'users_delete',
  
  // บาร์โค้ด
  BARCODES_VIEW: 'barcodes_view',
  BARCODES_GENERATE: 'barcodes_generate',
  BARCODES_PRINT: 'barcodes_print'
};

// กำหนด Role พื้นฐาน
export const ROLES = {
  ADMIN: {
    name: 'ผู้ดูแลระบบ',
    permissions: Object.values(PERMISSIONS)
  },
  MANAGER: {
    name: 'ผู้จัดการ',
    permissions: [
      PERMISSIONS.POS_VIEW, PERMISSIONS.POS_ADD_TO_CART, PERMISSIONS.POS_PROCESS_SALE,
      PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.PRODUCTS_CREATE, PERMISSIONS.PRODUCTS_EDIT,
      PERMISSIONS.CUSTOMERS_VIEW, PERMISSIONS.CUSTOMERS_CREATE, PERMISSIONS.CUSTOMERS_EDIT,
      PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_EXPORT,
      PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_EDIT,
      PERMISSIONS.BARCODES_VIEW, PERMISSIONS.BARCODES_GENERATE, PERMISSIONS.BARCODES_PRINT
    ]
  },
  CASHIER: {
    name: 'พนักงานขาย',
    permissions: [
      PERMISSIONS.POS_VIEW, PERMISSIONS.POS_ADD_TO_CART, PERMISSIONS.POS_PROCESS_SALE,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW, PERMISSIONS.CUSTOMERS_CREATE,
      PERMISSIONS.REPORTS_VIEW
    ]
  },
  VIEWER: {
    name: 'ผู้ดูข้อมูล',
    permissions: [
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.REPORTS_VIEW
    ]
  }
};

export const useAuth = () => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // โหลดข้อมูลผู้ใช้
  const loadUsers = useCallback(() => {
    const savedUsers = localStorage.getItem('pos_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // สร้าง admin เริ่มต้น
      const defaultAdmin = {
        id: 1,
        username: 'admin',
        password: 'admin123', // ควรเข้ารหัสในระบบจริง
        name: 'ผู้ดูแลระบบ',
        email: 'admin@example.com',
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: null
      };
      setUsers([defaultAdmin]);
      localStorage.setItem('pos_users', JSON.stringify([defaultAdmin]));
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    // ตรวจสอบ session หลังจาก users โหลดเสร็จ
    console.log('Checking session, users count:', users.length);
    if (users.length > 0) {
      const session = localStorage.getItem('pos_session');
      console.log('Session from localStorage:', session);
      if (session) {
        try {
          const sessionData = JSON.parse(session);
          console.log('Session data:', sessionData);
          const user = users.find(u => u.id === sessionData.userId);
          console.log('Found user:', user);
          if (user && user.isActive) {
            console.log('Setting authenticated user:', user);
            setCurrentUser(user);
            setIsAuthenticated(true);
          } else {
            console.log('User not found or inactive, removing session');
            localStorage.removeItem('pos_session');
          }
        } catch (error) {
          console.error('Error parsing session:', error);
          localStorage.removeItem('pos_session');
        }
      }
    }
  }, [users]);

  // เข้าสู่ระบบ
  const login = useCallback((username, password) => {
    console.log('Login attempt:', { username, usersCount: users.length });
    
    const user = users.find(u => 
      u.username === username && 
      u.password === password && 
      u.isActive
    );

    if (user) {
      console.log('User found:', user);
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      // อัพเดท lastLogin
      const updatedUsers = users.map(u => 
        u.id === user.id 
          ? { ...u, lastLogin: new Date().toISOString() }
          : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('pos_users', JSON.stringify(updatedUsers));
      
      // สร้าง session
      const session = {
        userId: user.id,
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 ชั่วโมง
      };
      localStorage.setItem('pos_session', JSON.stringify(session));
      
      console.log('Session created:', session);
      toast({ title: "เข้าสู่ระบบสำเร็จ", description: `ยินดีต้อนรับ ${user.name}` });
      return true;
    } else {
      console.log('User not found or invalid credentials');
      toast({ 
        title: "เข้าสู่ระบบไม่สำเร็จ", 
        description: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", 
        variant: "destructive" 
      });
      return false;
    }
  }, [users, toast]);

  // ออกจากระบบ
  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('pos_session');
    toast({ title: "ออกจากระบบสำเร็จ", description: "ขอบคุณที่ใช้งาน" });
  }, [toast]);

  // ตรวจสอบสิทธิ์
  const hasPermission = useCallback((permission) => {
    if (!currentUser) return false;
    const userRole = ROLES[currentUser.role];
    return userRole?.permissions.includes(permission) || false;
  }, [currentUser]);

  // ตรวจสอบสิทธิ์หลายข้อ
  const hasAnyPermission = useCallback((permissions) => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  // ตรวจสอบสิทธิ์ทั้งหมด
  const hasAllPermissions = useCallback((permissions) => {
    return permissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  // เพิ่มผู้ใช้
  const addUser = useCallback((userData) => {
    const newUser = {
      ...userData,
      id: Date.now(),
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('pos_users', JSON.stringify(updatedUsers));
    
    toast({ title: "เพิ่มผู้ใช้สำเร็จ", description: `เพิ่มผู้ใช้ ${newUser.name} เรียบร้อยแล้ว` });
    return newUser;
  }, [users, toast]);

  // แก้ไขผู้ใช้
  const updateUser = useCallback((userId, userData) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, ...userData } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('pos_users', JSON.stringify(updatedUsers));
    
    // อัพเดท currentUser ถ้าเป็นผู้ใช้ปัจจุบัน
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(updatedUsers.find(u => u.id === userId));
    }
    
    toast({ title: "แก้ไขผู้ใช้สำเร็จ", description: "อัพเดทข้อมูลผู้ใช้เรียบร้อยแล้ว" });
  }, [users, currentUser, toast]);

  // ลบผู้ใช้
  const deleteUser = useCallback((userId) => {
    if (currentUser && currentUser.id === userId) {
      toast({ 
        title: "ไม่สามารถลบผู้ใช้ได้", 
        description: "ไม่สามารถลบบัญชีผู้ใช้ของตัวเองได้", 
        variant: "destructive" 
      });
      return false;
    }
    
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('pos_users', JSON.stringify(updatedUsers));
    
    toast({ title: "ลบผู้ใช้สำเร็จ", description: "ลบผู้ใช้เรียบร้อยแล้ว" });
    return true;
  }, [users, currentUser, toast]);

  // เปลี่ยนรหัสผ่าน
  const changePassword = useCallback((userId, currentPassword, newPassword) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      toast({ 
        title: "ไม่พบผู้ใช้", 
        description: "ไม่พบผู้ใช้ในระบบ", 
        variant: "destructive" 
      });
      return false;
    }
    
    if (user.password !== currentPassword) {
      toast({ 
        title: "รหัสผ่านไม่ถูกต้อง", 
        description: "รหัสผ่านปัจจุบันไม่ถูกต้อง", 
        variant: "destructive" 
      });
      return false;
    }
    
    updateUser(userId, { password: newPassword });
    toast({ title: "เปลี่ยนรหัสผ่านสำเร็จ", description: "รหัสผ่านใหม่ถูกบันทึกแล้ว" });
    return true;
  }, [users, updateUser, toast]);

  return {
    currentUser,
    users,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    addUser,
    updateUser,
    deleteUser,
    changePassword,
    PERMISSIONS,
    ROLES
  };
}; 