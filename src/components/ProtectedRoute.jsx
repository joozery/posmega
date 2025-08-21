import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProtectedRoute = ({ children, requiredPermissions = [], fallback = null }) => {
  const { isAuthenticated, hasAllPermissions, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log('🚪 ProtectedRoute.handleLogout - starting logout...');
    await logout();
    console.log('🚪 ProtectedRoute.handleLogout - logout completed, reloading page');
    window.location.reload();
  };

  // ตรวจสอบการเข้าสู่ระบบ
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-gray-500 mb-4">คุณต้องเข้าสู่ระบบก่อนเข้าถึงหน้านี้</p>
          <Button onClick={() => window.location.reload()}>
            กลับไปหน้าเข้าสู่ระบบ
          </Button>
        </div>
      </div>
    );
  }

  // ตรวจสอบสิทธิ์
  if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center max-w-md mx-4">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-gray-500 mb-4">
            คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบหากต้องการสิทธิ์เพิ่มเติม
          </p>
          <div className="space-y-2">
            <Button variant="outline" onClick={() => window.history.back()}>
              กลับไปหน้าก่อนหน้า
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="ml-2">
              <LogOut className="w-4 h-4 mr-2" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute; 