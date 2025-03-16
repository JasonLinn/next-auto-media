'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaBell, FaUserCircle, FaSearch, FaChevronDown, FaYoutube, FaFacebookSquare, FaCalendarAlt } from 'react-icons/fa';

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };
  
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (isProfileOpen) setIsProfileOpen(false);
  };

  return (
    <header className="bg-white shadow-sm fixed top-0 right-0 left-0 z-30 md:left-64">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex-1 flex items-center">
          <div className="relative w-64 max-w-xs hidden md:block">
            <input
              type="text"
              placeholder="搜索..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* 通知按鈕 */}
          <div className="relative">
            <button 
              className="p-2 rounded-full hover:bg-gray-100 relative"
              onClick={toggleNotifications}
            >
              <FaBell className="text-gray-600" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-10 overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="font-medium">通知</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 border-b hover:bg-gray-50">
                    <div className="flex">
                      <div className="flex-shrink-0 mr-3">
                        <FaYoutube className="text-red-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">YouTube 發布成功</p>
                        <p className="text-xs text-gray-500">您的視頻「產品演示」已成功發布到 YouTube</p>
                        <p className="text-xs text-gray-400 mt-1">10 分鐘前</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-b hover:bg-gray-50">
                    <div className="flex">
                      <div className="flex-shrink-0 mr-3">
                        <FaFacebookSquare className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Facebook 發布失敗</p>
                        <p className="text-xs text-gray-500">您的帖子「促銷活動」發布失敗，請檢查連接</p>
                        <p className="text-xs text-gray-400 mt-1">1 小時前</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-gray-50">
                    <div className="flex">
                      <div className="flex-shrink-0 mr-3">
                        <FaCalendarAlt className="text-green-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">排程提醒</p>
                        <p className="text-xs text-gray-500">您有一個發布將在 30 分鐘後自動發布</p>
                        <p className="text-xs text-gray-400 mt-1">2 小時前</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-2 border-t text-center">
                  <Link href="/notifications" className="text-sm text-blue-500 hover:underline">
                    查看所有通知
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* 用戶資料 */}
          <div className="relative">
            <button 
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
              onClick={toggleProfile}
            >
              <FaUserCircle className="text-gray-600 text-2xl" />
              <span className="hidden md:block text-sm font-medium">張小明</span>
              <FaChevronDown className="hidden md:block text-gray-400 text-xs" />
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 overflow-hidden">
                <div className="p-4 border-b">
                  <p className="font-medium">張小明</p>
                  <p className="text-sm text-gray-500">admin@example.com</p>
                </div>
                <div>
                  <Link href="/profile" className="block p-4 hover:bg-gray-50">
                    個人資料
                  </Link>
                  <Link href="/settings" className="block p-4 hover:bg-gray-50">
                    設置
                  </Link>
                  <button className="block w-full text-left p-4 hover:bg-gray-50 text-red-500">
                    登出
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 