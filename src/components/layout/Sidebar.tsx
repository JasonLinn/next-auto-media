'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaTachometerAlt, 
  FaCalendarAlt, 
  FaPhotoVideo, 
  FaGoogle, 
  FaPlus,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: '儀表板', path: '/dashboard', icon: <FaTachometerAlt /> },
    { name: '日曆', path: '/calendar', icon: <FaCalendarAlt /> },
    { name: '媒體庫', path: '/media', icon: <FaPhotoVideo /> },
    { name: 'Google Drive', path: '/drive', icon: <FaGoogle /> },
    { name: '新建發布', path: '/create', icon: <FaPlus /> },
    { name: '設置', path: '/settings', icon: <FaCog /> },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* 移動端漢堡菜單按鈕 */}
      <button 
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-500 text-white md:hidden"
        onClick={toggleMobileSidebar}
      >
        {isMobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* 移動端側邊欄背景遮罩 */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* 側邊欄 */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-white shadow-md z-50 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* 標誌 */}
          <div className="flex items-center justify-between p-4 border-b">
            {!isCollapsed && (
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                AutoMedia
              </Link>
            )}
            <button 
              className="p-2 rounded-md hover:bg-gray-100 hidden md:block"
              onClick={toggleSidebar}
            >
              {isCollapsed ? <FaBars /> : <FaTimes />}
            </button>
          </div>

          {/* 導航菜單 */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-2 px-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-600'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {!isCollapsed && <span className="ml-3">{item.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 底部登出按鈕 */}
          <div className="p-4 border-t">
            <button className={`flex items-center p-3 rounded-lg hover:bg-gray-100 w-full ${isCollapsed ? 'justify-center' : ''}`}>
              <FaSignOutAlt className="text-red-500" />
              {!isCollapsed && <span className="ml-3">登出</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
} 