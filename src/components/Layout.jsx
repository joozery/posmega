import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Settings,
  QrCode,
  Menu,
  X,
  Store,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  User,
  Shield,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth, PERMISSIONS } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { settingsService } from '@/services/settingsService';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [storeSettings, setStoreSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, hasPermission } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(false);
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadStoreSettings = async () => {
      try {
        setLoadingSettings(true);
        const response = await settingsService.getSettings();
        const apiSettings = response.settings || {};
        
        // Map logo_url to logo for frontend compatibility
        if (apiSettings.system && apiSettings.system.logo_url) {
          apiSettings.system.logo = apiSettings.system.logo_url;
        }
        
        setStoreSettings(apiSettings.system || { storeName: 'Universal POS', logo: '' });
      } catch (error) {
        console.error('Error loading store settings:', error);
        // Fallback to default settings
        setStoreSettings({ storeName: 'Universal POS', logo: '' });
      } finally {
        setLoadingSettings(false);
      }
    };

    loadStoreSettings();
    
    const handleSettingsUpdate = () => loadStoreSettings();
    window.addEventListener('settings_updated', handleSettingsUpdate);
    
    return () => window.removeEventListener('settings_updated', handleSettingsUpdate);
  }, []);

  const navigation = [
    { name: 'แดชบอร์ด', href: '/dashboard', icon: LayoutDashboard, permission: PERMISSIONS.REPORTS_VIEW },
    { name: 'ขายสินค้า', href: '/pos', icon: ShoppingCart, permission: PERMISSIONS.POS_VIEW },
    { name: 'สินค้า', href: '/products', icon: Package, permission: PERMISSIONS.PRODUCTS_VIEW },
    { name: 'พิมพ์บาร์โค้ด', href: '/barcodes', icon: QrCode, permission: PERMISSIONS.BARCODES_VIEW },
    { name: 'ลูกค้า', href: '/customers', icon: Users, permission: PERMISSIONS.CUSTOMERS_VIEW },
    { name: 'ประวัติลูกค้า', href: '/customer-history', icon: User, permission: PERMISSIONS.CUSTOMERS_VIEW },
    { name: 'รายงาน', href: '/reports', icon: BarChart3, permission: PERMISSIONS.REPORTS_VIEW },
    { name: 'ประวัติการขาย', href: '/refund-history', icon: History, permission: PERMISSIONS.REPORTS_VIEW },
    { name: 'ผู้ใช้', href: '/users', icon: Shield, permission: PERMISSIONS.USERS_VIEW },
    { name: 'ตั้งค่า', href: '/settings', icon: Settings, permission: PERMISSIONS.SETTINGS_VIEW },
  ];

  const filteredNavigation = navigation.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const isActive = (href) => location.pathname === href;

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white shadow-lg flex-shrink-0 transition-all duration-300",
          "lg:relative",
          isCollapsed ? "w-20" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center justify-between px-6 border-b shrink-0">
             <motion.div animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }} className="flex items-center space-x-3 overflow-hidden">
              {loadingSettings ? (
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center shrink-0 animate-pulse">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {storeSettings?.logo ? (
                    <img 
                      src={storeSettings.logo} 
                      alt="Store Logo" 
                      className="w-10 h-10 object-contain rounded-lg shrink-0 border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0 ${storeSettings?.logo ? 'hidden' : ''}`}>
                    <Store className="w-6 h-6 text-white" />
                  </div>
                </>
              )}
              <span className="text-xl font-bold text-gray-900 whitespace-nowrap">
                {loadingSettings ? 'กำลังโหลด...' : (storeSettings?.storeName || 'Universal POS')}
              </span>
            </motion.div>
             <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className={cn("w-6 h-6", isCollapsed && "hidden")} />
             </Button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200`,
                    isActive
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    isCollapsed && 'justify-center'
                  )}
                  onClick={() => sidebarOpen && setSidebarOpen(false)}
                >
                  <item.icon className={cn(`h-6 w-6 shrink-0`, isActive ? 'text-blue-700' : 'text-gray-400', !isCollapsed && 'mr-4')} />
                   <AnimatePresence>
                    {!isCollapsed && (
                       <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="whitespace-nowrap"
                       >
                         {item.name}
                       </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </nav>

          <div className="border-t p-4 shrink-0">
             <Button 
                variant="ghost"
                className="w-full hidden lg:flex justify-start items-center" 
                onClick={() => setIsCollapsed(!isCollapsed)}>
                {isCollapsed ? <ChevronsRight className="w-6 h-6 mx-auto" /> : <><ChevronsLeft className="w-6 h-6 mr-4" /><span>ย่อเมนู</span></>}
            </Button>
            <div className={cn("flex items-center space-x-3 mt-4", isCollapsed && "justify-center")}>
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-semibold text-lg">{currentUser?.name?.charAt(0).toUpperCase()}</span>
              </div>
              {!isCollapsed && (
                 <div>
                    <p className="text-sm font-bold text-gray-900">{currentUser?.name}</p>
                    <p className="text-xs text-gray-500">{currentUser?.role}</p>
                  </div>
              )}
            </div>
            {!isCollapsed && (
              <Button variant="outline" size="sm" className="w-full mt-3" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                ออกจากระบบ
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-white px-4 sm:px-6 shadow-sm border-b shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <div className="flex-1" />
          <div className="text-sm text-gray-600 hidden sm:block">
            {new Date().toLocaleDateString('th-TH', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto scrollbar-hide">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;