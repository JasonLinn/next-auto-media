'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaCalendarAlt, FaPhotoVideo, FaGoogle, FaFacebookSquare, FaYoutube, FaTiktok } from 'react-icons/fa';

export default function Dashboard() {
  const [upcomingPosts, setUpcomingPosts] = useState([
    { id: 1, title: '新產品發布', platform: 'YouTube', scheduledFor: '2025-03-20T10:00:00Z', status: 'scheduled' },
    { id: 2, title: '促銷活動', platform: 'Facebook', scheduledFor: '2025-03-22T14:30:00Z', status: 'scheduled' },
    { id: 3, title: '短片教學', platform: 'TikTok', scheduledFor: '2025-03-25T09:15:00Z', status: 'scheduled' },
  ]);

  const [recentPosts, setRecentPosts] = useState([
    { id: 4, title: '公司更新', platform: 'YouTube', publishedAt: '2025-03-10T11:00:00Z', status: 'published', views: 1240 },
    { id: 5, title: '用戶見證', platform: 'Facebook', publishedAt: '2025-03-12T15:45:00Z', status: 'published', likes: 89 },
    { id: 6, title: '產品示範', platform: 'TikTok', publishedAt: '2025-03-15T08:30:00Z', status: 'published', views: 3500 },
  ]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'YouTube':
        return <FaYoutube className="text-red-600" />;
      case 'Facebook':
        return <FaFacebookSquare className="text-blue-600" />;
      case 'TikTok':
        return <FaTiktok className="text-black" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">儀表板</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">快速統計</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">排程發布</p>
              <p className="text-2xl font-bold">{upcomingPosts.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">已發布</p>
              <p className="text-2xl font-bold">{recentPosts.length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">媒體檔案</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">已連接平台</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">快速操作</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/calendar" className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
              <FaCalendarAlt className="text-2xl mb-2 text-blue-500" />
              <span>查看日曆</span>
            </Link>
            <Link href="/media" className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
              <FaPhotoVideo className="text-2xl mb-2 text-purple-500" />
              <span>媒體庫</span>
            </Link>
            <Link href="/drive" className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
              <FaGoogle className="text-2xl mb-2 text-red-500" />
              <span>Google Drive</span>
            </Link>
            <Link href="/create" className="flex flex-col items-center justify-center bg-blue-500 p-4 rounded-lg hover:bg-blue-600 transition-colors text-white">
              <span className="text-2xl mb-2">+</span>
              <span>新建發布</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">即將發布</h2>
            <Link href="/calendar" className="text-blue-500 hover:underline">查看全部</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">標題</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平台</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排程時間</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingPosts.map((post) => (
                  <tr key={post.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{post.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {getPlatformIcon(post.platform)}
                        <span className="ml-2">{post.platform}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(post.scheduledFor)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        已排程
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">最近發布</h2>
            <Link href="/posts" className="text-blue-500 hover:underline">查看全部</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">標題</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平台</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">發布時間</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">表現</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentPosts.map((post) => (
                  <tr key={post.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{post.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {getPlatformIcon(post.platform)}
                        <span className="ml-2">{post.platform}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(post.publishedAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.views ? `${post.views} 次觀看` : `${post.likes} 個讚`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 