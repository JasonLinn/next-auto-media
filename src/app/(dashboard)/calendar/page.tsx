'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaPlus, FaFacebookSquare, FaYoutube, FaTiktok } from 'react-icons/fa';
import Calendar from 'react-calendar';
import '@/styles/calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function CalendarPage() {
  const [date, setDate] = useState<Value>(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['所有平台']);
  
  // 模擬排程發布數據
  const scheduledPosts = [
    { id: 1, title: '新產品發布', platform: 'YouTube', scheduledFor: new Date(2025, 2, 20, 10, 0), status: 'scheduled' },
    { id: 2, title: '促銷活動', platform: 'Facebook', scheduledFor: new Date(2025, 2, 22, 14, 30), status: 'scheduled' },
    { id: 3, title: '短片教學', platform: 'TikTok', scheduledFor: new Date(2025, 2, 25, 9, 15), status: 'scheduled' },
    { id: 4, title: '用戶問答', platform: 'YouTube', scheduledFor: new Date(2025, 2, 15, 16, 0), status: 'scheduled' },
    { id: 5, title: '產品更新', platform: 'Facebook', scheduledFor: new Date(2025, 2, 18, 11, 45), status: 'scheduled' },
  ];

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => 
      isSameDay(post.scheduledFor, date) && 
      (selectedPlatforms.includes('所有平台') || selectedPlatforms.includes(post.platform))
    );
  };

  const tileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view !== 'month') return null;
    
    const postsForDate = getPostsForDate(date);
    if (postsForDate.length === 0) return null;
    
    return (
      <div className="flex flex-wrap mt-1">
        {postsForDate.map(post => (
          <div key={post.id} className="w-full mb-1">
            <div className="flex items-center text-xs">
              {getPlatformIcon(post.platform)}
              <span className="ml-1 truncate">{post.title}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handlePlatformFilter = (platform: string) => {
    if (platform === '所有平台') {
      setSelectedPlatforms(['所有平台']);
    } else {
      const newSelectedPlatforms = selectedPlatforms.includes('所有平台')
        ? [platform]
        : selectedPlatforms.includes(platform)
          ? selectedPlatforms.filter(p => p !== platform)
          : [...selectedPlatforms, platform];
      
      setSelectedPlatforms(newSelectedPlatforms.length ? newSelectedPlatforms : ['所有平台']);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">排程日曆</h1>
        <Link 
          href="/create" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FaPlus className="mr-2" />
          新建發布
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex space-x-2 mb-4 md:mb-0">
            <button 
              className={`px-4 py-2 rounded-lg ${view === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setView('month')}
            >
              月視圖
            </button>
            <button 
              className={`px-4 py-2 rounded-lg ${view === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setView('week')}
            >
              週視圖
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-3 py-1 rounded-lg text-sm flex items-center ${selectedPlatforms.includes('所有平台') ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
              onClick={() => handlePlatformFilter('所有平台')}
            >
              所有平台
            </button>
            <button 
              className={`px-3 py-1 rounded-lg text-sm flex items-center ${selectedPlatforms.includes('YouTube') ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
              onClick={() => handlePlatformFilter('YouTube')}
            >
              <FaYoutube className="mr-1" /> YouTube
            </button>
            <button 
              className={`px-3 py-1 rounded-lg text-sm flex items-center ${selectedPlatforms.includes('Facebook') ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => handlePlatformFilter('Facebook')}
            >
              <FaFacebookSquare className="mr-1" /> Facebook
            </button>
            <button 
              className={`px-3 py-1 rounded-lg text-sm flex items-center ${selectedPlatforms.includes('TikTok') ? 'bg-black text-white' : 'bg-gray-200'}`}
              onClick={() => handlePlatformFilter('TikTok')}
            >
              <FaTiktok className="mr-1" /> TikTok
            </button>
          </div>
        </div>
        
        <div className="calendar-container">
          <Calendar 
            onChange={setDate} 
            value={date} 
            view={view === 'month' ? 'month' : 'month'}
            tileContent={tileContent}
            className="w-full border-0"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {date instanceof Date 
            ? date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }) 
            : '選擇的日期'}
        </h2>
        
        {date instanceof Date && (
          <div className="space-y-4">
            {getPostsForDate(date).length > 0 ? (
              getPostsForDate(date).map(post => (
                <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{post.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        {getPlatformIcon(post.platform)}
                        <span className="ml-2">{post.platform}</span>
                        <span className="mx-2">•</span>
                        <span>{formatTime(post.scheduledFor)}</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      已排程
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>這一天沒有排程發布</p>
                <Link href="/create" className="text-blue-500 hover:underline mt-2 inline-block">
                  + 新建發布
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}