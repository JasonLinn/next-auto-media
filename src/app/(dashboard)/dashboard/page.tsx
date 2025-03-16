'use client';

import { useState } from 'react';
import { FaYoutube, FaFacebook, FaInstagram, FaTiktok, FaTwitter } from 'react-icons/fa';
import Link from 'next/link';

export default function Dashboard() {
  // 使用 useState 但不使用 setter 函數，可以使用 _ 來忽略
  const [upcomingPosts, _] = useState([
    { id: 1, title: '新產品發布', platform: 'YouTube', scheduledTime: '2025-03-20T14:00:00', status: 'scheduled' },
    { id: 2, title: '促銷活動', platform: 'Facebook', scheduledTime: '2025-03-21T10:30:00', status: 'scheduled' },
    { id: 3, title: '用戶評價分享', platform: 'Instagram', scheduledTime: '2025-03-22T16:00:00', status: 'scheduled' },
  ]);
  
  // 使用 useState 但不使用 setter 函數，可以使用 _ 來忽略
  const [recentPosts, __] = useState([
    { id: 4, title: '產品教學', platform: 'YouTube', publishedTime: '2025-03-15T11:00:00', status: 'published' },
    { id: 5, title: '客戶案例', platform: 'Twitter', publishedTime: '2025-03-14T09:15:00', status: 'published' },
    { id: 6, title: '幕後花絮', platform: 'TikTok', publishedTime: '2025-03-13T15:30:00', status: 'published' },
  ]);

  // 獲取平台圖標
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return <FaYoutube className="text-red-600" />;
      case 'facebook':
        return <FaFacebook className="text-blue-600" />;
      case 'instagram':
        return <FaInstagram className="text-pink-600" />;
      case 'tiktok':
        return <FaTiktok className="text-black" />;
      case 'twitter':
        return <FaTwitter className="text-blue-400" />;
      default:
        return null;
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">儀表板</h1>
      
      {/* 快速統計 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-2">本月發布</h3>
          <p className="text-3xl font-bold">12</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-2">排程中</h3>
          <p className="text-3xl font-bold">8</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-2">總觀看次數</h3>
          <p className="text-3xl font-bold">24,583</p>
        </div>
      </div>
      
      {/* 快速操作 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">快速操作</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/upload" className="bg-blue-500 text-white rounded-lg p-4 text-center hover:bg-blue-600 transition">
            上傳新內容
          </Link>
          <Link href="/schedule" className="bg-green-500 text-white rounded-lg p-4 text-center hover:bg-green-600 transition">
            排程發布
          </Link>
          <Link href="/analytics" className="bg-purple-500 text-white rounded-lg p-4 text-center hover:bg-purple-600 transition">
            查看分析
          </Link>
          <Link href="/settings" className="bg-gray-500 text-white rounded-lg p-4 text-center hover:bg-gray-600 transition">
            帳號設置
          </Link>
        </div>
      </div>
      
      {/* 即將發布 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">即將發布</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 text-left">標題</th>
                <th className="py-3 px-4 text-left">平台</th>
                <th className="py-3 px-4 text-left">排程時間</th>
                <th className="py-3 px-4 text-left">狀態</th>
                <th className="py-3 px-4 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {upcomingPosts.map(post => (
                <tr key={post.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{post.title}</td>
                  <td className="py-3 px-4 flex items-center">
                    <span className="mr-2">{getPlatformIcon(post.platform)}</span>
                    {post.platform}
                  </td>
                  <td className="py-3 px-4">{formatDate(post.scheduledTime)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      排程中
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-blue-500 hover:underline mr-3">編輯</button>
                    <button className="text-red-500 hover:underline">取消</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 最近發布 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">最近發布</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 text-left">標題</th>
                <th className="py-3 px-4 text-left">平台</th>
                <th className="py-3 px-4 text-left">發布時間</th>
                <th className="py-3 px-4 text-left">狀態</th>
                <th className="py-3 px-4 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {recentPosts.map(post => (
                <tr key={post.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{post.title}</td>
                  <td className="py-3 px-4 flex items-center">
                    <span className="mr-2">{getPlatformIcon(post.platform)}</span>
                    {post.platform}
                  </td>
                  <td className="py-3 px-4">{formatDate(post.publishedTime)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      已發布
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-blue-500 hover:underline mr-3">查看</button>
                    <button className="text-purple-500 hover:underline">分析</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 