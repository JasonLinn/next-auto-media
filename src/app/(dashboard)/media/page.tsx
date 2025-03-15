'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUpload, FaGoogle, FaSearch, FaFilter, FaEllipsisV, FaPlay } from 'react-icons/fa';

type MediaItem = {
  id: number;
  title: string;
  type: 'video' | 'image';
  thumbnail: string;
  uploadedAt: string;
  duration?: string;
  size: string;
  source: 'upload' | 'google_drive';
};

export default function MediaLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'video' | 'image'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  
  // 模擬媒體數據
  const mediaItems: MediaItem[] = [
    {
      id: 1,
      title: '產品演示視頻.mp4',
      type: 'video',
      thumbnail: 'https://via.placeholder.com/300x200/2563eb/ffffff?text=產品演示',
      uploadedAt: '2025-03-10T11:00:00Z',
      duration: '2:45',
      size: '24.5 MB',
      source: 'upload'
    },
    {
      id: 2,
      title: '公司標誌.png',
      type: 'image',
      thumbnail: 'https://via.placeholder.com/300x200/10b981/ffffff?text=公司標誌',
      uploadedAt: '2025-03-08T09:30:00Z',
      size: '1.2 MB',
      source: 'upload'
    },
    {
      id: 3,
      title: '用戶見證.mp4',
      type: 'video',
      thumbnail: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=用戶見證',
      uploadedAt: '2025-03-05T14:15:00Z',
      duration: '3:12',
      size: '28.7 MB',
      source: 'google_drive'
    },
    {
      id: 4,
      title: '產品照片.jpg',
      type: 'image',
      thumbnail: 'https://via.placeholder.com/300x200/ef4444/ffffff?text=產品照片',
      uploadedAt: '2025-03-01T16:45:00Z',
      size: '3.5 MB',
      source: 'upload'
    },
    {
      id: 5,
      title: '團隊介紹.mp4',
      type: 'video',
      thumbnail: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=團隊介紹',
      uploadedAt: '2025-02-28T10:20:00Z',
      duration: '4:30',
      size: '42.1 MB',
      source: 'google_drive'
    },
    {
      id: 6,
      title: '活動海報.png',
      type: 'image',
      thumbnail: 'https://via.placeholder.com/300x200/ec4899/ffffff?text=活動海報',
      uploadedAt: '2025-02-25T13:10:00Z',
      size: '2.8 MB',
      source: 'upload'
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const filteredMedia = mediaItems
    .filter(item => {
      // 搜索過濾
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // 類型過濾
      if (filter !== 'all' && item.type !== filter) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // 排序
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case 'oldest':
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">媒體庫</h1>
        <div className="flex space-x-2">
          <Link 
            href="/drive" 
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaGoogle className="mr-2" />
            從 Google Drive 選擇
          </Link>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
            <FaUpload className="mr-2" />
            上傳媒體
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="搜索媒體..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="flex space-x-2">
            <div className="relative">
              <button className="flex items-center bg-gray-100 px-4 py-2 rounded-lg">
                <FaFilter className="mr-2" />
                過濾
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 hidden">
                <div className="p-2">
                  <button 
                    className={`w-full text-left px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-50 text-blue-500' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    所有媒體
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 rounded-lg ${filter === 'video' ? 'bg-blue-50 text-blue-500' : ''}`}
                    onClick={() => setFilter('video')}
                  >
                    只顯示視頻
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 rounded-lg ${filter === 'image' ? 'bg-blue-50 text-blue-500' : ''}`}
                    onClick={() => setFilter('image')}
                  >
                    只顯示圖片
                  </button>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <button className="flex items-center bg-gray-100 px-4 py-2 rounded-lg">
                排序: {sortBy === 'newest' ? '最新' : sortBy === 'oldest' ? '最舊' : '名稱'}
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 hidden">
                <div className="p-2">
                  <button 
                    className={`w-full text-left px-4 py-2 rounded-lg ${sortBy === 'newest' ? 'bg-blue-50 text-blue-500' : ''}`}
                    onClick={() => setSortBy('newest')}
                  >
                    最新上傳
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 rounded-lg ${sortBy === 'oldest' ? 'bg-blue-50 text-blue-500' : ''}`}
                    onClick={() => setSortBy('oldest')}
                  >
                    最舊上傳
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 rounded-lg ${sortBy === 'name' ? 'bg-blue-50 text-blue-500' : ''}`}
                    onClick={() => setSortBy('name')}
                  >
                    按名稱
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMedia.map(item => (
            <div key={item.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-video">
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black bg-opacity-50 rounded-full p-3">
                      <FaPlay className="text-white" />
                    </div>
                  </div>
                )}
                {item.duration && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {item.duration}
                  </div>
                )}
                {item.source === 'google_drive' && (
                  <div className="absolute top-2 left-2 bg-white p-1 rounded">
                    <FaGoogle className="text-red-500" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="truncate">
                    <h3 className="font-medium truncate" title={item.title}>{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(item.uploadedAt)}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <FaEllipsisV />
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>{item.type === 'video' ? '視頻' : '圖片'}</span>
                  <span>{item.size}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredMedia.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">沒有找到符合條件的媒體</p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center mx-auto">
              <FaUpload className="mr-2" />
              上傳新媒體
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 