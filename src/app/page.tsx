"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FaUpload, FaYoutube } from 'react-icons/fa';
import { MdDashboard, MdPhoto, MdVideoLibrary } from 'react-icons/md';
import { FaFolder } from 'react-icons/fa';
import YoutubeDirectUpload from '@/components/social/YouTubeDirectUpload';
import TikTokDirectUpload from '@/components/social/TikTokDirectUpload';

export default function Home() {
  const { data: session, status } = useSession();
  
  const features = [
    {
      title: '影片上傳',
      description: '輕鬆上傳影片至YouTube平台',
      icon: <FaUpload className="text-4xl text-red-500" />,
      href: '/create',
      color: 'bg-red-50',
    },
    {
      title: '檔案管理',
      description: '管理Google Drive雲端檔案',
      icon: <FaFolder className="text-4xl text-blue-500" />,
      href: '/drive',
      color: 'bg-blue-50',
    },
    {
      title: '媒體庫',
      description: '整理並管理您的所有媒體內容',
      icon: <MdPhoto className="text-4xl text-green-500" />,
      href: '/media',
      color: 'bg-green-50',
    },
    {
      title: '數據分析',
      description: '查看媒體表現數據及見解',
      icon: <MdDashboard className="text-4xl text-purple-500" />,
      href: '/dashboard',
      color: 'bg-purple-50',
    },
  ];

  return (
    <main className="flex min-h-screen flex-col">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Next Auto Media</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-center">媒體管理</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/dashboard" 
                className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 flex flex-col items-center text-center hover:shadow-md transition-all"
              >
                <MdDashboard className="text-3xl text-blue-500 mb-2" />
                <span className="text-blue-800 font-medium">儀表板</span>
              </Link>
              <Link 
                href="/photo" 
                className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200 flex flex-col items-center text-center hover:shadow-md transition-all"
              >
                <MdPhoto className="text-3xl text-indigo-500 mb-2" />
                <span className="text-indigo-800 font-medium">照片庫</span>
              </Link>
              <Link 
                href="/video" 
                className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 flex flex-col items-center text-center hover:shadow-md transition-all"
              >
                <MdVideoLibrary className="text-3xl text-purple-500 mb-2" />
                <span className="text-purple-800 font-medium">影片庫</span>
              </Link>
              <Link 
                href="/drive" 
                className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 flex flex-col items-center text-center hover:shadow-md transition-all"
              >
                <FaFolder className="text-3xl text-green-500 mb-2" />
                <span className="text-green-800 font-medium">雲端硬碟</span>
              </Link>
            </div>
          </section>
          
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-center">使用說明</h2>
            <div className="prose prose-blue">
              <p>Next Auto Media 是一個全功能的媒體管理和發布平台，可以幫助您：</p>
              <ul>
                <li>整合 Google Drive 雲端硬碟</li>
                <li>一鍵同步內容到社交平台</li>
                <li>自動排程發佈內容</li>
                <li>管理您的照片和影片庫</li>
                <li>追蹤內容表現數據</li>
              </ul>
              <p>點擊左側的功能卡片開始使用各項功能。</p>
            </div>
          </section>
        </div>
        
        <h2 className="text-2xl font-bold mb-6 text-center">社群平台上傳</h2>
        <div className="grid grid-cols-1 gap-8 mb-8">
          <YoutubeDirectUpload />
          <TikTokDirectUpload />
        </div>
      </div>
    </main>
  );
}
