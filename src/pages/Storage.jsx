import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  HardDrive,
  Image,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Database,
  TrendingUp,
  Calendar,
  Download,
  Eye,
  Folder
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth, PERMISSIONS } from '@/hooks/useAuth';
import { storageService } from '@/services/storageService';

const Storage = () => {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const [storageData, setStorageData] = useState(null);
  const [resourcesData, setResourcesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [cleanupResults, setCleanupResults] = useState(null);

  // ดึงข้อมูลการใช้พื้นที่
  useEffect(() => {
    fetchStorageData();
  }, []);

  const fetchStorageData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usage, resources] = await Promise.all([
        storageService.getStorageUsage(),
        storageService.getResources({ limit: 20 })
      ]);
      
      setStorageData(usage);
      setResourcesData(resources);
      
      console.log('✅ Storage data loaded successfully');
      
    } catch (error) {
      console.error('❌ Error fetching storage data:', error);
      setError('ไม่สามารถโหลดข้อมูลการใช้พื้นที่ได้');
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลการใช้พื้นที่ได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async (dryRun = true) => {
    if (!hasPermission(PERMISSIONS.SETTINGS_MANAGE)) {
      toast({
        title: "ไม่มีสิทธิ์",
        description: "คุณไม่มีสิทธิ์ในการจัดการพื้นที่เก็บข้อมูล",
        variant: "destructive"
      });
      return;
    }

    try {
      setCleanupLoading(true);
      
      const result = await storageService.cleanupUnusedImages(dryRun);
      setCleanupResults(result);
      
      toast({
        title: dryRun ? "วิเคราะห์เสร็จสิ้น" : "ล้างข้อมูลเสร็จสิ้น",
        description: dryRun 
          ? `พบไฟล์ที่ไม่ใช้ ${result.analysis.unusedImages} ไฟล์`
          : `ลบไฟล์ที่ไม่ใช้ ${result.cleanup.deletedCount} ไฟล์`,
        variant: "default"
      });

      // รีเฟรชข้อมูลหลังจากลบ
      if (!dryRun) {
        await fetchStorageData();
      }
      
    } catch (error) {
      console.error('❌ Cleanup error:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถล้างข้อมูลได้",
        variant: "destructive"
      });
    } finally {
      setCleanupLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStorageStatusColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 80) return 'text-orange-600 bg-orange-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStorageStatusIcon = (percentage) => {
    if (percentage >= 90) return <AlertTriangle className="w-5 h-5" />;
    if (percentage >= 80) return <TrendingUp className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">จัดการพื้นที่เก็บข้อมูล</h1>
            <p className="text-gray-600 mt-1">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">จัดการพื้นที่เก็บข้อมูล</h1>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
          <Button onClick={fetchStorageData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            ลองใหม่อีกครั้ง
          </Button>
        </div>
      </div>
    );
  }

  const cloudinaryData = storageData?.cloudinary || {};
  const dbData = storageData?.database || {};
  const summary = storageData?.summary || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการพื้นที่เก็บข้อมูล</h1>
          <p className="text-gray-600 mt-1">ตรวจสอบและจัดการไฟล์ภาพในระบบ</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={fetchStorageData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            รีเฟรช
          </Button>
          {hasPermission(PERMISSIONS.SETTINGS_MANAGE) && (
            <Button 
              variant="outline" 
              onClick={() => handleCleanup(true)}
              disabled={cleanupLoading}
            >
              <Eye className="w-4 h-4 mr-2" />
              วิเคราะห์ไฟล์ที่ไม่ใช้
            </Button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Storage Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${getStorageStatusColor(cloudinaryData.storage?.percentage || 0)}`}>
              <HardDrive className="w-6 h-6" />
            </div>
            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStorageStatusColor(cloudinaryData.storage?.percentage || 0)}`}>
              {getStorageStatusIcon(cloudinaryData.storage?.percentage || 0)}
              <span className="ml-1">{(cloudinaryData.storage?.percentage || 0).toFixed(1)}%</span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {cloudinaryData.storage?.usedMB?.toFixed(2) || '0'} MB
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              จากทั้งหมด {cloudinaryData.storage?.limitMB?.toFixed(2) || '0'} MB
            </p>
            <div className="mt-3 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(cloudinaryData.storage?.percentage || 0, 100)}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Bandwidth Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-50">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-600">
              <span>{(cloudinaryData.bandwidth?.percentage || 0).toFixed(1)}%</span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {cloudinaryData.bandwidth?.usedMB?.toFixed(2) || '0'} MB
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Bandwidth ใช้ไปแล้ว
            </p>
            <div className="mt-3 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(cloudinaryData.bandwidth?.percentage || 0, 100)}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Database Images */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-50">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-600">
              <Image className="w-4 h-4 mr-1" />
              {dbData.uniqueImages || 0}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {dbData.productsWithImages || 0}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              สินค้าที่มีรูปภาพ จากทั้งหมด {dbData.totalProducts || 0} สินค้า
            </p>
            <div className="mt-3 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${dbData.imagesPercentage || 0}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'ภาพรวม', icon: Cloud },
              { id: 'resources', name: 'ไฟล์ภาพ', icon: Image },
              { id: 'cleanup', name: 'ล้างข้อมูล', icon: Trash2 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Cloudinary Info */}
              {cloudinaryData.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-red-800 font-medium">ไม่สามารถเชื่อมต่อ Cloudinary ได้</span>
                  </div>
                  <p className="text-red-700 text-sm mt-1">{cloudinaryData.message}</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    อัพเดทล่าสุด
                  </h3>
                  <p className="text-sm text-gray-600">
                    {cloudinaryData.last_updated 
                      ? new Date(cloudinaryData.last_updated).toLocaleString('th-TH')
                      : 'ไม่ทราบ'
                    }
                  </p>
                </div>
              )}

              {/* Folders Info */}
              {storageData?.folders && !storageData.folders.error && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Folder className="w-5 h-5 mr-2" />
                    โฟลเดอร์ที่ใช้งาน
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{storageData.folders.mainFolder}</span>
                      <span className="text-sm text-gray-500">โฟลเดอร์หลัก</span>
                    </div>
                    {storageData.folders.subFolders?.map((folder, index) => (
                      <div key={index} className="flex items-center justify-between pl-4">
                        <span className="text-gray-700">↳ {folder.name}</span>
                        <span className="text-sm text-gray-500">โฟลเดอร์ย่อย</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'resources' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">ไฟล์ภาพล่าสุด</h3>
                <span className="text-sm text-gray-500">
                  {resourcesData?.totalCount || 0} ไฟล์ทั้งหมด ({resourcesData?.totalSizeMB?.toFixed(2) || 0} MB)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resourcesData?.resources?.map((resource, index) => (
                  <motion.div
                    key={resource.publicId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <img
                        src={resource.url}
                        alt="Product"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {resource.publicId.split('/').pop()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {resource.width} × {resource.height} • {resource.format.toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {resource.sizeMB} MB • {new Date(resource.createdAt).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {resourcesData?.hasMore && (
                <div className="text-center">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Implement load more functionality
                      toast({
                        title: "กำลังพัฒนา",
                        description: "ฟีเจอร์นี้อยู่ระหว่างการพัฒนา",
                        variant: "default"
                      });
                    }}
                  >
                    โหลดเพิ่มเติม
                  </Button>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'cleanup' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 font-medium">คำเตือน</span>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  การล้างข้อมูลจะลบไฟล์ภาพที่ไม่ได้ใช้งานในฐานข้อมูลออกจาก Cloudinary อย่างถาวร
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => handleCleanup(true)}
                    disabled={cleanupLoading}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {cleanupLoading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์ไฟล์ที่ไม่ใช้'}
                  </Button>
                  
                  {hasPermission(PERMISSIONS.SETTINGS_MANAGE) && cleanupResults && (
                    <Button 
                      variant="destructive"
                      onClick={() => handleCleanup(false)}
                      disabled={cleanupLoading || cleanupResults.analysis.unusedImages === 0}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {cleanupLoading ? 'กำลังลบ...' : 'ลบไฟล์ที่ไม่ใช้'}
                    </Button>
                  )}
                </div>

                {cleanupResults && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">ผลการวิเคราะห์</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {cleanupResults.analysis.totalCloudinaryImages}
                        </p>
                        <p className="text-sm text-gray-600">ไฟล์ใน Cloudinary</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {cleanupResults.analysis.totalDatabaseImages}
                        </p>
                        <p className="text-sm text-gray-600">ไฟล์ที่ใช้งาน</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {cleanupResults.analysis.unusedImages}
                        </p>
                        <p className="text-sm text-gray-600">ไฟล์ที่ไม่ใช้ ({cleanupResults.analysis.unusedSizeMB} MB)</p>
                      </div>
                    </div>

                    {cleanupResults.cleanup.deletedCount > 0 && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 font-medium">
                          ลบไฟล์เสร็จสิ้น: {cleanupResults.cleanup.deletedCount} ไฟล์ 
                          (ประหยัดพื้นที่ {cleanupResults.cleanup.totalSizeFreedMB} MB)
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Storage;
